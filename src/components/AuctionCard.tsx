import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Gavel, User, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Auction } from '../types';
import { useWeb3 } from '../context/Web3Context';

interface AuctionCardProps {
  auction: Auction;
  onSelect: (id: number) => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction, onSelect }) => {
  const { account, smartBids } = useWeb3();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = auction.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsEnded(true);
        setProgress(100);
      } else {
        setTimeLeft(remaining);
        setIsEnded(false);
        
        // Calculate progress percentage
        const total = auction.endTime - (auction.createdAt || (auction.endTime - 86400));
        const elapsed = now - (auction.createdAt || (auction.endTime - 86400));
        const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
        setProgress(percentage);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Auction Ended";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  const currentBid = parseFloat(auction.highestBid) > 0 
    ? auction.highestBid 
    : auction.startingPrice;

  const hasBids = parseFloat(auction.highestBid) > 0;
  const isUserSeller = account && account.toLowerCase() === auction.seller.toLowerCase();
  const isUserHighestBidder = account && auction.highestBidder && account.toLowerCase() === auction.highestBidder.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative flex flex-col h-full rounded-2xl border bg-[#0F172A]/85 backdrop-blur-md overflow-hidden transition-all duration-300 shadow-xl ${isEnded ? 'border-white/5 opacity-80' : isUserHighestBidder ? 'border-emerald-500/30 shadow-emerald-950/5' : 'border-white/10 hover:border-indigo-500/30'}`}
    >
      {/* Visual Header Image with overlays */}
      <div className="relative h-48 w-full overflow-hidden shrink-0 group">
        <img 
          src={auction.imageUri} 
          alt={auction.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to stylized abstract background if image fails
            e.currentTarget.src = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop";
          }}
        />
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/20 to-transparent" />
        
        {/* Badge states */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {/* Live / Ended Badge */}
          {auction.active && !isEnded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live Bid
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest backdrop-blur-md">
              Ended
            </span>
          )}

          {/* User Specific Roles */}
          {isUserSeller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[9px] font-semibold text-indigo-400 uppercase tracking-wider backdrop-blur-md">
              My Listing
            </span>
          )}
          {isUserHighestBidder && !isEnded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-400 uppercase tracking-wider backdrop-blur-md">
              Winning Bidder 👑
            </span>
          )}
          {smartBids[auction.id]?.active && !isEnded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/40 px-2.5 py-0.5 text-[9px] font-semibold text-violet-300 uppercase tracking-wider backdrop-blur-md">
              Smart Bid Active 🤖
            </span>
          )}
        </div>

        {/* Floating action view details link */}
        <button 
          onClick={() => onSelect(auction.id)}
          className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-[#070B14]/75 border border-white/10 text-white flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 transition-all shadow-lg scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100 cursor-pointer"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Card Details Body */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        {/* Title / Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
              <User className="h-3 w-3" />
              Seller: {auction.seller.slice(0, 5)}...{auction.seller.slice(-4)}
            </span>
            <span className="text-[10px] font-bold text-indigo-400">#{auction.id}</span>
          </div>
          <h4 
            onClick={() => onSelect(auction.id)}
            className="text-md font-bold text-white tracking-tight hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {auction.title}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2 h-8 leading-relaxed">
            {auction.description}
          </p>
        </div>

        {/* Pricing / Bid Info */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-medium block">
              {hasBids ? 'Highest Bid' : 'Starting Bid'}
            </span>
            <span className={`text-md font-bold tracking-tight flex items-center gap-1 ${hasBids ? 'text-amber-400' : 'text-white'}`}>
              <Gavel className="h-4 w-4 shrink-0 text-gray-400" />
              {currentBid} <span className="text-xs font-semibold text-gray-400">ETH</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-medium block">Bidders</span>
            <span className="text-xs font-mono font-bold text-gray-300">
              {hasBids ? 'Active' : 'No bids yet'}
            </span>
          </div>
        </div>

        {/* Time Remaining Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              Time Left:
            </span>
            <span className={`font-mono font-bold ${isEnded ? 'text-rose-400' : timeLeft < 600 ? 'text-amber-400 animate-pulse' : 'text-gray-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          {/* Dynamic Decay Bar */}
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${isEnded ? 'bg-gray-600' : timeLeft < 600 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
            />
          </div>
        </div>

        {/* Actions button */}
        <button
          onClick={() => onSelect(auction.id)}
          className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${isEnded ? 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25'}`}
        >
          <Gavel className="h-3.5 w-3.5" />
          <span>{isEnded ? 'View Results' : 'Bid Now'}</span>
        </button>
      </div>
    </motion.div>
  );
};
