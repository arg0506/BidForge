import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Wallet, Coins, Award, Activity, Cpu, Layers, 
  ExternalLink, Shield, TrendingUp, Clock, ArrowUpRight, 
  Info, Check, Copy, CheckCircle2, AlertTriangle, ChevronRight, HelpCircle
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';
import { Auction } from '../types';
import toast from 'react-hot-toast';

interface ProfileProps {
  onSelectAuction: (id: number) => void;
  onNavigate: (view: string) => void;
}

type TabType = 'won' | 'active' | 'history';

export const Profile: React.FC<ProfileProps> = ({ onSelectAuction, onNavigate }) => {
  const { 
    auctions, 
    bidHistory, 
    transactions, 
    account, 
    balance, 
    isConnected, 
    isVirtual, 
    networkName, 
    connectWallet,
    smartBids,
    setSmartBid,
    placeBid
  } = useWeb3();

  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('won');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  // Interactive editing states for smart bids inside Profile
  const [localSmartBidMax, setLocalSmartBidMax] = useState<Record<number, string>>({});
  const [biddingPending, setBiddingPending] = useState<Record<number, boolean>>({});

  // 1. Truncate and Copy address utilities
  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // 2. Blockchain Data Calculations
  // Get all auctions won by this user (ended and user is highest bidder)
  const wonAuctions = useMemo(() => {
    if (!account) return [];
    const now = Math.floor(Date.now() / 1000);
    return auctions.filter(a => {
      const isEnded = a.ended || now >= a.endTime;
      return isEnded && a.highestBidder.toLowerCase() === account.toLowerCase();
    });
  }, [auctions, account]);

  // Get all active auctions where the user has bidded OR has configured an active Smart Bid
  const activeBiddingAuctions = useMemo(() => {
    if (!account) return [];
    const now = Math.floor(Date.now() / 1000);
    
    return auctions.filter(a => {
      const isActive = a.active && !a.ended && now < a.endTime;
      if (!isActive) return false;
      
      // Checked if user bidded on this item
      const hasUserBidded = bidHistory.some(b => 
        b.auctionId === a.id && b.bidder.toLowerCase() === account.toLowerCase()
      );

      // Or if there is an active smart bid configured
      const hasSmartBid = smartBids[a.id]?.active && smartBids[a.id]?.bidderAddress.toLowerCase() === account.toLowerCase();

      return hasUserBidded || hasSmartBid;
    });
  }, [auctions, bidHistory, smartBids, account]);

  // Get chronological bid history for this user
  const userBidHistory = useMemo(() => {
    if (!account) return [];
    return [...bidHistory]
      .filter(b => b.bidder.toLowerCase() === account.toLowerCase())
      .sort((a, b) => b.timestamp - a.timestamp); // newest first
  }, [bidHistory, account]);

  // Total user active commitments (sum of user's highest bid in active auctions)
  const activeCommitments = useMemo(() => {
    if (!account) return 0;
    let total = 0;
    
    // For each active auction in which the user is participating, find their highest bid
    const activeUserAuctions = auctions.filter(a => {
      const now = Math.floor(Date.now() / 1000);
      return a.active && !a.ended && now < a.endTime;
    });

    activeUserAuctions.forEach(a => {
      const bidsOnAuction = bidHistory.filter(b => 
        b.auctionId === a.id && b.bidder.toLowerCase() === account.toLowerCase()
      );
      if (bidsOnAuction.length > 0) {
        const highestUserBid = Math.max(...bidsOnAuction.map(b => parseFloat(b.amount)));
        total += highestUserBid;
      }
    });

    return total;
  }, [auctions, bidHistory, account]);

  // Total active smart agents
  const activeSmartAgentsCount = useMemo(() => {
    if (!account) return 0;
    return Object.values(smartBids).filter((b: any) => 
      b && b.active && b.bidderAddress.toLowerCase() === account.toLowerCase()
    ).length;
  }, [smartBids, account]);

  // Handles updating/saving Smart Bid limits
  const handleSaveSmartBid = (auctionId: number, maxAmount: string) => {
    const floatLimit = parseFloat(maxAmount);
    if (isNaN(floatLimit) || floatLimit <= 0) {
      toast.error("Please enter a valid limit");
      return;
    }
    
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;
    
    const minBid = parseFloat(auction.highestBid) > 0 
      ? parseFloat(auction.highestBid) + 0.005 
      : parseFloat(auction.startingPrice);

    if (floatLimit < minBid) {
      toast.error(`Limit must be at least the next required bid of ${minBid.toFixed(3)} ETH`);
      return;
    }

    setSmartBid(auctionId, maxAmount, true);
  };

  // Handles quick-outbidding from the profile list
  const handleQuickBid = async (auctionId: number, nextBidAmount: string) => {
    setBiddingPending(prev => ({ ...prev, [auctionId]: true }));
    try {
      await placeBid(auctionId, nextBidAmount);
      toast.success(`Successfully placed outbid of ${nextBidAmount} ETH!`);
    } catch (err: any) {
      toast.error(err.message || "Bid transaction failed");
    } finally {
      setBiddingPending(prev => ({ ...prev, [auctionId]: false }));
    }
  };

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8 relative">
      
      {/* 1. Header Profile Banner */}
      <div className="rounded-3xl border border-white/5 bg-gradient-to-r from-[#0D0A20]/90 to-[#070B14]/95 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 bg-indigo-600/5 rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Left: User Identity Info */}
          <div className="flex items-center gap-4.5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 blur-sm opacity-70" />
              <img 
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80"} 
                alt={user?.name || "Collector"} 
                className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-[#0D0A20] relative z-10 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 rounded-full bg-indigo-500 border border-[#0D0A20] p-1.5 text-white z-20 shadow-md">
                <Shield className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {user?.name || "Anonymous Collector"}
                </h2>
                <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[9px] font-bold text-violet-300 uppercase tracking-widest">
                  Collector Pro
                </span>
              </div>
              <p className="text-xs text-gray-400">{user?.email || "verified_client@bidforge.evm"}</p>
              
              {isConnected && account && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase tracking-wider">Address:</span>
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-gray-300">
                      {account.slice(0, 8)}...{account.slice(-8)}
                    </span>
                    <button 
                      onClick={() => handleCopy(account)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy Address"
                    >
                      {copiedAddress === account ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Wallet Statistics Widget */}
          <div className="w-full md:w-auto bg-[#0F172A]/80 border border-white/10 rounded-2xl p-4.5 space-y-3.5 shrink-0">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Wallet className="h-4.5 w-4.5 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Web3 Status</span>
              </div>
              {isConnected ? (
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[9px] font-bold text-rose-400 uppercase tracking-wide">
                  Disconnected
                </div>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Available Funds</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-white tracking-tight font-mono">
                    {parseFloat(balance).toFixed(4)}
                  </span>
                  <span className="text-xs font-bold text-violet-400 font-mono">ETH</span>
                </div>
                <div className="text-[9px] text-gray-500 font-medium">
                  Active Network: <span className="text-indigo-300 font-mono font-semibold uppercase">{networkName}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-gray-400 leading-snug">Connect an EVM wallet to synchronize on-chain items, smart biddings, and logs.</p>
                <button
                  onClick={() => connectWallet('virtual')}
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Launch Virtual Wallet
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. Key Analytics Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Metric 1 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/60 p-5 relative overflow-hidden flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl" />
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider truncate">Digital Items Won</span>
            <span className="text-2xl font-black font-mono text-white leading-none block">
              {isConnected ? wonAuctions.length : '0'}
            </span>
            <span className="text-[9px] text-gray-400 block truncate">Hammer finished wins</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/60 p-5 relative overflow-hidden flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl" />
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider truncate">Locked Commitments</span>
            <span className="text-2xl font-black font-mono text-white leading-none flex items-baseline gap-1 truncate">
              {isConnected ? activeCommitments.toFixed(3) : '0.000'} <span className="text-xs font-semibold text-indigo-400">ETH</span>
            </span>
            <span className="text-[9px] text-gray-400 block truncate">Highest bids in active pools</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/60 p-5 relative overflow-hidden flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider truncate">Audit Ledger Bids</span>
            <span className="text-2xl font-black font-mono text-white leading-none block">
              {isConnected ? userBidHistory.length : '0'}
            </span>
            <span className="text-[9px] text-gray-400 block truncate">Total registered bids</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/60 p-5 relative overflow-hidden flex items-center gap-4.5">
          <div className="absolute top-0 right-0 h-16 w-16 bg-violet-500/5 rounded-full blur-xl" />
          <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
            <Cpu className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider truncate">Smart Agents</span>
            <span className="text-2xl font-black font-mono text-white leading-none block">
              {isConnected ? activeSmartAgentsCount : '0'}
            </span>
            <span className="text-[9px] text-gray-400 block truncate">Automated outbidding setups</span>
          </div>
        </div>

      </div>

      {/* 3. Tabbed Content Panel Wrapper */}
      <div className="space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 pb-0.5">
          <div className="flex gap-2">
            {[
              { id: 'won', label: 'My Collection 👑', count: wonAuctions.length },
              { id: 'active', label: 'Active & Smart Bids ⚡', count: activeBiddingAuctions.length },
              { id: 'history', label: 'Bidding Ledger 📜', count: userBidHistory.length }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4.5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all relative flex items-center gap-2 cursor-pointer ${isActive ? 'text-white border-violet-500 font-extrabold' : 'text-gray-400 border-transparent hover:text-white'}`}
                >
                  {tab.label}
                  {isConnected && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md ${isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-gray-400'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Items Render block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            
            {/* Wallet Not Connected Guard */}
            {!isConnected ? (
              <EmptyState 
                title="Synchronized Wallet Required"
                description="Please connect your Web3 wallet (or launch a demo wallet in sandbox) to analyze and render your private blockchain metrics and activities."
                icon="alert"
                action={{
                  label: "Connect Demo Wallet",
                  onClick: () => connectWallet('virtual')
                }}
              />
            ) : (
              <>
                {/* A. MY COLLECTION (WON ITEMS) */}
                {activeTab === 'won' && (
                  wonAuctions.length === 0 ? (
                    <EmptyState 
                      title="No Claimed Collectibles Yet"
                      description="You haven't won any live auctions. Explore the active auctions in the marketplace and place bids on digital artwork or assets!"
                      icon="inbox"
                      action={{
                        label: "Browse Live Marketplace",
                        onClick: () => onNavigate('marketplace')
                      }}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wonAuctions.map((auction) => (
                        <div 
                          key={auction.id}
                          className="group rounded-2xl border border-white/5 bg-[#0F172A]/70 hover:border-violet-500/40 hover:bg-[#0F172A]/90 transition-all overflow-hidden flex flex-col justify-between shadow-xl cursor-pointer"
                          onClick={() => onSelectAuction(auction.id)}
                        >
                          {/* Image Wrapper */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-[#070B14]">
                            <img 
                              src={auction.imageUri} 
                              alt={auction.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md">
                              Auction Won 👑
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2 py-1 text-[10px] font-mono text-gray-200">
                              ID #{auction.id}
                            </div>
                          </div>

                          {/* Detail body */}
                          <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                              <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors truncate">
                                {auction.title}
                              </h3>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {auction.description}
                              </p>
                            </div>

                            {/* Details Row */}
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-gray-500 block uppercase font-semibold">Final Price</span>
                                <span className="text-sm font-extrabold text-white font-mono">
                                  {parseFloat(auction.highestBid).toFixed(3)} ETH
                                </span>
                              </div>
                              <div className="space-y-0.5 text-right">
                                <span className="text-[9px] text-gray-500 block uppercase font-semibold">Seller ID</span>
                                <span className="text-[10px] font-mono text-indigo-300">
                                  {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
                                </span>
                              </div>
                            </div>

                            {/* Action view */}
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectAuction(auction.id);
                                }}
                                className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-[10px] font-bold tracking-wider text-indigo-300 rounded-lg uppercase border border-indigo-500/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span>Inspect Collection Artifact</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* B. ACTIVE BIDDING & SMART ASSISTS */}
                {activeTab === 'active' && (
                  activeBiddingAuctions.length === 0 ? (
                    <EmptyState 
                      title="No Active Bids Found"
                      description="You are not participating in any active auctions. Make a bid in the marketplace or launch your own auction to get started!"
                      icon="inbox"
                      action={{
                        label: "Browse Live Marketplace",
                        onClick: () => onNavigate('marketplace')
                      }}
                    />
                  ) : (
                    <div className="space-y-6">
                      {activeBiddingAuctions.map((auction) => {
                        const isHighestBidder = auction.highestBidder.toLowerCase() === account.toLowerCase();
                        const sBid = smartBids[auction.id];
                        const isSmartActive = sBid?.active;
                        const maxLimit = localSmartBidMax[auction.id] ?? sBid?.maxBid ?? (parseFloat(auction.highestBid) + 0.1).toFixed(3);
                        
                        const nextBidAmount = parseFloat(auction.highestBid) === 0 
                          ? parseFloat(auction.startingPrice)
                          : parseFloat(auction.highestBid) + 0.005;

                        return (
                          <div 
                            key={auction.id}
                            className="rounded-2xl border border-white/5 bg-[#0F172A]/70 overflow-hidden flex flex-col lg:flex-row items-stretch"
                          >
                            {/* Left Image column */}
                            <div className="w-full lg:w-60 shrink-0 aspect-[16/10] lg:aspect-auto relative bg-[#070B14]">
                              <img 
                                src={auction.imageUri} 
                                alt={auction.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-3 left-3 flex gap-1.5">
                                {isHighestBidder ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md">
                                    Highest Bidder 👑
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase tracking-widest backdrop-blur-md">
                                    Outbid ⚠️
                                  </span>
                                )}
                                {isSmartActive && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[9px] font-bold text-violet-400 uppercase tracking-widest backdrop-blur-md">
                                    Agent Active 🤖
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Middle Details column */}
                            <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-gray-500 font-semibold tracking-wide block uppercase">Auction Item #{auction.id}</span>
                                <h3 className="text-md font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1.5" onClick={() => onSelectAuction(auction.id)}>
                                  {auction.title}
                                  <ArrowUpRight className="h-4.5 w-4.5 shrink-0 text-gray-500" />
                                </h3>
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{auction.description}</p>
                              </div>

                              {/* Price and status details */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-gray-500 block uppercase font-semibold">Current Highest Bid</span>
                                  <span className="text-sm font-extrabold text-white font-mono flex items-baseline gap-1">
                                    {parseFloat(auction.highestBid).toFixed(3)} <span className="text-[10px] text-violet-400 font-semibold">ETH</span>
                                  </span>
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-gray-500 block uppercase font-semibold">Next Minimum Bid</span>
                                  <span className="text-sm font-extrabold text-indigo-300 font-mono flex items-baseline gap-1">
                                    {nextBidAmount.toFixed(3)} <span className="text-[10px] text-indigo-400 font-semibold">ETH</span>
                                  </span>
                                </div>
                                <div className="space-y-0.5 col-span-2 md:col-span-1">
                                  <span className="text-[9px] text-gray-500 block uppercase font-semibold">Pool Ends In</span>
                                  <span className="text-xs font-bold text-gray-300 font-mono flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-gray-500" />
                                    {Math.max(0, auction.endTime - Math.floor(Date.now() / 1000)) > 0 ? (
                                      new Date(auction.endTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                    ) : (
                                      "Ended"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Smart Bid Assist Agent Configuration Panel */}
                            <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 bg-white/[0.02] p-5 flex flex-col justify-between gap-4">
                              
                              {/* Agent Toggle Header */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-violet-400" />
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Smart Assist</span>
                                  </div>
                                  
                                  {/* Toggle Switch */}
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={isSmartActive || false} 
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSmartBid(auction.id, maxLimit, true);
                                        } else {
                                          setSmartBid(auction.id, "0", false);
                                        }
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-indigo-500"></div>
                                  </label>
                                </div>

                                {/* Toggle content view */}
                                {isSmartActive ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-gray-400">Outbidding Limit:</span>
                                      <span className="text-[10px] text-violet-400 font-mono font-bold">{parseFloat(sBid.maxBid).toFixed(3)} ETH</span>
                                    </div>
                                    <div className="relative">
                                      <input 
                                        type="number"
                                        step="0.005"
                                        value={maxLimit}
                                        onChange={(e) => setLocalSmartBidMax(prev => ({ ...prev, [auction.id]: e.target.value }))}
                                        className="w-full rounded-lg bg-[#070B14] border border-white/10 py-1.5 pl-2.5 pr-14 text-xs font-bold font-mono text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25 transition-all"
                                      />
                                      <button
                                        onClick={() => handleSaveSmartBid(auction.id, maxLimit)}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-violet-600 hover:bg-violet-500 text-[9px] font-bold text-white rounded-md transition-colors"
                                      >
                                        Save
                                      </button>
                                    </div>
                                    <p className="text-[9px] text-gray-500 leading-tight">Standing ready to outbid other bidders in 2s with +0.005 ETH increment up to this cap.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 leading-normal">
                                      Enable Smart Bid Assist to run background outbidding algorithms. Keeps you ahead of competitors automatically.
                                    </p>
                                    <div className="flex gap-2">
                                      <input 
                                        type="number"
                                        step="0.005"
                                        value={maxLimit}
                                        placeholder="Max limit in ETH"
                                        onChange={(e) => setLocalSmartBidMax(prev => ({ ...prev, [auction.id]: e.target.value }))}
                                        className="flex-1 rounded-lg bg-[#070B14] border border-white/5 px-2.5 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-violet-500"
                                      />
                                      <button
                                        onClick={() => handleSaveSmartBid(auction.id, maxLimit)}
                                        className="px-3 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 hover:border-violet-500/40 text-[10px] font-bold rounded-lg transition-colors"
                                      >
                                        Enable
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Manual bid fast shortcut */}
                              {!isHighestBidder && (
                                <div className="pt-2 border-t border-white/5">
                                  <button
                                    onClick={() => handleQuickBid(auction.id, nextBidAmount.toFixed(3))}
                                    disabled={biddingPending[auction.id]}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                                  >
                                    {biddingPending[auction.id] ? (
                                      <>
                                        <Activity className="h-3.5 w-3.5 animate-pulse" />
                                        <span>Confirming...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>Manual Bid {nextBidAmount.toFixed(3)} ETH</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* C. BIDDING LOG HISTORY */}
                {activeTab === 'history' && (
                  userBidHistory.length === 0 ? (
                    <EmptyState 
                      title="Bidding Ledger is Clean"
                      description="No records of your bids exist on-chain. Go ahead and bid on high contrast nft listings to populate this transaction diary."
                      icon="inbox"
                      action={{
                        label: "Browse Live Marketplace",
                        onClick: () => onNavigate('marketplace')
                      }}
                    />
                  ) : (
                    <div className="bg-[#0F172A]/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      
                      {/* Search and Header */}
                      <div className="p-4 bg-[#070B14]/40 border-b border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Historical Bidding Ledger</span>
                        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Total {userBidHistory.length} ledger logs</span>
                      </div>

                      {/* Ledger list */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#070B14]/20 border-b border-white/5 text-gray-500 text-[10px] uppercase font-semibold">
                              <th className="p-4">Index</th>
                              <th className="p-4">Listing Title</th>
                              <th className="p-4">My Bid Value</th>
                              <th className="p-4">Timestamp</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">EVM Transaction Hash</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {userBidHistory.map((bid, index) => {
                              const auction = auctions.find(a => a.id === bid.auctionId);
                              const isWinning = auction && auction.highestBidder.toLowerCase() === account.toLowerCase() && parseFloat(auction.highestBid) === parseFloat(bid.amount);
                              
                              return (
                                <tr key={bid.id} className="hover:bg-white/5 transition-all">
                                  {/* Index */}
                                  <td className="p-4 font-mono font-bold text-gray-500">
                                    {(userBidHistory.length - index).toString().padStart(2, '0')}
                                  </td>

                                  {/* Listing Title */}
                                  <td className="p-4 font-semibold text-white truncate max-w-xs">
                                    {auction ? (
                                      <button 
                                        onClick={() => onSelectAuction(bid.auctionId)}
                                        className="hover:text-indigo-400 hover:underline transition-colors text-left font-semibold"
                                      >
                                        {auction.title}
                                      </button>
                                    ) : (
                                      <span className="text-gray-500 italic">Deleted / Unknown Listing #{bid.auctionId}</span>
                                    )}
                                  </td>

                                  {/* Bid Amount */}
                                  <td className="p-4 font-mono font-extrabold text-white">
                                    {parseFloat(bid.amount).toFixed(3)} ETH
                                  </td>

                                  {/* Timestamp */}
                                  <td className="p-4 text-gray-400">
                                    {new Date(bid.timestamp * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </td>

                                  {/* Bid Standing Status */}
                                  <td className="p-4">
                                    {auction?.ended || Math.floor(Date.now() / 1000) >= (auction?.endTime || 0) ? (
                                      isWinning ? (
                                        <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                          Won 👑
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded bg-gray-500/10 text-gray-500 border border-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                          Overbid
                                        </span>
                                      )
                                    ) : (
                                      isWinning ? (
                                        <span className="inline-flex items-center gap-1.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                          Highest Bid 👑
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                          Outbid ⚠️
                                        </span>
                                      )
                                    )}
                                  </td>

                                  {/* Transaction Hash */}
                                  <td className="p-4 font-mono text-right text-indigo-400">
                                    <a 
                                      href={`https://sepolia.etherscan.io/tx/${bid.txHash}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="hover:underline inline-flex items-center gap-1 text-[11px] font-bold font-mono tracking-normal"
                                    >
                                      {bid.txHash.slice(0, 10)}...
                                      <ArrowUpRight className="h-3 w-3 text-gray-500" />
                                    </a>
                                  </td>

                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )
                )}

              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};
