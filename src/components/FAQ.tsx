import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, ShieldAlert, Zap, Coins, KeyRound, Hammer } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ComponentType<any>;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      question: "What is BidForge and how does it work?",
      answer: "BidForge is a high-performance Web3 sandbox that simulates an English auction platform on a virtual, zero-gas DevNet. It compiles full-fidelity Solidity smart contracts to orchestrate bidding state, consensus ledger, and refunds. You can connect a virtual wallet, claim testnet ETH tokens from the sandbox faucet, and run full end-to-end auction cycles immediately.",
      icon: Hammer
    },
    {
      question: "How does the 'Smart Bid Assist' auto-outbidding agent work?",
      answer: "When you enable 'Smart Bid Assist' on an active listing and set your maximum bidding threshold, our backend monitoring engine listens for real-time blockchain event logs. If another user outbids you, the assistant immediately triggers a contract call within 3 seconds, incrementing the bid by +0.005 ETH, as long as the cost does not exceed your defined limit.",
      icon: Zap
    },
    {
      question: "What is the non-reentrant shield mentioned in the specifications?",
      answer: "The platform's Solidity smart contracts implement strict state-transition guards (ReentrancyGuards) to prevent double-spend vulnerability exploits. During the bidding lifecycle, external interaction callbacks are isolated using state locks, blocking malicious contracts from hijacking execution flows to drain or copy collateral assets.",
      icon: ShieldAlert
    },
    {
      question: "How do Pull Payments guarantee fund security?",
      answer: "Instead of immediately pushing outbid funds back to users' wallets—which can block execution if the recipient contract fails—BidForge uses an asynchronous 'Pull Payment' pattern. Outbid amounts are securely mapped in an escrow ledger on-chain. Outbid participants can easily withdraw their locked collateral at any time using the withdrawal dashboard.",
      icon: KeyRound
    },
    {
      question: "Is there any real gas or cryptocurrency required?",
      answer: "No. BidForge operates entirely in an isolated, simulated sandbox environment using a custom gas policy. This means you do not need real mainnet ETH, testnet Sepolia ETH, or any browser extensions to experiment with the system. You can spin up virtual accounts and seed them instantly with free developer tokens.",
      icon: Coins
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full space-y-4 max-w-4xl mx-auto" id="faq-container">
      {faqData.map((item, index) => {
        const isOpen = openIndex === index;
        const Icon = item.icon;
        
        return (
          <div
            key={index}
            id={`faq-item-${index}`}
            className="rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] backdrop-blur-md transition-all duration-300 overflow-hidden"
          >
            {/* Accordion Trigger Header */}
            <button
              onClick={() => handleToggle(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors duration-300 ${isOpen ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' : 'bg-white/5 text-gray-400 border border-transparent'}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="text-sm font-bold text-gray-200 hover:text-white transition-colors duration-300 leading-snug">
                  {item.question}
                </span>
              </div>
              <div className={`p-1 rounded-lg bg-white/5 border border-white/5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-violet-400' : ''}`}>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </div>
            </button>

            {/* Accordion Content Panel */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 pt-1 text-xs text-gray-400 leading-relaxed border-t border-white/5 bg-white/[0.005]">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
