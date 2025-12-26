'use client';

import React, { useState, useMemo } from 'react';
import { PNode, NodeStatus, SortConfig } from '../types';
import { ArrowUpDown, ShieldCheck, AlertCircle, WifiOff, Search, Globe, Sparkles } from 'lucide-react';

interface NodeTableProps {
  nodes: PNode[];
  onAnalyzeNode?: (node: PNode) => void;
}

export const NodeTable: React.FC<NodeTableProps> = ({ nodes, onAnalyzeNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'latency', direction: 'asc' });

  const handleSort = (key: keyof PNode) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedNodes = useMemo(() => {
    let result = [...nodes];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(n => 
        n.identityPubkey.toLowerCase().includes(lowerTerm) ||
        (n.version && n.version.toLowerCase().includes(lowerTerm)) ||
        (n.location && n.location.toLowerCase().includes(lowerTerm))
      );
    }

    result.sort((a, b) => {
      // Handle nulls safely
      const valA = a[sortConfig.key] ?? '';
      const valB = b[sortConfig.key] ?? '';

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [nodes, searchTerm, sortConfig]);

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.ACTIVE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck size={12} className="mr-1"/> Active</span>;
      case NodeStatus.DELINQUENT:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><AlertCircle size={12} className="mr-1"/> Delinquent</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><WifiOff size={12} className="mr-1"/> Offline</span>;
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/20">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">pNode Registry</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time gossip protocol monitoring</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by pubkey, version, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest sticky top-0 z-10 backdrop-blur-md border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => handleSort('identityPubkey')}>
                <div className="flex items-center">Node Identity <ArrowUpDown size={12} className="ml-2 opacity-30"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors hidden lg:table-cell" onClick={() => handleSort('version')}>
                 <div className="flex items-center">Version <ArrowUpDown size={12} className="ml-2 opacity-30"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => handleSort('status')}>
                 <div className="flex items-center">Status <ArrowUpDown size={12} className="ml-2 opacity-30"/></div>
              </th>
               <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors hidden sm:table-cell" onClick={() => handleSort('uptime')}>
                 <div className="flex items-center">Uptime <ArrowUpDown size={12} className="ml-2 opacity-30"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors text-right" onClick={() => handleSort('latency')}>
                 <div className="flex items-center justify-end">Latency <ArrowUpDown size={12} className="ml-2 opacity-30"/></div>
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredAndSortedNodes.map((node, idx) => (
              <tr key={node.identityPubkey + idx} className="hover:bg-indigo-500/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-indigo-400 mr-4 text-xs font-bold border border-slate-700 group-hover:border-indigo-500/30 transition-colors shadow-sm">
                      {node.identityPubkey.substring(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 font-mono truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[240px]" title={node.identityPubkey}>
                        {node.identityPubkey}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center">
                        <Globe size={10} className="mr-1 opacity-50" />
                        {node.location || 'Unknown Region'} • {node.gossipAddr.split(':')[0]}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700/50">{node.version || 'v1.0.0'}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(node.status)}
                </td>
                 <td className="px-6 py-4 hidden sm:table-cell">
                  <div className="flex items-center">
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden mr-3 border border-slate-700/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          node.uptime && node.uptime > 95 ? 'bg-emerald-500' : 
                          node.uptime && node.uptime > 80 ? 'bg-yellow-500' : 'bg-rose-500'
                        }`} 
                        style={{ width: `${node.uptime || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{node.uptime?.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-black font-mono ${
                      node.latency < 60 ? 'text-emerald-400' : 
                      node.latency < 150 ? 'text-yellow-400' : 'text-rose-400'
                    }`}>
                      {node.latency}ms
                    </span>
                    <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                       <div className="h-full bg-indigo-500/30" style={{ width: `${Math.min(100, (node.latency / 300) * 100)}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onAnalyzeNode?.(node)}
                    className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="AI Analysis"
                  >
                    <Sparkles size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredAndSortedNodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                      <Search size={24} className="text-slate-500 opacity-50"/>
                    </div>
                    <h4 className="text-white font-bold">No nodes found</h4>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
