import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, HelpCircle, Loader2, Info, Cpu } from 'lucide-react';
import { Auction } from '../types';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
}

export const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose, auction }) => {
  const { placeBid, balance, isConnected, connectWallet, smartBids, setSmartBid } = useWeb3();
  
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const existingSmartBid = smartBids[auction.id];
  const [isSmartEnabled, setIsSmartEnabled] = useState<boolean>(false);
  const [maxBid, setMaxBid] = useState<string>("");
  const [smartError, setSmartError] = useState<string | null>(null);

  const highestBidFloat = parseFloat(auction.highestBid);
  const currentPrice = highestBidFloat > 0 ? highestBidFloat : parseFloat(auction.startingPrice);
  const minBidRequired = highestBidFloat === 0 ? currentPrice : currentPrice + 0.005; // 0.005 ETH minimum increment

  // Auto-fill minimum bid required and smart bid state
  useEffect(() => {
    if (isOpen) {
      setBidAmount(minBidRequired.toFixed(3));
      setError(null);
      if (existingSmartBid) {
        setIsSmartEnabled(existingSmartBid.active);
        setMaxBid(existingSmartBid.maxBid);
      } else {
        setIsSmartEnabled(false);
        setMaxBid((minBidRequired + 0.1).toFixed(3));
        setSmartError(null);
      }
    }
  }, [isOpen, minBidRequired, existingSmartBid]);

  if (!isOpen) return null;

  // Real-time input validation helper
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);
    
    const floatVal = parseFloat(value);
    if (isNaN(floatVal)) {
      setError("Please enter a valid number");
    } else if (floatVal <= 0) {
      setError("Bid must be greater than 0");
    } else if (floatVal < minBidRequired) {
      setError(`Minimum bid required is ${minBidRequired.toFixed(3)} ETH`);
    } else if (parseFloat(balance) < floatVal) {
      setError(`Insufficient funds (Your balance: ${balance} ETH)`);
    } else {
      setError(null);
      // Automatically adjust max bid if it is lower than the new bid amount
      const floatMax = parseFloat(maxBid);
      if (!isNaN(floatMax) && floatMax < floatVal) {
        setMaxBid((floatVal + 0.05).toFixed(3));
        setSmartError(null);
      }
    }
  };

  const handleMaxBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxBid(value);
    
    const floatMax = parseFloat(value);
    const floatBid = parseFloat(bidAmount) || minBidRequired;
    if (isNaN(floatMax)) {
      setSmartError("Please enter a valid limit");
    } else if (floatMax < floatBid) {
      setSmartError(`Limit must be at least your bid amount of ${floatBid.toFixed(3)} ETH`);
    } else {
      setSmartError(null);
    }
  };

  const handleSetMinBid = () => {
    setBidAmount(minBidRequired.toFixed(3));
    setError(null);
  };

  const handleAddEth = (addAmount: number) => {
    const current = parseFloat(bidAmount) || minBidRequired;
    const newAmount = current + addAmount;
    setBidAmount(newAmount.toFixed(3));
    setError(null);
    
    // Automatically adjust max bid if it is lower than the new bid amount
    const floatMax = parseFloat(maxBid);
    if (!isNaN(floatMax) && floatMax < newAmount) {
      setMaxBid((newAmount + 0.05).toFixed(3));
      setSmartError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      connectWallet('virtual');
      return;
    }

    const floatVal = parseFloat(bidAmount);
    if (isNaN(floatVal) || floatVal < minBidRequired) {
      toast.error(`Invalid bid amount. Must be at least ${minBidRequired.toFixed(3)} ETH`);
      return;
    }

    if (isSmartEnabled) {
      const floatMaxBid = parseFloat(maxBid);
      if (isNaN(floatMaxBid) || floatMaxBid < floatVal) {
        toast.error("Smart Bid limit must be greater than or equal to your bid amount");
        return;
      }
    }

    setIsPending(true);
    try {
      // Configure Smart Bid first or simultaneously
      if (isSmartEnabled) {
        setSmartBid(auction.id, maxBid, true);
      } else {
        setSmartBid(auction.id, "0", false);
      }

      await placeBid(auction.id, bidAmount);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Bidding failed");
    } finally {
      setIsPending(false);
    }
  };

  const mockGas = 0.0012; // 0.0012 ETH mock gas
  const totalCost = (parseFloat(bidAmount) || 0) + mockGas;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070B14]/85 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-violet-500/10 blur-xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <h3 className="text-md font-bold text-white">Place a Real-Time Bid</h3>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-white/5 p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 rounded-xl bg-[#1E293B]/60 border border-white/5 p-3 flex gap-3 items-start">
          <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10">
            <img 
              src={auction.imageUri} 
              alt={auction.title} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <span className="text-[10px] text-gray-500 font-mono block">Listing #{auction.id}</span>
            <h4 className="text-xs font-bold text-white truncate leading-none">{auction.title}</h4>
            <span className="text-[10px] text-gray-400 block mt-1">
              Current highest: <strong className="text-amber-400 font-bold">{auction.highestBid || "0"} ETH</strong>
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-gray-400 font-medium">Bid Value (ETH)</label>
              <span className="text-gray-500">
                Wallet Balance: <strong className="text-white font-semibold font-mono">{balance} ETH</strong>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.001"
                min={minBidRequired}
                value={bidAmount}
                onChange={handleAmountChange}
                disabled={isPending}
                className={`w-full rounded-xl border bg-[#070B14] py-3.5 pl-4 pr-16 text-lg font-bold font-mono text-white focus:outline-none focus:ring-1 transition-all ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30' : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/30'}`}
                placeholder="0.00"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 tracking-wider">
                ETH
              </span>
            </div>

            {/* Error messaging */}
            {error && (
              <span className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                <Info className="h-3 w-3" />
                {error}
              </span>
            )}
          </div>

          {/* Quick Adders buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSetMinBid}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Min Required
            </button>
            <button
              type="button"
              onClick={() => handleAddEth(0.01)}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              +0.01 ETH
            </button>
            <button
              type="button"
              onClick={() => handleAddEth(0.1)}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              +0.1 ETH
            </button>
            <button
              type="button"
              onClick={() => handleAddEth(0.5)}
              className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-gray-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              +0.5 ETH
            </button>
          </div>

          {/* Smart Bidding Assist Section */}
          <div className="rounded-xl border border-white/5 bg-violet-950/15 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-400">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Bid Assist</h4>
                  <p className="text-[9px] text-gray-400 leading-none mt-0.5">Auto outbid opponents up to limit</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isSmartEnabled} 
                  onChange={(e) => setIsSmartEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-indigo-500"></div>
              </label>
            </div>

            <AnimatePresence>
              {isSmartEnabled && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-2 border-t border-white/5 overflow-hidden"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <label className="text-gray-400 font-medium">Max Limit (ETH)</label>
                    <span className="text-violet-400 font-mono text-[9px]">
                      Min outbid increment: +0.005 ETH
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min={parseFloat(bidAmount) || minBidRequired}
                      value={maxBid}
                      onChange={handleMaxBidChange}
                      className={`w-full rounded-lg border bg-[#070B14] py-1.5 pl-3 pr-10 text-xs font-bold font-mono text-white focus:outline-none focus:ring-1 transition-all ${smartError ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30' : 'border-white/10 focus:border-violet-500 focus:ring-violet-500/30'}`}
                      placeholder="0.00"
                      required={isSmartEnabled}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 tracking-wider">
                      ETH
                    </span>
                  </div>

                  {smartError ? (
                    <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {smartError}
                    </span>
                  ) : (
                    <p className="text-[9px] text-gray-500 leading-tight">
                      When someone outbids you, the smart contract automatically posts a bid of current highest + 0.005 ETH on your behalf up to this cap.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fee break-down */}
          <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-gray-400">
              <span>Your Bid Amount</span>
              <span className="font-mono text-white font-medium">{(parseFloat(bidAmount) || 0).toFixed(3)} ETH</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1">
                Estimated Gas Fee
                <HelpCircle className="h-3 w-3 text-gray-600" />
              </span>
              <span className="font-mono text-gray-300">{mockGas} ETH</span>
            </div>
            <div className="h-[1px] w-full bg-white/5 my-1" />
            <div className="flex justify-between items-center font-bold">
              <span className="text-white">Total Outflow</span>
              <span className="font-mono text-indigo-400">{totalCost.toFixed(4)} ETH</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !!error || (isSmartEnabled && !!smartError)}
              className={`flex-[2] py-3 rounded-xl text-xs font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${(error || (isSmartEnabled && !!smartError)) ? 'bg-indigo-500/35 text-white/55 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Bid</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
