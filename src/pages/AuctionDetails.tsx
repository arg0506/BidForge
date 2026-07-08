import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Gavel, User, Calendar, ExternalLink, ShieldCheck, Zap, Coins, TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useWeb3 } from '../context/Web3Context';
import { BidModal } from '../components/BidModal';
import toast from 'react-hot-toast';

interface AuctionDetailsProps {
  auctionId: number;
  onBack: () => void;
}

// Custom Tooltip component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-violet-500/30 bg-[#0B081E]/95 backdrop-blur-md p-3 shadow-2xl">
        <p className="text-[10px] font-mono text-violet-400 uppercase tracking-widest">{data.timeString}</p>
        <p className="text-sm font-extrabold text-white mt-1 font-mono">{data.price} ETH</p>
        <p className="text-[10px] text-gray-400 mt-0.5 font-sans">By: {data.bidder}</p>
      </div>
    );
  }
  return null;
};

// Custom simple particle interface for bidding celebration
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export const AuctionDetails: React.FC<AuctionDetailsProps> = ({ auctionId, onBack }) => {
  const { 
    auctions, 
    bidHistory, 
    account, 
    isConnected, 
    connectWallet, 
    triggerSimulatedBid, 
    endAuction,
    blockNumber
  } = useWeb3();

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  const auction = auctions.find(a => a.id === auctionId);

  // Countdown timer ticking
  useEffect(() => {
    if (!auction) return;

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = auction.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsEnded(true);
      } else {
        setTimeLeft(remaining);
        setIsEnded(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  if (!auction) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-white">Auction not found</h3>
        <button onClick={onBack} className="mt-4 text-xs font-semibold text-indigo-400 flex items-center gap-2 mx-auto cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  // Filter bid history for this auction
  const currentBids = bidHistory
    .filter(b => b.auctionId === auctionId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const highestBidValue = parseFloat(auction.highestBid) > 0 
    ? auction.highestBid 
    : auction.startingPrice;

  const hasBids = parseFloat(auction.highestBid) > 0;
  const isUserSeller = account && account.toLowerCase() === auction.seller.toLowerCase();
  const isUserHighestBidder = account && auction.highestBidder && account.toLowerCase() === auction.highestBidder.toLowerCase();

  // Format Time Helper
  const formatTimeFull = (seconds: number): string => {
    if (seconds <= 0) return "Auction Settled / Ended";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')} hours : ${mins.toString().padStart(2, '0')} minutes : ${secs.toString().padStart(2, '0')} seconds`;
  };

  // Trigger developer competition bid
  const handleSimulateCompetition = async () => {
    try {
      await triggerSimulatedBid(auctionId);
    } catch (err: any) {
      toast.error(err.message || "Simulated bid failed");
    }
  };

  // Trigger celebration particle explosion
  const triggerCelebration = () => {
    const colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];
    const particles: ConfettiParticle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: Math.random(),
      x: Math.random() * 300 - 150, // center offset
      y: Math.random() * -180 - 50,  // up offset
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4
    }));
    
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 3500); // clear after animation
  };

  // Launch modal and watch for bids
  const handleOpenBid = () => {
    if (!isConnected) {
      toast.error("Connecting virtual sandbox network to place bids!");
      connectWallet('virtual');
      return;
    }
    setIsBidModalOpen(true);
  };

  // Watch for user becoming highest bidder to trigger confetti
  useEffect(() => {
    if (isUserHighestBidder && !isEnded) {
      triggerCelebration();
    }
  }, [auction.highestBidder]);

  const handleEndAuction = async () => {
    try {
      await endAuction(auctionId);
    } catch (err: any) {
      toast.error(err.message || "Finalization failed");
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8 relative">
      {/* Floating Confetti Particle Layer */}
      <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none overflow-hidden z-50 h-96">
        <AnimatePresence>
          {confetti.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 1, x: 0, y: 150 }}
              animate={{ 
                opacity: [1, 1, 0], 
                scale: [0, 1, 0.5],
                x: p.x, 
                y: p.y,
                rotate: Math.random() * 360
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                width: p.size,
                height: p.size,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Back navigation */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Marketplace</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Details, visual representation, and Bid History) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Visual Frame */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
            <img 
              src={auction.imageUri} 
              alt={auction.title} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop";
              }}
            />
            {/* Dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-transparent to-transparent" />
            
            {/* Status indicators inside image */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="rounded-lg bg-[#070B14]/85 border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-gray-300 font-mono flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-500" />
                Seller: {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
              </span>
            </div>
          </div>

          {/* Details & Specs Tab */}
          <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 space-y-4 backdrop-blur">
            <h3 className="text-lg font-bold text-white tracking-tight">Specification Detail</h3>
            <p className="text-xs text-gray-300 leading-relaxed leading-6">
              {auction.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
              <div>
                <span className="text-gray-500 font-medium block">Starting Price Pool</span>
                <span className="text-white font-semibold font-mono">{auction.startingPrice} ETH</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium block">On-chain Register Time</span>
                <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  {new Date((auction.createdAt || 0) * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Graphical Micro-Bid History Trends (Recharts Responsive Area Chart) */}
          <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 space-y-4 backdrop-blur">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-violet-400" />
                Bidding Price Velocity
              </h3>
              <span className="text-[10px] font-mono text-gray-500">Live Trend Chart</span>
            </div>

            <div className="h-40 w-full pt-2">
              {(() => {
                const sortedBidsAsc = [...currentBids].reverse();
                const chartData = [
                  {
                    timestamp: auction.createdAt ? auction.createdAt * 1000 : Date.now() - 3600000,
                    timeString: auction.createdAt ? new Date(auction.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Start',
                    price: parseFloat(auction.startingPrice),
                    bidder: 'Reserve Price'
                  },
                  ...sortedBidsAsc.map(bid => ({
                    timestamp: bid.timestamp * 1000,
                    timeString: new Date(bid.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: parseFloat(bid.amount),
                    bidder: `${bid.bidder.slice(0, 6)}...${bid.bidder.slice(-4)}`
                  }))
                ];

                if (currentBids.length === 0) {
                  chartData.push({
                    timestamp: Date.now(),
                    timeString: 'Now',
                    price: parseFloat(auction.startingPrice),
                    bidder: 'Reserve Price'
                  });
                }

                // Calculate min and max price dynamically
                const prices = chartData.map(d => d.price);
                const minPrice = Math.max(0, Math.min(...prices) * 0.98);
                const maxPrice = Math.max(...prices) * 1.02;

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                      <XAxis 
                        dataKey="timeString" 
                        stroke="#64748b" 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        dy={8}
                      />
                      <YAxis 
                        domain={[minPrice, maxPrice]}
                        stroke="#64748b" 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        dx={-6}
                        tickFormatter={(v) => `${v.toFixed(2)}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 1 }} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8b5cf6" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                        dot={{ r: 3, stroke: '#0F172A', strokeWidth: 1.5, fill: '#a78bfa' }}
                        activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2, fill: '#ffffff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          {/* Bid History Feed */}
          <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 space-y-4 backdrop-blur">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Smart Contract Event Logs</h3>
            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {currentBids.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No events logged. Be the first to place a trustless bid!
                </div>
              ) : (
                currentBids.map((bid, idx) => {
                  const isBidWinner = idx === 0 && isEnded;
                  const isCurrentHighest = idx === 0 && !isEnded;
                  const isUserBid = account && account.toLowerCase() === bid.bidder.toLowerCase();
                  return (
                    <motion.div 
                      key={bid.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-xl border p-3.5 flex items-center justify-between gap-4 transition-all ${isBidWinner ? 'bg-amber-500/10 border-amber-500/30' : isCurrentHighest ? 'bg-indigo-500/5 border-indigo-500/25' : 'bg-[#070B14]/40 border-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${isBidWinner ? 'bg-amber-500/10 text-amber-400' : isCurrentHighest ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-gray-400'}`}>
                          <Gavel className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-mono text-white font-bold">
                              {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                            </span>
                            {isUserBid && (
                              <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 py-0.2 rounded font-semibold uppercase">You</span>
                            )}
                            {isCurrentHighest && (
                              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">Winning</span>
                            )}
                            {isBidWinner && (
                              <span className="text-[8px] bg-amber-500/25 text-amber-400 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">🏆 Winner</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 block mt-0.5">
                            Tx: <a href={`https://sepolia.etherscan.io/tx/${bid.txHash}`} target="_blank" rel="noreferrer" className="font-mono hover:text-white transition-colors">{bid.txHash.slice(0, 14)}...</a>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold block ${isBidWinner ? 'text-amber-400' : 'text-white'}`}>{bid.amount} ETH</span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">{new Date(bid.timestamp * 1000).toLocaleTimeString()}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Actions, Countdown, Whale Simulator) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Action Bid Panel */}
          <div className="rounded-2xl border border-white/10 bg-[#0F172A] p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur" />

            {/* Price Info */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                {hasBids ? 'Current Highest Bid' : 'Reserve Price'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold tracking-tight font-mono ${hasBids ? 'text-amber-400' : 'text-white'}`}>
                  {highestBidValue}
                </span>
                <span className="text-sm font-semibold text-gray-400">ETH</span>
              </div>
              {hasBids && (
                <span className="text-[10px] text-gray-500 block">
                  Bidder Account: <strong className="text-white font-mono">{auction.highestBidder.slice(0, 8)}...{auction.highestBidder.slice(-6)}</strong>
                </span>
              )}
            </div>

            {/* Countdown Box */}
            <div className="rounded-xl border border-white/5 bg-[#070B14] p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Countdown Timer Clock</span>
              </div>
              <div className="font-mono text-xl font-bold text-white tracking-wider">
                {isEnded ? (
                  <span className="text-rose-500 font-bold uppercase text-md">Closed / Settled</span>
                ) : (
                  formatTimeFull(timeLeft)
                )}
              </div>
            </div>

            {/* Placement controls */}
            <div className="space-y-3.5">
              {!isEnded ? (
                <>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleOpenBid}
                    className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer"
                  >
                    <Gavel className="h-4 w-4" />
                    <span>Place Bid Now</span>
                  </motion.button>
                  <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                    Connecting to contract: <strong className="text-indigo-400 font-mono">0xbFd972101344445c7839...</strong>. Standard safety and non-reentrancy rules apply.
                  </p>
                </>
              ) : (
                <>
                  {/* Settlement mechanics */}
                  {auction.active ? (
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEndAuction}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-600/10"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Settle Auction (End Contract)</span>
                    </motion.button>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-gray-500 leading-relaxed font-medium">
                      This smart contract auction is settled and closed. Final payout was transferred to the seller's wallet.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Interactive Battle Arena Whale Simulator */}
          {!isEnded && (
            <div className="rounded-2xl border border-amber-500/20 bg-[#0F172A]/85 p-6 space-y-4 relative overflow-hidden backdrop-blur">
              <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-bl-lg text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                <Zap className="h-3 w-3" /> Dev Sandbox
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Whale Bid Simulator
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Test the real-time event synchronicity! Trigger a simulated bid from another pre-funded mock whale wallet to compete against your price in real-time.
                </p>
              </div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSimulateCompetition}
                className="w-full py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Trigger Competitor Bid 🐳</span>
              </motion.button>
            </div>
          )}

          {/* Connected state diagnostics */}
          <div className="rounded-2xl border border-white/5 bg-[#0F172A]/50 p-4 space-y-3 text-xs">
            <h4 className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Smart Contract Environment Diagnostics</h4>
            <div className="space-y-2 text-gray-400 text-[11px]">
              <div className="flex justify-between items-center">
                <span>Active Block Number:</span>
                <span className="font-mono text-white font-semibold">{blockNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Solidity Compiler:</span>
                <span className="font-mono text-white font-semibold">0.8.20</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gas Limit Set:</span>
                <span className="font-mono text-white font-semibold">30,000,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span>State Updates:</span>
                <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Reactive Event listeners active
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bid Modal Popup */}
      <AnimatePresence>
        {isBidModalOpen && (
          <BidModal 
            isOpen={isBidModalOpen} 
            onClose={() => setIsBidModalOpen(false)} 
            auction={auction} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
