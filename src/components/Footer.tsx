import React from 'react';
import { Coins, Github, Twitter, MessageSquare, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-[#070B14] py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          {/* Left Brand details */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#070B14]">
                <Coins className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-sans text-md font-bold tracking-tight text-white">
                Bid<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Forge</span>
              </span>
              <p className="text-[10px] text-gray-500 mt-0.5">Decentralized Trustless English Auctions</p>
            </div>
          </div>

          {/* Links Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-gray-400 font-medium">
            <a href="#about" className="hover:text-white transition-colors">About Protocol</a>
            <a href="#audit" className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Audited Contract
            </a>
            <a href="#docs" className="hover:text-white transition-colors">Smart Contract Docs</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Use</a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-white/5 bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
              <Twitter className="h-4 w-4" />
            </button>
            <button className="rounded-xl border border-white/5 bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
              <Github className="h-4 w-4" />
            </button>
            <button className="rounded-xl border border-white/5 bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all">
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Gradient divider line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-600 mt-6 gap-3">
          <p>© 2026 BidForge Inc. All sovereign rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with extreme precision for the <span className="text-indigo-400 font-bold">Web3 Global Hackathon</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};
