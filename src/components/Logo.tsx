import React from 'react';
import { motion } from 'motion/react';
import { Gavel, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className = '' }) => {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
    xl: 'h-10 w-10'
  };

  const containerSizes = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-14 w-14 rounded-2xl',
    xl: 'h-20 w-20 rounded-[24px]'
  };

  const fontSizes = {
    sm: 'text-md',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Glow Ambient Ring */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 3 }}
        className={`relative flex items-center justify-center bg-gradient-to-tr from-violet-600 via-indigo-500 to-fuchsia-400 p-0.5 shadow-xl shadow-violet-500/15 ${containerSizes[size]}`}
      >
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-tr from-violet-600 to-fuchsia-500 opacity-40 blur-md animate-pulse" />
        
        <div className="relative flex h-full w-full items-center justify-center rounded-[calc(inherit-2px)] bg-[#03000A]">
          <Gavel className={`${iconSizes[size]} text-violet-400`} />
          
          {size === 'xl' && (
            <motion.div 
              animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-5 w-5 text-fuchsia-300" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {withText && (
        <div className="flex flex-col justify-center">
          <span className={`font-sans font-bold tracking-tight text-white leading-none ${fontSizes[size]}`}>
            Bid<span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Forge</span>
          </span>
          {size === 'lg' && (
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest mt-1 font-bold">
              Secure Ledger Sandbox
            </span>
          )}
          {size === 'xl' && (
            <span className="text-xs font-mono text-fuchsia-400 uppercase tracking-widest mt-1.5 font-bold">
              Consensus & Smart Contract Portal
            </span>
          )}
        </div>
      )}
    </div>
  );
};
