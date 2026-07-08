import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Layers, Coins, ExternalLink, Search, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export const BlockExplorer: React.FC = () => {
  const { transactions, blockNumber, contractAddress } = useWeb3();
  const [searchHash, setSearchHash] = useState("");

  const filteredTxs = transactions.filter(tx => {
    if (!searchHash.trim()) return true;
    return tx.hash.toLowerCase().includes(searchHash.toLowerCase()) || 
           tx.from.toLowerCase().includes(searchHash.toLowerCase()) || 
           tx.to.toLowerCase().includes(searchHash.toLowerCase()) || 
           tx.method.toLowerCase().includes(searchHash.toLowerCase());
  });

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-8 relative">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="h-5.5 w-5.5 text-emerald-400 shrink-0" />
          BidForge EVM Block Explorer
        </h2>
        <p className="text-xs text-gray-400">Inspect real-time blocks, contract gas logs, and transactions deployed in the virtual sandbox.</p>
      </div>

      {/* Grid Diagnostics stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Stat 1 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/25">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Active Block Height</span>
            <span className="text-xl font-bold text-white font-mono">{blockNumber}</span>
            <span className="text-[9px] text-emerald-400 block mt-0.5 animate-pulse">● Producing blocks every 15s</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/25">
            <Cpu className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Deployed Contract Address</span>
            <span className="text-xs text-indigo-300 font-mono font-semibold block mt-1">{contractAddress.slice(0, 16)}...{contractAddress.slice(-10)}</span>
            <span className="text-[9px] text-gray-500 block mt-0.5">Solidity Contract Manager v0.8.20</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-2xl border border-white/5 bg-[#0F172A]/70 p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/25">
            <Coins className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Total Event Transactions</span>
            <span className="text-xl font-bold text-white font-mono">{transactions.length} Tx</span>
            <span className="text-[9px] text-gray-500 block mt-0.5">Real-time memory ledger logs</span>
          </div>
        </div>

      </div>

      {/* Transaction Table list */}
      <div className="bg-[#0F172A]/85 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Table Header Filter Search */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#070B14]/60">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Transaction Ledger Logs</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="Filter by hash, address, method..."
              className="rounded-xl bg-[#070B14] border border-white/5 py-1.5 pl-9 pr-4 text-[10px] font-medium text-white focus:outline-none focus:border-emerald-500 transition-colors w-full sm:w-64"
            />
          </div>
        </div>

        {/* Responsive Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#070B14]/40 border-b border-white/5 text-gray-500 text-[10px] uppercase font-bold">
                <th className="p-4 font-semibold">Tx Hash</th>
                <th className="p-4 font-semibold">Method</th>
                <th className="p-4 font-semibold">Block</th>
                <th className="p-4 font-semibold">From</th>
                <th className="p-4 font-semibold">To</th>
                <th className="p-4 font-semibold">Value</th>
                <th className="p-4 font-semibold">Gas Limit</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-gray-500 italic">
                    No transactions recorded matching the filters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.hash} className="hover:bg-white/5 transition-colors">
                    {/* Tx Hash */}
                    <td className="p-4 font-mono text-emerald-400 font-semibold">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1 shrink-0"
                      >
                        {tx.hash.slice(0, 10)}...
                        <ArrowUpRight className="h-3 w-3 text-gray-600" />
                      </a>
                    </td>

                    {/* Method */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase font-mono ${tx.method === 'placeBid' ? 'bg-indigo-500/10 text-indigo-400' : tx.method === 'createAuction' ? 'bg-violet-500/10 text-violet-400' : tx.method === 'withdraw' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {tx.method}
                      </span>
                    </td>

                    {/* Block height */}
                    <td className="p-4 font-mono text-gray-400 font-semibold">{tx.blockNumber}</td>

                    {/* From Address */}
                    <td className="p-4 font-mono text-gray-400">{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</td>

                    {/* To Address */}
                    <td className="p-4 font-mono text-gray-400">{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</td>

                    {/* Value */}
                    <td className="p-4 font-mono font-bold text-white shrink-0">
                      {tx.value === '0.0' ? '-' : `${parseFloat(tx.value).toFixed(3)} ETH`}
                    </td>

                    {/* Gas used */}
                    <td className="p-4 font-mono text-gray-500">{tx.gasUsed} units</td>

                    {/* Status */}
                    <td className="p-4">
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
