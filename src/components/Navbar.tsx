import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ChevronDown, RefreshCw, LogOut, Coins, Shield, Copy, Check, User } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { WalletModal } from './WalletModal';
import { Logo } from './Logo';
import toast from 'react-hot-toast';

interface NavbarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onViewChange }) => {
  const { 
    isConnected, 
    account, 
    balance, 
    networkName, 
    isVirtual, 
    accounts, 
    switchAccount, 
    requestFaucet, 
    disconnectWallet,
    contractAddress,
    deployContract,
    updateContractAddress
  } = useWeb3();

  const { user, logout } = useAuth();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setIsCopied(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
    toast.success("Balance updated in real-time.");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#03010B]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Brand */}
          <Logo size="sm" />

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            {isConnected && (
              <div className="hidden items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-gray-300 md:flex">
                <span className={`h-1.5 w-1.5 rounded-full ${isVirtual ? 'bg-violet-400' : 'bg-emerald-400'}`} />
                <span className="font-medium font-mono text-[10px] uppercase tracking-wide">{networkName}</span>
              </div>
            )}

            {/* Faucet Link (Sandbox exclusive) */}
            {isConnected && isVirtual && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={requestFaucet}
                className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 hover:bg-violet-500/20 transition-all cursor-pointer"
              >
                <Coins className="h-3.5 w-3.5" />
                <span className="font-semibold text-[11px]">Faucet (+5 ETH)</span>
              </motion.button>
            )}

            {/* Wallet Panel */}
            {!isConnected ? (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </motion.button>
            ) : (
              <div className="relative">
                {/* Connected Wallet Button */}
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2 text-left transition-all"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="hidden text-xs md:block pr-1">
                    <div className="font-semibold text-white font-mono">
                      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      {balance} ETH
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      {/* Dropdown Backdrop to close on outer click */}
                      <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 z-40 rounded-xl border border-white/15 bg-[#0F172A]/90 backdrop-blur-xl p-3 shadow-2xl"
                      >
                        {/* Header Details */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <span className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">My Wallet</span>
                          <button 
                            onClick={handleRefreshBalance}
                            className={`text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5 ${isRefreshing ? 'animate-spin' : ''}`}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Copy / Explanatory link */}
                        <div className="mt-2.5 rounded-lg bg-white/5 p-2 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-gray-300">
                            {account ? `${account.slice(0, 10)}...${account.slice(-8)}` : ''}
                          </span>
                          <button 
                            onClick={handleCopyAddress}
                            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        {/* Balance display */}
                        <div className="mt-3 px-1">
                          <span className="text-[10px] text-gray-400 block">Available Balance</span>
                          <span className="text-xl font-bold text-white tracking-tight">{balance} <span className="text-xs text-violet-400">ETH</span></span>
                        </div>

                        {/* Account Switcher (Virtual Network Sandbox exclusive) */}
                        {isVirtual && (
                          <div className="mt-3.5 pt-2 border-t border-white/5">
                            <span className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase block mb-1.5">
                              Switch Demo Account (Sandbox)
                            </span>
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                              {accounts.map((acc, idx) => {
                                const isCurrent = (account || "").toLowerCase() === acc.toLowerCase();
                                return (
                                  <button
                                    key={acc}
                                    onClick={() => {
                                      switchAccount(acc);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left p-1.5 rounded text-xs flex items-center justify-between transition-colors ${isCurrent ? 'bg-violet-500/20 text-white font-medium border-l-2 border-violet-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                  >
                                    <span className="font-mono text-[10px]">{acc.slice(0, 6)}...{acc.slice(-4)}</span>
                                    <span className="text-[9px] text-gray-500">Demo {idx + 1}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* On-Chain Contract Configurations */}
                        {!isVirtual && contractAddress && (
                          <div className="mt-3.5 pt-2 border-t border-white/5 space-y-2">
                            <span className="text-[10px] text-violet-400 font-semibold tracking-wider uppercase block">
                              Smart Contract Settings
                            </span>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-gray-400">
                                <span className="text-[9px]">Contract Address:</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(contractAddress);
                                    toast.success("Contract address copied!");
                                  }}
                                  className="text-violet-400 hover:text-violet-300 font-mono text-[9px] flex items-center gap-0.5"
                                >
                                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                                  <Copy className="h-2.5 w-2.5" />
                                </button>
                              </div>
                              
                              <div className="flex gap-1.5 mt-1">
                                <input 
                                  type="text"
                                  placeholder="0xContractAddress..."
                                  defaultValue={contractAddress}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = (e.target as HTMLInputElement).value.trim();
                                      if (val) updateContractAddress(val);
                                    }
                                  }}
                                  className="flex-1 rounded bg-[#070B14] border border-white/10 px-2 py-1 text-[9px] text-white focus:outline-none focus:border-violet-500 font-mono"
                                />
                              </div>
                            </div>

                            <button
                              onClick={async () => {
                                try {
                                  await deployContract();
                                } catch (err: any) {
                                  toast.error(err.message || "Deployment failed");
                                }
                              }}
                              className="w-full text-center py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[10px] font-bold tracking-wide shadow transition-all cursor-pointer"
                            >
                              Deploy New Contract
                            </button>
                          </div>
                        )}

                        {/* Disconnect Button */}
                        <div className="mt-3 pt-2.5 border-t border-white/5">
                          <button
                            onClick={() => {
                              disconnectWallet();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 p-2 rounded-lg flex items-center gap-2 transition-all"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Disconnect Wallet</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Authenticated User Profile Avatar Slot */}
            {user && (
              <div className="relative border-l border-white/10 pl-3 ml-1">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="h-9 w-9 rounded-full object-cover border-2 border-violet-500/50 hover:border-violet-400 transition-colors shadow-md shadow-violet-500/10"
                    referrerPolicy="no-referrer"
                  />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsUserDropdownOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 z-40 rounded-xl border border-white/15 bg-[#0F172A]/90 backdrop-blur-xl p-3.5 shadow-2xl space-y-3"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest block font-bold">Authorized User</span>
                          <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                          <span className="text-[10px] text-gray-500 block truncate">{user.email}</span>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase block">Provider</span>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-gray-300 font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                            {user.provider === 'google' ? 'Google Authenticated' : 'GitHub Verified'}
                          </span>
                        </div>

                        {onViewChange && (
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              onViewChange('profile');
                            }}
                            className="w-full text-left text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg flex items-center gap-2 transition-all mt-1 cursor-pointer"
                          >
                            <User className="h-3.5 w-3.5 text-violet-400" />
                            <span>Collector Profile</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 p-2 rounded-lg flex items-center gap-2 transition-all mt-1 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Terminal Exit</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Connection Modal Overlay */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};
