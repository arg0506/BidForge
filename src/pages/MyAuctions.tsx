import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User2, Wallet, Coins, RefreshCw, Layers, ShieldAlert, Gavel, Loader2, Play } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { AuctionCard } from '../components/AuctionCard';
import { EmptyState } from '../components/EmptyState';
import toast from 'react-hot-toast';

interface MyAuctionsProps {
  onSelectAuction: (id: number) => void;
  onNavigate: (view: string) => void;
}

export const MyAuctions: React.FC<MyAuctionsProps> = ({ onSelectAuction, onNavigate }) => {
  const { 
    auctions, 
    account, 
    pendingReturns, 
    withdrawRefund, 
    endAuction,
    isConnected,
    connectWallet
  } = useWeb3();

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSettling, setIsSettling] = useState<Record<number, boolean>>({});

  // Filter listings
  const myCreatedAuctions = auctions.filter(a => 
    account && a.seller.toLowerCase() === account.toLowerCase()
  );

  const activeCreated = myCreatedAuctions.filter(a => a.active && a.endTime > Math.floor(Date.now() / 1000));
  const closedCreated = myCreatedAuctions.filter(a => a.ended || a.endTime <= Math.floor(Date.now() / 1000));

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (parseFloat(pendingReturns) <= 0) {
      toast.error("No refundable balance to withdraw!");
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawRefund();
    } catch (err: any) {
      toast.error(err.message || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleSettle = async (id: number) => {
    setIsSettling(prev => ({ ...prev, [id]: true }));
    try {
      await endAuction(id);
    } catch (err: any) {
      toast.error(err.message || "Settlement failed");
    } finally {
      setIsSettling(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8 relative">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User2 className="h-5.5 w-5.5 text-indigo-400 shrink-0" />
          Sellers Portfolio & Claims Dashboard
        </h2>
        <p className="text-xs text-gray-400">Track listings, withdraw refundable outbids, and finalize expired pools.</p>
      </div>

      {/* Claimable Returns & Refund Withdraw Panel (Pull-Payments Integration) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Refund Withdrawal card */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-tr from-[#1E1B4B]/80 to-[#0F172A]/90 p-6 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/10 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0 border border-indigo-500/25">
              <Coins className="h-5.5 w-5.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Trustless Refund Portal</h3>
              <p className="text-[10px] text-gray-400">Claims for refundable outbids (Security Pull payments pattern)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Claimable Refundable Balance</span>
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono flex items-baseline gap-1.5 mt-1">
                {pendingReturns} <span className="text-xs font-semibold text-indigo-400">ETH</span>
              </span>
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWithdraw}
              disabled={isWithdrawing || parseFloat(pendingReturns) <= 0}
              className={`px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${parseFloat(pendingReturns) <= 0 ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/15'}`}
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Withdraw...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Withdraw Refund returns</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Instructive Pull Payment explanation */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/50 p-5 space-y-3.5 text-xs text-gray-400 leading-relaxed backdrop-blur">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
            Pull Payments Security Spec
          </h4>
          <p>
            To block malicious reentrancy hacks or DoS locks (e.g. an attacker rejecting returned ETH transfers to break execution), outbid funds are **never auto-pushed** to wallets.
          </p>
          <p>
            Instead, funds are securely warehoused in local contract storage mapped to your address. Click <strong className="text-white">Withdraw Refund returns</strong> to claim your funds securely.
          </p>
        </div>

      </div>

      {/* Grid displays of Listings */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">My Auction Listings ({myCreatedAuctions.length})</h3>
        </div>

        {myCreatedAuctions.length === 0 ? (
          <EmptyState
            title="No Auctions Registered"
            description="You have not deployed any items onto the blockchain network yet. Launch a new contract listing to see it tracked here!"
            icon="inbox"
            action={{
              label: "Launch First Auction",
              onClick: () => onNavigate('create')
            }}
          />
        ) : (
          <div className="space-y-8">
            
            {/* Active section */}
            {activeCreated.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded text-indigo-400 font-bold uppercase tracking-wider inline-block">
                  Active Bidding Listings ({activeCreated.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCreated.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onSelect={onSelectAuction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Closed section */}
            {closedCreated.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] bg-gray-500/10 border border-white/5 px-2.5 py-1 rounded text-gray-400 font-bold uppercase tracking-wider inline-block">
                  Expired / Needs Settlement ({closedCreated.length})
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {closedCreated.map((auction) => {
                    const needsSettlement = auction.active && !auction.ended;
                    const isSettled = auction.ended;
                    const hasWinner = parseFloat(auction.highestBid) > 0;
                    return (
                      <div 
                        key={auction.id}
                        className="rounded-2xl border border-white/5 bg-[#0F172A]/75 p-5 flex flex-col justify-between space-y-4 shadow-xl"
                      >
                        <div className="flex gap-3">
                          <img 
                            src={auction.imageUri} 
                            alt={auction.title} 
                            className="h-14 w-14 rounded-lg object-cover border border-white/5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1 overflow-hidden">
                            <span className="text-[9px] font-mono text-gray-500 block">Listing ID: #{auction.id}</span>
                            <h4 className="text-xs font-bold text-white truncate leading-tight">{auction.title}</h4>
                            <span className="text-[10px] text-gray-400 block font-semibold">
                              {hasWinner ? `Highest Bid: ${auction.highestBid} ETH` : 'Reserve Unmet'}
                            </span>
                          </div>
                        </div>

                        {/* Settlement Status details */}
                        <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between text-xs text-gray-400">
                          <span>Status:</span>
                          <span className={`font-bold ${isSettled ? 'text-gray-400 uppercase tracking-widest text-[10px]' : 'text-amber-400'}`}>
                            {isSettled ? 'Settled & Paid' : 'Pending Settlement'}
                          </span>
                        </div>

                        {/* Action Settler */}
                        {needsSettlement ? (
                          <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSettle(auction.id)}
                            disabled={isSettling[auction.id]}
                            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-[10px] font-bold text-white uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-600/10"
                          >
                            {isSettling[auction.id] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            <span>Settle Auction & Claim payout</span>
                          </motion.button>
                        ) : (
                          <button
                            onClick={() => onSelectAuction(auction.id)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-gray-300 rounded-xl cursor-pointer"
                          >
                            View Results Detail
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};
