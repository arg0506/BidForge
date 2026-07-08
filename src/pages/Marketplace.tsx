import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Grid, List, Sparkles, Filter } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { AuctionCard } from '../components/AuctionCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { Auction } from '../types';

interface MarketplaceProps {
  onSelectAuction: (id: number) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onSelectAuction }) => {
  const { auctions } = useWeb3();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("ending-soon"); // 'ending-soon', 'price-low', 'price-high', 'recent'
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a quick loading skeleton render for premium feel on search changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  // Handle Filtering
  const filteredAuctions = auctions.filter(auction => {
    // Search query matches title or description
    const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          auction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category badges filters (mock categories)
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "active") return matchesSearch && auction.active && auction.endTime > Math.floor(Date.now() / 1000);
    if (selectedCategory === "ended") return matchesSearch && (auction.ended || auction.endTime <= Math.floor(Date.now() / 1000));
    
    return matchesSearch;
  });

  // Handle Sorting
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const aPrice = parseFloat(a.highestBid) > 0 ? parseFloat(a.highestBid) : parseFloat(a.startingPrice);
    const bPrice = parseFloat(b.highestBid) > 0 ? parseFloat(b.highestBid) : parseFloat(b.startingPrice);

    if (sortBy === "ending-soon") {
      const now = Math.floor(Date.now() / 1000);
      const aRemaining = a.endTime - now;
      const bRemaining = b.endTime - now;
      
      // Expired items move to the end
      if (aRemaining <= 0 && bRemaining > 0) return 1;
      if (bRemaining <= 0 && aRemaining > 0) return -1;
      return aRemaining - bRemaining;
    }
    
    if (sortBy === "price-low") return aPrice - bPrice;
    if (sortBy === "price-high") return bPrice - aPrice;
    if (sortBy === "recent") return (b.createdAt || 0) - (a.createdAt || 0);
    
    return 0;
  });

  return (
    <div className="space-y-8 py-6 px-4 max-w-7xl mx-auto">
      {/* Header text */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-indigo-400 shrink-0" />
            Live Auction Marketplace
          </h2>
          <p className="text-xs text-gray-400 mt-1">Discover, bid, and monitor smart contract listings in real-time.</p>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-[#0F172A]/70 border border-white/5 rounded-2xl p-4 backdrop-blur">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, nodes, specifications..."
            className="w-full rounded-xl bg-[#070B14] border border-white/10 py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Categorization & Sorts */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Categories Toggle Badges */}
          <div className="flex items-center gap-1 bg-[#070B14] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedCategory === "all" ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              All Items
            </button>
            <button
              onClick={() => setSelectedCategory("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedCategory === "active" ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Active Listings
            </button>
            <button
              onClick={() => setSelectedCategory("ended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedCategory === "ended" ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Settled / Ended
            </button>
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#070B14] border border-white/10 p-2 rounded-xl text-xs text-gray-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs pr-1"
            >
              <option value="ending-soon">Ending Soonest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="recent">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((s) => <SkeletonLoader key={s} />)}
          </div>
        ) : sortedAuctions.length === 0 ? (
          <EmptyState
            title="No Auctions Found"
            description="No smart contract matches found. Try clearing your filters or search keywords to see active pools."
            icon="help"
            action={{
              label: "Reset Search",
              onClick: () => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSortBy("ending-soon");
              }
            }}
          />
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedAuctions.map((auction) => (
              <motion.div 
                key={auction.id} 
                layout
                className="h-full"
              >
                <AuctionCard
                  auction={auction}
                  onSelect={onSelectAuction}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
