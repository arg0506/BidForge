import React from 'react';
import { motion } from 'motion/react';
import { X, Wallet, ShieldCheck, Zap, Info } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnected, account } = useWeb3();

  if (!isOpen) return null;

  const handleConnect = async (walletType: 'metamask' | 'rabby' | 'coinbase' | 'virtual' | 'freighter') => {
    try {
      await connectWallet(walletType);
      onClose();
    } catch (err) {
      // toast is already fired inside context
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5"
      >
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl" />
        <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-violet-500/10 blur-xl" />

        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
              <p className="text-xs text-gray-400">Select your preferred Web3 provider</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full bg-white/5 p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning info about iframe restrictions */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-3 text-xs text-indigo-300">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Inside standard sandbox previews, browser extensions like MetaMask can be blocked. Use the <strong className="text-white font-medium">Virtual DevNet Sandbox</strong> to unlock 100% features instantly!
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {/* Virtual Network Option - Highlighted! */}
          <button
            onClick={() => handleConnect('virtual')}
            className="relative w-full overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 p-4 text-left transition-all duration-300 hover:border-amber-500/50 group"
          >
            <div className="absolute top-0 right-0 rounded-bl-lg bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold text-amber-300 tracking-wider uppercase flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" /> Recommended
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white group-hover:text-amber-300 transition-colors">Virtual Sandbox (DevNet)</h4>
                <p className="text-xs text-gray-400 mt-0.5">Pre-funded whale accounts, faucet, & competition simulator.</p>
              </div>
            </div>
          </button>

          {/* Freighter Wallet */}
          <button
            onClick={() => handleConnect('freighter')}
            className="w-full rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 p-4 text-left transition-all duration-300 hover:border-indigo-500/30 group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 p-2 text-white shrink-0">
                <img 
                  src="https://raw.githubusercontent.com/stellar/freighter-api/master/docs/assets/freighter-logo.svg" 
                  alt="Freighter Wallet" 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    // Fallback to wallet icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Wallet className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">Freighter Wallet</h4>
                <p className="text-xs text-gray-400 mt-0.5">Stellar's premier browser extension for Soroban dApps</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-500">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
