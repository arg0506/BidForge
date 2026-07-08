import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Gavel, 
  Cpu, 
  Globe, 
  ArrowRight, 
  Coins, 
  Wallet, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Clock,
  Layers,
  ChevronRight,
  Info,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';
import startupLaunchBanner from '../assets/images/bidforge_startup_launch_1783521540195.jpg';
import { LiveActivityFeed } from '../components/LiveActivityFeed';

interface HomeProps {
  onNavigate: (view: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { 
    auctions, 
    isConnected, 
    connectWallet, 
    account, 
    balance, 
    requestFaucet, 
    placeBid, 
    transactions,
    blockNumber 
  } = useWeb3();

  // Selected interactive explanation tab
  const [activeTab, setActiveTab] = useState<'deploy' | 'bid' | 'pull' | 'settle'>('deploy');
  
  // Local state for featured auction bid input
  const [quickBidAmount, setQuickBidAmount] = useState<string>('');
  const [isBiddingPending, setIsBiddingPending] = useState(false);

  // Grab the first active auction as our featured live listing
  const featuredAuction = auctions.find(a => a.active && a.endTime > Math.floor(Date.now() / 1000)) || auctions[0];
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!featuredAuction) return;
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = featuredAuction.endTime - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [featuredAuction]);

  // Handle Quick Bid submit
  const handleQuickBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featuredAuction) return;

    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      connectWallet('virtual');
      return;
    }

    if (!quickBidAmount) {
      toast.error("Please enter a bid amount");
      return;
    }

    setIsBiddingPending(true);
    try {
      await placeBid(featuredAuction.id, quickBidAmount);
      setQuickBidAmount('');
    } catch (err: any) {
      toast.error(err.message || "Bidding failed");
    } finally {
      setIsBiddingPending(false);
    }
  };

  const handleClaimFaucet = async () => {
    try {
      await requestFaucet();
    } catch (err: any) {
      toast.error(err.message || "Faucet claim failed");
    }
  };

  const formatTimeFull = (seconds: number): string => {
    if (seconds <= 0) return "Auction Expired";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  // Staggered layout animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="space-y-20 py-8 relative overflow-hidden">
      {/* Visual background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Ambient background blur circles */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-indigo-500/10 blur-[120px] -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[450px] right-10 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Headline Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center max-w-5xl mx-auto px-4 space-y-6 pt-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 px-4 py-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono">Virtual EVM Sandbox Deployed v0.8.20</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display text-white tracking-tight leading-[1.05]">
          Decentralized Auction <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Engineered For Trust.
          </span>
        </h1>

        <p className="text-sm sm:text-md text-gray-400 max-w-3xl mx-auto leading-relaxed">
          A high-performance English Auction portal running on real-time Solidity smart contracts. Create trustless pools, place gas-optimized bids, and watch blockchain blocks update instantly via the integrated Virtual DevNet Sandbox.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('marketplace')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-widest text-white rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Explore Active Bids</span>
            <Gavel className="h-4 w-4 text-indigo-200" />
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('create')}
            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-white rounded-xl flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Create New Auction</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </motion.button>
        </div>
      </motion.section>

      {/* STARTUP LAUNCH BANNER SECTION */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0D0A20]/90 to-[#070B14]/95 overflow-hidden shadow-2xl relative flex flex-col md:flex-row items-center justify-between gap-8 p-6 md:p-8 backdrop-blur-xl">
          <div className="absolute -right-24 -top-24 h-64 w-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-xl z-10 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1 text-[10px] font-bold text-violet-300 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Official Startup Launch Promotion
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              BidForge v1.0 DevNet is Live!
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed leading-5">
              We are excited to launch BidForge — the ultimate Web3 smart contract sandbox and real-time English auction portal. Start deploying auctions, simulating high-speed transactions, and configure automatic Smart Bid Assist agents to outbid the competition instantly.
            </p>
            <div className="flex gap-3">
              <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase tracking-wider">Launch status:</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">100% Deployed & Operational</span>
            </div>
          </div>

          <div className="w-full md:w-96 shrink-0 aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 shadow-xl relative z-10 group">
            <img 
              src={startupLaunchBanner} 
              alt="BidForge Startup Launch Poster" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.section>

      {/* GRID SECTION: Interactive Sandbox Faucet & Featured Live Auction Card */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Featured Live Interactive Auction (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Interactive Live Demo
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Active State
            </span>
          </div>

          {featuredAuction ? (
            <div className="rounded-2xl border border-white/10 bg-[#0F172A] overflow-hidden shadow-2xl relative group">
              <div className="aspect-video w-full relative overflow-hidden">
                <img 
                  src={featuredAuction.imageUri} 
                  alt={featuredAuction.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-indigo-600 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTimeFull(timeLeft)}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase block tracking-wider">Featured Smart Contract Listing</span>
                  <h3 className="text-md font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors leading-tight">
                    {featuredAuction.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {featuredAuction.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#070B14]/60 rounded-xl p-4 border border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase font-sans">Current Price</span>
                    <span className="text-white font-bold block mt-1">
                      {parseFloat(featuredAuction.highestBid) > 0 ? featuredAuction.highestBid : featuredAuction.startingPrice} ETH
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase font-sans">Highest Bidder</span>
                    <span className="text-gray-300 font-semibold block mt-1 truncate">
                      {featuredAuction.highestBidder ? `${featuredAuction.highestBidder.slice(0, 6)}...${featuredAuction.highestBidder.slice(-4)}` : "No Bidders"}
                    </span>
                  </div>
                </div>

                {/* Direct quick-bidding form */}
                <form onSubmit={handleQuickBid} className="space-y-3">
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold text-gray-500">ETH</span>
                      <input
                        type="number"
                        step="0.001"
                        value={quickBidAmount}
                        onChange={(e) => setQuickBidAmount(e.target.value)}
                        placeholder={`Min: ${(parseFloat(featuredAuction.highestBid) > 0 ? parseFloat(featuredAuction.highestBid) + 0.01 : parseFloat(featuredAuction.startingPrice) + 0.01).toFixed(3)}`}
                        className="w-full rounded-xl bg-[#070B14] border border-white/10 py-3 pl-12 pr-4 text-xs font-bold font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        disabled={isBiddingPending}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isBiddingPending}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isBiddingPending ? "Bidding..." : "Quick Bid"}
                    </button>
                  </div>
                  <span className="text-[9px] text-gray-500 block leading-relaxed">
                    Test the real-time mempool listener! Placing a bid instantly creates a confirmed mock transaction block and updates this screen immediately.
                  </span>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-xs text-gray-500 italic">
              Create an auction in the catalog to initialize the live preview.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Connected Web3 & Onboarding Claim Widget (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-indigo-400" />
              Frictionless Sandbox Wallet Onboarding
            </span>
            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              Local DevNet
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E1B4B]/30 to-[#0F172A]/90 p-6 md:p-8 space-y-6 shadow-xl relative backdrop-blur-md">
            <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
              <div className="space-y-1.5">
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider block">Connected Active Account</span>
                {account ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-white tracking-wide">
                      {account.slice(0, 10)}...{account.slice(-8)}
                    </span>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded uppercase">
                      Local Owner
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={() => connectWallet('virtual')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg cursor-pointer"
                  >
                    Connect Sandbox Network
                  </button>
                )}
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-mono font-semibold uppercase block">Mock Sandbox Wallet Balance</span>
                <span className="text-3xl font-extrabold tracking-tight text-emerald-400 font-mono flex items-baseline gap-1 mt-1">
                  {balance} <span className="text-xs font-semibold text-gray-400 uppercase font-sans">ETH</span>
                </span>
              </div>
            </div>

            {/* Quick claim Faucet action block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-indigo-400" />
                  DevNet Gas & Bidding Faucet
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Need mock currency to bid against developer whales? Claim 5.0 free test ETH with a single click. Transactions are instantly mined into the local block ledger.
                </p>
                <button
                  onClick={handleClaimFaucet}
                  className="px-5 py-2.5 bg-[#070B14] hover:bg-[#0c1222] border border-white/15 hover:border-indigo-500 text-xs font-bold text-indigo-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Coins className="h-4 w-4 text-indigo-400" />
                  Claim 5.00 Free ETH
                </button>
              </div>

              {/* Connected State diagnostics */}
              <div className="space-y-3 p-4 bg-[#070B14]/50 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-relaxed font-medium">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Network Parameters</span>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Target Chain ID:</span>
                    <span className="text-white">1337</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Block height:</span>
                    <span className="text-white">{blockNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tx Event Counter:</span>
                    <span className="text-white">{transactions.length} Tx</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Virtual Gas Cost:</span>
                    <span className="text-emerald-400">0.0012 ETH (Optimal)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* LIVE ACTIVITY EVENT STREAM */}
      <section className="max-w-7xl mx-auto px-4" id="live-activity-feed-section">
        <LiveActivityFeed />
      </section>

      {/* Grid Highlights Statistics Rows */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto"
      >
        {/* Stat 1 */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 relative overflow-hidden backdrop-blur"
        >
          <div className="absolute -right-6 -bottom-6 h-16 w-16 bg-blue-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-3 text-blue-400 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Protocol Volume</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight font-mono">1,842.15 <span className="text-xs text-blue-400">ETH</span></span>
          <p className="text-[10px] text-gray-400 mt-1">Stably audited volume pools</p>
        </motion.div>

        {/* Stat 2 */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 relative overflow-hidden backdrop-blur"
        >
          <div className="absolute -right-6 -bottom-6 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/5">
              <Gavel className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Catalog Listings</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight font-mono">{auctions.length} <span className="text-xs text-emerald-400">Listed</span></span>
          <p className="text-[10px] text-gray-400 mt-1">Total database auctions active</p>
        </motion.div>

        {/* Stat 3 */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 relative overflow-hidden backdrop-blur"
        >
          <div className="absolute -right-6 -bottom-6 h-16 w-16 bg-violet-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-3 text-violet-400 mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/5">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Gas Fee Estimator</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight font-mono">0.0012 <span className="text-xs text-violet-400">Gas</span></span>
          <p className="text-[10px] text-gray-400 mt-1">Minimal smart contract overhead</p>
        </motion.div>

        {/* Stat 4 */}
        <motion.div 
          variants={itemVariants}
          className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-6 relative overflow-hidden backdrop-blur"
        >
          <div className="absolute -right-6 -bottom-6 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl" />
          <div className="flex items-center gap-3 text-cyan-400 mb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/5">
              <Globe className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Block Sync Time</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight font-mono">~15s <span className="text-xs text-cyan-400">Clock</span></span>
          <p className="text-[10px] text-gray-400 mt-1">EVM State synchronicity</p>
        </motion.div>
      </motion.section>

      {/* SECTION: Solidity Anatomy & State Workflow Explainer */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">On-Chain Safety Blueprint</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Anatomy of the English Auction Contract
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Understand how our decentralized ledger models state transfers, prevents reentrancy, and registers bids on-chain.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-white/5 pb-4">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'deploy' ? 'bg-indigo-600/15 border border-indigo-500/30 text-white' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            1. Listing Deployment
          </button>
          <button
            onClick={() => setActiveTab('bid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'bid' ? 'bg-indigo-600/15 border border-indigo-500/30 text-white' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            2. Trustless Bidding
          </button>
          <button
            onClick={() => setActiveTab('pull')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'pull' ? 'bg-indigo-600/15 border border-indigo-500/30 text-white' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            3. Secure Pull Payments
          </button>
          <button
            onClick={() => setActiveTab('settle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'settle' ? 'bg-indigo-600/15 border border-indigo-500/30 text-white' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            4. Payout Settlement
          </button>
        </div>

        {/* Tab Body */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/80 p-6 md:p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'deploy' && (
              <motion.div
                key="deploy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300 font-bold uppercase">
                    DEPLOYMENT LIFECYCLE
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Initializing Contract Auctions</h3>
                  <p className="text-xs text-gray-400 leading-relaxed leading-6">
                    Sellers broadcast a listing transaction specifying the item metadata, starting reserve price, and countdown lock duration. The contract maps this data structure to a state mapping keyed by a unique listing ID inside the Ethereum state trie.
                  </p>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>Registers starting price, mapping to sellers address.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>Locks countdown parameters to guarantee non-extendable lifetimes.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#070B14] rounded-xl border border-white/5 p-4 font-mono text-[11px] text-gray-400 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500">// Deploy Struct initialized inside Storage</span>
                  <pre className="text-xs text-indigo-300 whitespace-pre-wrap leading-relaxed">
{`struct Auction {
    uint256 id;
    address payable seller;
    string title;
    string description;
    uint256 startingPrice;
    uint256 highestBid;
    address highestBidder;
    uint256 endTime;
    bool ended;
}`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'bid' && (
              <motion.div
                key="bid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-300 font-bold uppercase">
                    EVM EXECUTION TRACE
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Validating Inbound Mempool Bids</h3>
                  <p className="text-xs text-gray-400 leading-relaxed leading-6">
                    Each incoming bid must be strictly greater than the current highest bid + minimum increment parameters. The smart contract validates that the bidder is not the seller and that the countdown lock has not elapsed.
                  </p>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Checks: msg.value &gt; highestBid (reverts on failure).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Prevents sellers from bidding on their own listings.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#070B14] rounded-xl border border-white/5 p-4 font-mono text-[11px] text-gray-400 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500">// Execution Checks</span>
                  <pre className="text-xs text-amber-300 whitespace-pre-wrap leading-relaxed">
{`require(msg.sender != auction.seller, "Seller cannot bid");
require(msg.value > auction.highestBid, "Bid too low");
require(block.timestamp < auction.endTime, "Ended");`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'pull' && (
              <motion.div
                key="pull"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 font-bold uppercase">
                    SECURITY VULNERABILITY MITIGATION
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">The Secure Pull-Payments Standard</h3>
                  <p className="text-xs text-gray-400 leading-relaxed leading-6">
                    To completely eliminate reentrancy loops and denial-of-service (DoS) attack vectors, BidForge implements the Pull Payments model. When a user is outbid, their funds are **not** immediately sent back. Instead, they are credited to a secure mapping address ledger.
                  </p>
                  <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3.5 flex gap-2.5 text-xs text-amber-400 leading-normal">
                    <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Why this matters:</strong> If a bidder has an invalid contract fallback that throws errors when receiving ETH, they can block subsequent honest bids indefinitely. Pull-payments maps returns to a personal claim index instead, bypassing malicious fallbacks.
                    </span>
                  </div>
                </div>
                <div className="bg-[#070B14] rounded-xl border border-white/5 p-4 font-mono text-[11px] text-gray-400 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500">// Secure mapping warehouse pattern</span>
                  <pre className="text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed">
{`// Warehousing outbid collateral
if (auction.highestBidder != address(0)) {
    pendingReturns[auction.highestBidder] += auction.highestBid;
}
// State changes set before external route
auction.highestBidder = msg.sender;
auction.highestBid = msg.value;`}
                  </pre>
                </div>
              </motion.div>
            )}

            {activeTab === 'settle' && (
              <motion.div
                key="settle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono text-violet-300 font-bold uppercase">
                    CONTRACT FINALIZATION
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Finalizing State & Disbursing Collateral</h3>
                  <p className="text-xs text-gray-400 leading-relaxed leading-6">
                    Once the countdown timer reaches zero, the auction is officially settled. Anyone can trigger the finalization, pushing the winning bid collateral directly to the seller's wallet and locking the item status as ended.
                  </p>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                      <span>Transfers the highest bid value to the seller's verified address.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                      <span>Locks the contract permanently, preventing further state inputs.</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#070B14] rounded-xl border border-white/5 p-4 font-mono text-[11px] text-gray-400 space-y-3">
                  <span className="text-[10px] font-bold text-gray-500">// Settlement Routine</span>
                  <pre className="text-xs text-violet-300 whitespace-pre-wrap leading-relaxed">
{`function endAuction(uint256 _auctionId) external nonReentrant {
    Auction storage auction = auctions[_auctionId];
    require(block.timestamp >= auction.endTime, "Still active");
    require(!auction.ended, "Already ended");
    
    auction.ended = true;
    emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);
    
    auction.seller.transfer(auction.highestBid);
}`}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION: Live Sandbox Diagnostics Terminal / Events Feed */}
      <section className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-emerald-400" />
              Live Virtual Sandbox Diagnostics Console
            </h3>
            <span className="text-[10px] text-gray-500 block mt-1">Real-time memory logs recording virtual smart contract activities.</span>
          </div>

          <button
            onClick={() => onNavigate('explorer')}
            className="self-start text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View Full Block Explorer</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Console Box */}
        <div className="rounded-2xl border border-white/10 bg-[#070B14] p-5 font-mono text-xs text-gray-300 space-y-4 relative shadow-2xl">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            EVM Listening
          </div>

          <div className="space-y-2 border-b border-white/5 pb-3">
            <span className="text-gray-500 text-[10px] font-bold block">// Node Connection Status</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500">RPC Endpoint:</span> <span className="text-white">Local-DevNet-Sandbox</span>
              </div>
              <div>
                <span className="text-gray-500">Client Host:</span> <span className="text-white">AI-Studio-Iframe</span>
              </div>
              <div>
                <span className="text-gray-500">Latency:</span> <span className="text-emerald-400">1.2ms (Instantaneous)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
            <span className="text-gray-500 text-[10px] font-bold block">// Event Logs stream</span>
            {transactions.slice(0, 4).map((tx, idx) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/5 bg-[#0F172A]/50 text-[11px]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">{tx.hash.slice(0, 12)}...</span>
                      <span className={`text-[9px] font-bold tracking-wide uppercase font-sans ${tx.method === 'placeBid' ? 'text-indigo-400' : tx.method === 'faucet' ? 'text-emerald-400' : 'text-violet-400'}`}>
                        [{tx.method}]
                      </span>
                    </div>
                    <span className="text-gray-500 block">From: {tx.from.slice(0, 14)}... To: {tx.to.slice(0, 14)}...</span>
                  </div>
                </div>

                <div className="text-left sm:text-right font-semibold">
                  <span className="text-white block">{tx.value !== "0.0" ? `${tx.value} ETH` : "0.00 ETH"}</span>
                  <span className="text-gray-500 text-[10px] block font-medium">Block: {tx.blockNumber} • Gas: {tx.gasUsed}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CALL-TO-ACTION */}
      <section className="max-w-4xl mx-auto px-4 text-center py-10">
        <div className="rounded-2xl bg-gradient-to-tr from-[#1E1B4B]/80 to-[#0F172A]/90 border border-indigo-500/20 p-8 md:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/10 rounded-full blur-xl" />
          
          <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Ready to join the virtual blockchain?</h2>
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            Connect your MetaMask extension for testnet execution, or play immediately inside the Virtual DevNet Sandbox with pre-funded wallets.
          </p>
          
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-widest text-white rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer transition-all inline-flex items-center gap-2"
          >
            <span>Launch BidForge Terminal</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
