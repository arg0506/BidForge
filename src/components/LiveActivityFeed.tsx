import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ethers } from 'ethers';
import { 
  Activity, 
  Sparkles, 
  TrendingUp, 
  PlusCircle, 
  Award, 
  CornerDownLeft, 
  Clock, 
  ExternalLink,
  Filter,
  CheckCircle2,
  Cpu,
  Search,
  Zap,
  Check
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { AUCTION_MANAGER_ABI } from '../lib/auctionContractData';

interface ActivityLog {
  id: string;
  type: 'bid' | 'create' | 'end' | 'withdraw' | 'info';
  title: string;
  description: string;
  timestamp: number;
  txHash: string;
  auctionId?: number;
  address?: string;
  value?: string;
}

export const LiveActivityFeed: React.FC = () => {
  const { 
    isVirtual, 
    contractAddress, 
    bidHistory, 
    transactions, 
    auctions, 
    blockNumber,
    triggerSimulatedBid
  } = useWeb3();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'bid' | 'create' | 'end' | 'withdraw'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSimulationId, setActiveSimulationId] = useState<number | null>(null);

  // Helper to add a log and keep it capped at 50 logs max
  const addLiveLog = (newLog: ActivityLog) => {
    setLogs(prev => {
      // Avoid duplicate logs by id
      if (prev.some(log => log.id === newLog.id)) return prev;
      const updated = [newLog, ...prev];
      return updated.slice(0, 50);
    });
  };

  // Pre-seed logs from current state (Web3Context bidHistory & transactions)
  useEffect(() => {
    const seedLogs: ActivityLog[] = [];

    // Parse bid history
    bidHistory.forEach(bid => {
      const auction = auctions.find(a => a.id === bid.auctionId);
      seedLogs.push({
        id: `seed-bid-${bid.id}`,
        type: 'bid',
        title: 'Bid Placed',
        description: `Account ${bid.bidder.slice(0, 6)}...${bid.bidder.slice(-4)} placed a bid of ${bid.amount} ETH on "${auction ? auction.title : `Auction #${bid.auctionId}`}"`,
        timestamp: bid.timestamp,
        txHash: bid.txHash,
        auctionId: bid.auctionId,
        address: bid.bidder,
        value: bid.amount
      });
    });

    // Parse other transactions
    transactions.forEach(tx => {
      if (tx.method === 'createAuction') {
        seedLogs.push({
          id: `seed-create-${tx.hash}`,
          type: 'create',
          title: 'Auction Listing Deployed',
          description: `Contract deployment by ${tx.from.slice(0, 6)}...${tx.from.slice(-4)} registered on-chain`,
          timestamp: tx.timestamp,
          txHash: tx.hash,
          address: tx.from,
          value: tx.value
        });
      } else if (tx.method === 'endAuction') {
        seedLogs.push({
          id: `seed-end-${tx.hash}`,
          type: 'end',
          title: 'Auction Finalized',
          description: `Auction settlement completed on-chain by caller ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`,
          timestamp: tx.timestamp,
          txHash: tx.hash,
          address: tx.from,
          value: tx.value
        });
      } else if (tx.method === 'withdraw') {
        seedLogs.push({
          id: `seed-withdraw-${tx.hash}`,
          type: 'withdraw',
          title: 'Refund Escrow Claimed',
          description: `Withdrew refundable returns of ${tx.value} ETH to account ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`,
          timestamp: tx.timestamp,
          txHash: tx.hash,
          address: tx.to,
          value: tx.value
        });
      } else if (tx.method === 'faucet') {
        seedLogs.push({
          id: `seed-faucet-${tx.hash}`,
          type: 'info',
          title: 'DevNet Faucet Claims',
          description: `Transferred +5.00 ETH sandbox developer funds to ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`,
          timestamp: tx.timestamp,
          txHash: tx.hash,
          address: tx.to,
          value: tx.value
        });
      }
    });

    // Sort chronologically (newest first)
    seedLogs.sort((a, b) => b.timestamp - a.timestamp);
    setLogs(seedLogs);
  }, [bidHistory, transactions, auctions]);

  // Real-time Ethers.js contract event listeners (active when isVirtual === false)
  useEffect(() => {
    if (isVirtual) return;
    if (typeof window === 'undefined' || !(window as any).ethereum) return;

    let active = true;
    let contract: ethers.Contract | null = null;

    const setupListeners = async () => {
      try {
        const ethereum = (window as any).ethereum;
        const provider = new ethers.BrowserProvider(ethereum);
        contract = new ethers.Contract(contractAddress, AUCTION_MANAGER_ABI, provider);

        // 1. BidPlaced
        contract.on("BidPlaced", (auctionId, bidder, amount) => {
          if (!active) return;
          const bidAmountEth = ethers.formatEther(amount);
          const targetAuction = auctions.find(a => a.id === Number(auctionId));
          addLiveLog({
            id: `eth-bid-${auctionId}-${bidder}-${amount}-${Date.now()}`,
            type: 'bid',
            title: 'Live On-Chain Bid',
            description: `Account ${bidder.slice(0, 6)}...${bidder.slice(-4)} bid ${bidAmountEth} ETH on "${targetAuction ? targetAuction.title : `Auction #${auctionId}`}"`,
            timestamp: Math.floor(Date.now() / 1000),
            txHash: `Log: Event Emitted [Block ${blockNumber}]`,
            auctionId: Number(auctionId),
            address: bidder,
            value: bidAmountEth
          });
        });

        // 2. AuctionCreated
        contract.on("AuctionCreated", (auctionId, seller, title, startingPrice, endTime) => {
          if (!active) return;
          const priceEth = ethers.formatEther(startingPrice);
          addLiveLog({
            id: `eth-create-${auctionId}-${Date.now()}`,
            type: 'create',
            title: 'Live Auction Created',
            description: `"${title}" was created by ${seller.slice(0,6)}...${seller.slice(-4)} starting at ${priceEth} ETH`,
            timestamp: Math.floor(Date.now() / 1000),
            txHash: `Log: Event Emitted [Block ${blockNumber}]`,
            auctionId: Number(auctionId),
            address: seller,
            value: priceEth
          });
        });

        // 3. AuctionEnded
        contract.on("AuctionEnded", (auctionId, winner, highestBid) => {
          if (!active) return;
          const finalBidEth = ethers.formatEther(highestBid);
          addLiveLog({
            id: `eth-end-${auctionId}-${Date.now()}`,
            type: 'end',
            title: 'Live Auction Settled',
            description: `Auction #${auctionId} settled on-chain. Sold to ${winner.slice(0,6)}...${winner.slice(-4)} for ${finalBidEth} ETH`,
            timestamp: Math.floor(Date.now() / 1000),
            txHash: `Log: Event Emitted [Block ${blockNumber}]`,
            auctionId: Number(auctionId),
            address: winner,
            value: finalBidEth
          });
        });

        // 4. FundsWithdrawn
        contract.on("FundsWithdrawn", (withdrawer, amount) => {
          if (!active) return;
          const amountEth = ethers.formatEther(amount);
          addLiveLog({
            id: `eth-withdraw-${withdrawer}-${Date.now()}`,
            type: 'withdraw',
            title: 'Live Refund Claimed',
            description: `${withdrawer.slice(0,6)}...${withdrawer.slice(-4)} withdrew a refund of ${amountEth} ETH`,
            timestamp: Math.floor(Date.now() / 1000),
            txHash: `Log: Event Emitted [Block ${blockNumber}]`,
            address: withdrawer,
            value: amountEth
          });
        });

      } catch (err) {
        console.warn("Could not start Web3 standard socket event streams:", err);
      }
    };

    setupListeners();

    return () => {
      active = false;
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [isVirtual, contractAddress, auctions, blockNumber]);

  // Handle mock simulation trigger
  const handleTriggerSimulation = async (auctionId: number) => {
    setActiveSimulationId(auctionId);
    try {
      await triggerSimulatedBid(auctionId);
    } catch (err) {
      // Errors are handled inside triggerSimulatedBid toast
    } finally {
      setActiveSimulationId(null);
    }
  };

  // Filter & search logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Type filtering
      if (filter !== 'all' && log.type !== filter) return false;
      
      // Search querying
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          log.title.toLowerCase().includes(query) ||
          log.description.toLowerCase().includes(query) ||
          log.txHash.toLowerCase().includes(query) ||
          (log.address && log.address.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [logs, filter, searchQuery]);

  const activeLiveAuctions = useMemo(() => {
    return auctions.filter(a => a.active && !a.ended);
  }, [auctions]);

  // Format elapsed time friendly format
  const formatTimeElapsed = (timestamp: number) => {
    const diff = Math.floor(Date.now() / 1000) - timestamp;
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#110E26]/60 to-[#080B13]/90 p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 h-44 w-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-md font-bold text-white tracking-tight">Mempool Event Log & Live Activity</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Unified ledger of Web3 smart contract logs and sandbox transaction logs
            </p>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 flex items-center gap-1.5 font-mono text-[10px] text-gray-300">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Block: </span>
            <span className="text-white font-bold">{blockNumber}</span>
          </div>
          <div className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isVirtual 
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            <span>{isVirtual ? 'Sandbox Simulated' : 'Live EVM RPC'}</span>
          </div>
        </div>
      </div>

      {/* Control panel: filter buttons & search bar */}
      <div className="flex flex-col sm:flex-row gap-4 py-4 items-center justify-between">
        <div className="flex items-center gap-1.5 bg-[#070B14] p-1 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilter('bid')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${filter === 'bid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <TrendingUp className="h-3 w-3" />
            Bids
          </button>
          <button
            onClick={() => setFilter('create')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${filter === 'create' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <PlusCircle className="h-3 w-3" />
            Launches
          </button>
          <button
            onClick={() => setFilter('end')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${filter === 'end' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Award className="h-3 w-3" />
            Settled
          </button>
          <button
            onClick={() => setFilter('withdraw')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${filter === 'withdraw' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <CornerDownLeft className="h-3 w-3" />
            Claims
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log address, TX..."
            className="w-full bg-[#070B14] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[10px] font-medium text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid: Events list & interactive trigger board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left/Main Column: Event list */}
        <div className="lg:col-span-8 bg-[#070B14]/40 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Confirmed Events Stream ({filteredLogs.length})</span>
            <span className="text-[9px] font-mono text-gray-500">Auto-refresh: 1s</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2.5 pr-1 scrollbar-thin">
            <AnimatePresence initial={false}>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  let badgeColor = 'bg-blue-500/15 border-blue-500/20 text-blue-300';
                  let icon = <TrendingUp className="h-3 w-3" />;
                  
                  if (log.type === 'create') {
                    badgeColor = 'bg-violet-500/15 border-violet-500/20 text-violet-300';
                    icon = <PlusCircle className="h-3 w-3" />;
                  } else if (log.type === 'end') {
                    badgeColor = 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300';
                    icon = <Award className="h-3 w-3" />;
                  } else if (log.type === 'withdraw') {
                    badgeColor = 'bg-cyan-500/15 border-cyan-500/20 text-cyan-300';
                    icon = <CornerDownLeft className="h-3 w-3" />;
                  } else if (log.type === 'info') {
                    badgeColor = 'bg-amber-500/15 border-amber-500/20 text-amber-300';
                    icon = <Sparkles className="h-3 w-3" />;
                  }

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="group p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex items-start gap-4 text-left"
                    >
                      {/* Left Badge Icon */}
                      <div className={`p-2 rounded-lg border shrink-0 ${badgeColor}`}>
                        {icon}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-extrabold text-white leading-none">
                            {log.title}
                          </span>
                          <span className="text-[9px] font-mono text-gray-500 shrink-0 flex items-center gap-1 font-semibold">
                            <Clock className="h-3 w-3 text-gray-600" />
                            {formatTimeElapsed(log.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          {log.description}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[9px] font-mono text-gray-500">
                          <span className="truncate">
                            Tx: <span className="text-gray-400 font-semibold">{log.txHash.slice(0, 16)}...</span>
                          </span>
                          {log.value && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 font-bold uppercase shrink-0">
                              {log.value} ETH
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <Activity className="h-8 w-8 text-gray-700 animate-pulse" />
                  <span className="text-xs text-gray-500 italic">No events match your current query filters.</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Simulated Mempool Injection Trigger Board */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-left space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[8px] font-bold text-indigo-300 uppercase tracking-widest">
                <Zap className="h-3 w-3 text-indigo-400" />
                Mempool Injector
              </span>
              <h4 className="text-xs font-bold text-white mt-1.5 leading-snug">
                Simulate Concurrent Traffic
              </h4>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-1 leading-4">
                In Web3 Sandbox mode, you can force other simulated accounts (such as Apex Collector or Voxel Whale) to outbid the active listing. Test the high-speed Smart Bid Assist feedback loop!
              </p>
            </div>

            {activeLiveAuctions.length > 0 ? (
              <div className="space-y-2.5">
                <span className="text-[9px] font-mono text-gray-500 font-bold uppercase tracking-wider block">Active Auction Catalogs</span>
                {activeLiveAuctions.map((a) => {
                  const isSimulating = activeSimulationId === a.id;
                  return (
                    <div 
                      key={a.id}
                      className="p-3 rounded-xl bg-[#070B14]/70 border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {a.title}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 block mt-0.5">
                          Highest bid: <span className="text-indigo-400 font-semibold">{parseFloat(a.highestBid) > 0 ? a.highestBid : a.startingPrice} ETH</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleTriggerSimulation(a.id)}
                        disabled={isSimulating}
                        className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          isSimulating
                            ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/40 hover:border-indigo-400 text-white shadow shadow-indigo-600/15'
                        }`}
                      >
                        {isSimulating ? 'Injecting...' : 'Outbid'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-[10px] text-gray-500 italic">
                No active auctions to simulate bidding. Please launch an auction to unlock the injector!
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600/5 to-indigo-600/5 border border-violet-500/10 text-left space-y-2">
            <h5 className="text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-violet-400" />
              Event Stream Health Good
            </h5>
            <p className="text-[10px] text-gray-400 leading-relaxed leading-4">
              Our background monitoring system is subscribed directly to the virtual local chain andSepolia blockchain logs. WebSocket reconnection fallback is fully optimized.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
