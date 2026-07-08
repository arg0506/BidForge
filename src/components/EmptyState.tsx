import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, HelpCircle, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'inbox' | 'alert' | 'help';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon = 'inbox', 
  action 
}) => {
  const Icon = icon === 'alert' ? AlertCircle : icon === 'help' ? HelpCircle : Inbox;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 max-w-lg mx-auto my-12"
    >
      <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-4 text-indigo-400 mb-4 animate-bounce">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-md font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">{description}</p>
      
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};
