import React from 'react';
import { motion } from 'motion/react';
import { Compass, Gavel, PlusCircle, Activity, User2, RefreshCw, Layers, User } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { isConnected, blockNumber, isVirtual } = useWeb3();

  const menuItems = [
    { id: 'home', label: 'Discover', icon: Compass, color: 'text-blue-400 bg-blue-500/5' },
    { id: 'marketplace', label: 'Live Marketplace', icon: Gavel, color: 'text-indigo-400 bg-indigo-500/5' },
    { id: 'create', label: 'Launch Auction', icon: PlusCircle, color: 'text-violet-400 bg-violet-500/5' },
    { id: 'my-auctions', label: 'Sellers Dashboard', icon: User2, color: 'text-cyan-400 bg-cyan-500/5' },
    { id: 'profile', label: 'My Profile', icon: User, color: 'text-fuchsia-400 bg-fuchsia-500/5' },
    { id: 'explorer', label: 'Blockchain Logs', icon: Activity, color: 'text-emerald-400 bg-emerald-500/5' },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#070B14] hidden md:flex flex-col shrink-0 p-4 justify-between h-[calc(100vh-64px)] sticky top-16">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <span className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase px-3 block mb-3">
            Main Portal
          </span>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${isActive ? 'text-white bg-white/5 border-l-2 border-indigo-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {/* Subtle hover background highlight */}
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 bg-[#111827]/30 rounded-xl -z-10"
                    />
                  )}
                  
                  <div className={`p-1.5 rounded-lg transition-colors ${item.color} ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>

                  {/* Pulse indicator for Live Auctions */}
                  {item.id === 'marketplace' && (
                    <span className="ml-auto flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System telemetry box (Simulating live node connections) */}
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Node Telemetry</span>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">Status:</span>
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px]">Synchronized</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">Latency:</span>
              <span className="text-gray-300 font-mono">1.4ms</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">Block Height:</span>
              <span className="text-indigo-300 font-mono flex items-center gap-1">
                <Layers className="h-3 w-3 inline text-indigo-400" />
                {blockNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500 font-medium">Engine:</span>
              <span className="text-amber-400 font-semibold text-[10px] uppercase">
                {isVirtual ? 'VIRTUAL EVM' : 'INJECTED EVM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="px-3">
        <p className="text-[10px] text-gray-600">
          BidForge Protocol v1.4.0
        </p>
        <p className="text-[9px] text-gray-600 mt-0.5 font-medium">
          Secure Multi-chain Auctions
        </p>
      </div>
    </aside>
  );
};
