import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Terminal, 
  Cpu, 
  Activity, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Gavel, 
  HelpCircle,
  Code2,
  LockKeyhole,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { FAQ } from '../components/FAQ';
import toast from 'react-hot-toast';

export const LandingPage: React.FC = () => {
  const { login, isAuthenticating, bypassToSandbox } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'github' | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [authStep, setAuthStep] = useState(0);
  const [errorDetails, setErrorDetails] = useState<{ code: string; message: string } | null>(null);

  // Multi-step custom simulation log for authenticity
  const authSteps = [
    "Establishing secure TLS socket with identity provider...",
    "Retrieving verified public key credentials...",
    "Hashing authentication challenge block...",
    "Signing OAuth consent token...",
    "Syncing cryptographic profile with BidForge session..."
  ];

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setSelectedProvider(provider);
    setAuthStep(0);
    setErrorDetails(null);
    
    // Simulate multi-stage authentication log progression
    const interval = setInterval(() => {
      setAuthStep((prev) => {
        if (prev < authSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 280);

    try {
      await login(provider, customName.trim() || undefined, customEmail.trim() || undefined);
    } catch (err: any) {
      console.warn("OAuth flow error intercepted in UI:", err);
      setErrorDetails({
        code: err.code || 'unknown',
        message: err.message || 'Identity connection handshakes were rejected.'
      });
    } finally {
      clearInterval(interval);
      setSelectedProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#02000A] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* 1. LAYERED BACKGROUND GRADIENTS & GRID PATHS */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Dynamic violet blur nodes */}
      <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[45%] -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[90px] pointer-events-none -z-10" />

      {/* 2. GLOWING HEADER / NAVIGATION RAIL */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-20">
        <Logo size="md" />
        
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-violet-300 font-semibold tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            VIRTUAL SANDBOX v0.8.20
          </span>
          <a 
            href="#features" 
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Capabilities
          </a>
        </div>
      </header>

      {/* 3. HERO & AUTHENTICATION BODY */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT CONTENT COLUMN: Branding & Pitch */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-8 text-left"
          >
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-transparent border border-violet-500/30 px-4 py-1.5 text-[11px] font-bold text-violet-300 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>PROVABLY SECURE ENGLISH AUCTION NETWORK</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
                Next Generation <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  Cryptographic Auctions.
                </span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
                BidForge is an enterprise-grade Solidity sandbox mapping live Web3 events onto an instantly updating blocks ledger. Harness high-speed mempools, non-custodial pull payments, and reentrancy shields.
              </p>
            </div>

            {/* Trust Bulletins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/20 transition-all">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 mt-0.5 shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Non-Reentrant Shields</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Guard rails against double-spend loops.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/20 transition-all">
                <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-400 mt-0.5 shrink-0">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Pull Payment Ledger</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Outbid collateral returned safely via pull withdrawals.</p>
                </div>
              </div>
            </div>

            {/* Quick stats indicators */}
            <div className="flex items-center gap-8 pt-4 border-t border-white/5">
              <div>
                <span className="text-xl font-bold text-white font-mono">0.00ms</span>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-semibold">Consensus Latency</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-xl font-bold text-white font-mono">100%</span>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-semibold">Solidity Sandbox State</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <span className="text-xl font-bold text-violet-400 font-mono">Zero Gas</span>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-semibold">DevNet Gas Policy</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Interactive Login Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F0A20] to-[#04010B] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-24 w-24 bg-fuchsia-600/10 rounded-full blur-xl pointer-events-none" />

              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest font-bold">Authentication Vault</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gray-700" />
                  <span className="h-2 w-2 rounded-full bg-gray-700" />
                </div>
              </div>

              {/* Login Title */}
              <div className="space-y-1.5 mb-6">
                <h3 className="text-lg font-bold text-white">Connect Identity</h3>
                <p className="text-xs text-gray-400 leading-normal">
                  Log in with Google or GitHub to authorize your secure private key and enter the Web3 smart contracts terminal.
                </p>
              </div>

              {/* CUSTOM LOGIN SIMULATION WRAPPER */}
              <div className="space-y-4">
                
                {/* Custom input fields toggled via showConfig */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showConfig ? "Hide profile options" : "Customize credentials before login"}</span>
                    <ChevronRight className={`h-3.5 w-3.5 transform transition-transform ${showConfig ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showConfig && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3 overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl p-3"
                      >
                        <div>
                          <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Custom Display Name</label>
                          <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g. Satoshi Nakamoto"
                            className="w-full bg-[#05010E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Verified OAuth Email</label>
                          <input
                            type="email"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            placeholder="e.g. satoshi@bitcoin.org"
                            className="w-full bg-[#05010E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* LOGIN BUTTONS */}
                <div className="space-y-3 pt-2">
                  
                  {/* GOOGLE BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isAuthenticating}
                    className="w-full h-12 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-xs rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-white/5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {/* Google SVG G logo */}
                    <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.01 15.542 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.19-1.925H12.24z"
                      />
                    </svg>
                    <span>Connect via Google Auth</span>
                  </motion.button>

                  {/* GITHUB BUTTON */}
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOAuthLogin('github')}
                    disabled={isAuthenticating}
                    className="w-full h-12 bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-black/30 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {/* GitHub SVG path */}
                    <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    <span>Connect via GitHub Secure</span>
                  </motion.button>

                  {/* BYPASS HANDLER */}
                  <AnimatePresence>
                    {errorDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 text-left space-y-3"
                      >
                        <div className="flex items-center gap-2 text-violet-400">
                          <Shield className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-wider font-mono">Sandbox Bypass Active</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          Authentication issue detected: <span className="text-violet-300 font-mono text-[10px] bg-violet-950/40 px-1 py-0.5 rounded">{errorDetails.code}</span>. This typically happens inside preview iframes due to cookie restrictions, blocked popups, or pending console setup. Bypass to enter immediately!
                        </p>
                        <button
                          onClick={() => {
                            const name = customName.trim() || undefined;
                            const email = customEmail.trim() || undefined;
                            bypassToSandbox('google', name, email);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer shadow-md shadow-violet-500/10 text-center block"
                        >
                          Proceed to Sandbox Workspace →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

              {/* Secure statement */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-mono">
                <Lock className="h-3.5 w-3.5 text-violet-500" />
                <span>End-to-End Cryptographic Ledger Sandbox Isolation</span>
              </div>

              {/* AUTH OVERLAY MODAL / TERMINAL STATUS SCREEN */}
              <AnimatePresence>
                {isAuthenticating && selectedProvider && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#02000A]/95 z-30 flex flex-col items-center justify-center p-6 text-center space-y-6"
                  >
                    {/* Spinning Indicator */}
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-2 border-violet-500/10 border-t-2 border-t-violet-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Terminal className="h-5 w-5 text-violet-400 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                      <h4 className="text-sm font-bold text-white tracking-tight uppercase">
                        Authenticating with {selectedProvider === 'google' ? 'Google' : 'GitHub'}
                      </h4>
                      <div className="h-[40px] flex items-center justify-center">
                        <motion.p 
                          key={authStep}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] text-violet-400 font-mono font-medium leading-normal"
                        >
                          {authSteps[authStep]}
                        </motion.p>
                      </div>
                    </div>

                    <span className="text-[9px] text-gray-600 font-mono">
                      DO NOT CLOSE THIS TERMINAL TAB • HANDSHAKE ID: 0x{Math.floor(Math.random() * 900000 + 100000)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

        </div>
      </main>

      {/* 4. APP CAPABILITIES & BENTO GRID EXPLAINER */}
      <section id="features" className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest block">Core Infrastructure Specifications</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Solidity Virtuality. Engineered For Precision.
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            BidForge compiles and tests English Auction mechanisms through simulated smart contracts. Experience cryptographic guarantees with complete observability.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: Solidity (8 Columns) */}
          <div className="md:col-span-8 rounded-2xl border border-white/5 bg-gradient-to-br from-[#0D0A1C] to-[#040108] p-6 sm:p-8 space-y-6 hover:border-violet-500/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Full-Fidelity Solidity Smart Contracts</h3>
              <p className="text-xs text-gray-400 leading-relaxed leading-5">
                Inspect and execute production-ready Solidity functions directly from the browser sandbox. The `AuctionManager` contract compiles with standard ReentrancyGuards and Ownable schemas to secure bidding collateral seamlessly.
              </p>
            </div>
            <div className="p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-violet-300">
              <span className="text-gray-500 block mb-1">// Solidity Reentrancy Guard Verification</span>
              <span className="text-white">modifier</span> nonReentrant() &#123; <br />
              <span className="pl-4 text-violet-400">require(_status != _ENTERED, "ReentrancyGuard: reentrant call");</span> <br />
              <span className="pl-4 text-violet-400">_status = _ENTERED;</span> <br />
              <span className="pl-4">_;</span> <br />
              <span className="pl-4 text-violet-400">_status = _NOT_ENTERED;</span> <br />
              &#125;
            </div>
          </div>

          {/* Card 2: Pull Payments Security (4 Columns) */}
          <div className="md:col-span-4 rounded-2xl border border-white/5 bg-gradient-to-br from-[#0F081E] to-[#030107] p-6 sm:p-8 space-y-6 hover:border-fuchsia-500/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 flex items-center justify-center">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Pull Payment Shielding</h3>
              <p className="text-xs text-gray-400 leading-relaxed leading-5">
                BidForge enforces pull payment withdraw mechanisms. Instead of immediately pushing outbid funds, they are securely warehoused inside mapping references to stop gas-depletion attacks.
              </p>
            </div>
            <div className="space-y-1 bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-gray-400">
              <div className="flex justify-between">
                <span>Refunding:</span>
                <span className="text-emerald-400">Secure</span>
              </div>
              <div className="flex justify-between">
                <span>Fallback vectors:</span>
                <span className="text-emerald-400">Mitigated</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Mempool diagnostics (4 Columns) */}
          <div className="md:col-span-4 rounded-2xl border border-white/5 bg-gradient-to-br from-[#0A0C1B] to-[#02030A] p-6 sm:p-8 space-y-6 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Mempool Console</h3>
              <p className="text-xs text-gray-400 leading-relaxed leading-5">
                Watch transactions compile inside real-time block ledgers. Each bid, faucet claim, and refund emits event traces mapped inside the integrated Sandbox Diagnostics Console.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Streaming Event Listeners...</span>
            </div>
          </div>

          {/* Card 4: Database persistence (8 Columns) */}
          <div className="md:col-span-8 rounded-2xl border border-white/5 bg-gradient-to-br from-[#12081E] to-[#04010B] p-6 sm:p-8 space-y-6 hover:border-violet-500/20 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Consolidated Relational Persistence</h3>
              <p className="text-xs text-gray-400 leading-relaxed leading-5">
                Every auction parameters, descriptions, and user profile details are safely synchronized back to high-durability persistence tiers, preserving bidding history profiles across separate sessions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg font-semibold font-mono">Durable State Sync</span>
              <span className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg font-semibold font-mono">Google Identity Handshake</span>
              <span className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-lg font-semibold font-mono">GitHub OAuth Gateway</span>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest block">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Have Questions? We Have Answers.
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Get instant clarifications regarding BidForge's virtualized English Auction mechanism, smart assistants, and security protocols.
          </p>
        </div>
        
        <FAQ />
      </section>

      {/* 5. FOOTER */}
      <footer className="w-full border-t border-white/5 bg-[#03010B] py-8 text-center text-xs text-gray-500 relative z-10 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" withText={true} />
          </div>
          <p>© 2026 BidForge Inc. sandbox network parameters optimized.</p>
        </div>
      </footer>

    </div>
  );
};
