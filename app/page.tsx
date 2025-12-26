'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Map as MapIcon, 
  Settings, 
  Activity, 
  Database, 
  Globe, 
  RefreshCw,
  Sparkles,
  Bot,
  Menu,
  X,
  AlertCircle
} from 'lucide-react';
import { PNode, NetworkStats, GeminiReport } from '../types';
import { fetchPNodes } from '../services/pNodeService';
import { generateNetworkReport } from '../services/aiService';
import { StatCard } from '../components/StatCard';
import { NodeTable } from '../components/NodeTable';
import { StatusPieChart, LatencyChart } from '../components/DashboardCharts';
import { NAV_ITEMS } from '../constants';
import { AICommandModal } from '../components/ai/AICommandModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [aiCommandPrompt, setAiCommandPrompt] = useState('');
  
  // Gemini State
  const [aiReport, setAiReport] = useState<GeminiReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPNodes();
    setNodes(data);
    setLastRefreshed(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Refresh every 30s
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    setAiLoading(true);
    setAiError(null);
    setIsAiModalOpen(true);
    
    try {
      const report = await generateNetworkReport(nodes);
      setAiReport(report);
    } catch (err: any) {
      setAiError(err.message || "Failed to generate AI report. The service might be unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const calculateStats = (): NetworkStats => {
    const active = nodes.filter(n => n.status === 'Active').length;
    const storage = nodes.reduce((acc, n) => acc + (n.diskSpace || 0), 0);
    const lat = nodes.reduce((acc, n) => acc + n.latency, 0) / (nodes.length || 1);
    
    return {
      totalNodes: nodes.length,
      activeNodes: active,
      totalStorage: storage,
      avgLatency: lat
    };
  };

  const stats = calculateStats();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Activity className="text-white" size={20} />
            </div>
            <span className="ml-3 font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Xandalyze
            </span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {NAV_ITEMS.map((item) => {
             const Icon = item.icon === 'Server' ? Server : item.icon === 'Map' ? MapIcon : item.icon === 'Sparkles' ? Sparkles : LayoutDashboard;
             const active = activeTab === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => {
                   if (item.id === 'ai') {
                     handleGenerateReport();
                   } else {
                     setActiveTab(item.id);
                   }
                   setIsMobileMenuOpen(false);
                 }}
                 className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                   active 
                     ? 'bg-indigo-600/10 text-indigo-400 shadow-sm border border-indigo-500/20' 
                     : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                 }`}
               >
                 <Icon size={20} className={active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
                 <span className="ml-3 font-medium">{item.name}</span>
                 {item.id === 'ai' && <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-indigo-500 text-white rounded font-bold">BETA</span>}
               </button>
             );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-800/50">
            <Settings size={20} />
            <span className="ml-3 text-sm font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 mr-2 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-white capitalize">{activeTab === 'map' ? 'Network Map' : 'Dashboard Overview'}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 font-mono hidden sm:block">
              Last update: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : '...'}
            </span>
            <button 
              onClick={() => setIsCommandModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 transition-all text-sm font-bold"
            >
              <Bot size={18} />
              <span className="hidden md:inline">AI Command</span>
            </button>
            <button 
              onClick={loadData}
              disabled={loading}
              className={`p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-2 border-slate-800 shadow-lg"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth custom-scrollbar">
          
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total pNodes" 
                  value={stats.totalNodes} 
                  subValue="+12" 
                  trend="up" 
                  icon={<Server size={20} />} 
                  color="blue"
                />
                <StatCard 
                  title="Active Nodes" 
                  value={stats.activeNodes} 
                  subValue={`${Math.round((stats.activeNodes / stats.totalNodes) * 100)}% uptime`} 
                  trend="up" 
                  icon={<Activity size={20} />} 
                  color="green"
                />
                <StatCard 
                  title="Storage Capacity" 
                  value={`${stats.totalStorage.toLocaleString()} TB`} 
                  subValue="+1.2 PB" 
                  trend="up" 
                  icon={<Database size={20} />} 
                  color="purple"
                />
                <StatCard 
                  title="Avg Latency" 
                  value={`${Math.round(stats.avgLatency)} ms`} 
                  subValue="-5 ms" 
                  trend="down" 
                  icon={<Globe size={20} />} 
                  color="orange"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <LatencyChart nodes={nodes} />
                </div>
                <div>
                  <StatusPieChart nodes={nodes} />
                </div>
              </div>

              {/* Node Table */}
              <div className="h-[600px] mb-8">
                <NodeTable 
                  nodes={nodes} 
                  onAnalyzeNode={(node) => {
                    setAiCommandPrompt(`Analyze this specific pNode: ${node.identityPubkey}. It has a latency of ${node.latency}ms and status ${node.status}. What can you tell me about its health?`);
                    setIsCommandModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'nodes' && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-white">Node Explorer</h3>
                <p className="text-slate-500">Detailed view of all discovered pNodes in the Xandeum network.</p>
              </div>
              <div className="h-[calc(100vh-250px)]">
                <NodeTable 
                  nodes={nodes} 
                  onAnalyzeNode={(node) => {
                    setAiCommandPrompt(`Analyze this specific pNode: ${node.identityPubkey}. It has a latency of ${node.latency}ms and status ${node.status}. What can you tell me about its health?`);
                    setIsCommandModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed p-12 text-center">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                <MapIcon size={48} className="text-indigo-400" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Global Network Topology</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                We are currently mapping the physical locations of pNodes using gossip metadata. This feature will be available in the next update.
              </p>
              <div className="flex gap-4">
                <div className="px-6 py-2 bg-slate-800 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-700">
                  Coming Soon
                </div>
                <div className="px-6 py-2 bg-indigo-500/10 rounded-full text-xs font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                  v1.2.0
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Gemini AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl shadow-indigo-500/20 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Xandalyze AI Architect</h3>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gemini 2.5 Flash • Neural Analysis</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)} 
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">Synthesizing Network Data</p>
                    <p className="text-slate-500 text-sm mt-1">Analyzing pNode gossip protocols and latency vectors...</p>
                  </div>
                </div>
              ) : aiError ? (
                <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-center">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-rose-500" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Analysis Interrupted</h4>
                  <p className="text-slate-400 max-w-md mx-auto">{aiError}</p>
                  <button 
                    onClick={() => setIsAiModalOpen(false)} 
                    className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : aiReport ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Health Score */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-3xl border border-slate-700/50 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Network Health Index</span>
                      <span className={`text-2xl font-black ${
                        aiReport.healthScore > 80 ? 'text-emerald-400' : 
                        aiReport.healthScore > 60 ? 'text-yellow-400' : 'text-rose-400'
                      }`}>
                        {aiReport.healthScore}%
                      </span>
                    </div>
                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-1 border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          aiReport.healthScore > 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
                          aiReport.healthScore > 60 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 
                          'bg-gradient-to-r from-rose-600 to-rose-400'
                        }`} 
                        style={{ width: `${aiReport.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Sparkles size={18} />
                      <h4 className="font-black text-xs uppercase tracking-[0.2em]">Executive Summary</h4>
                    </div>
                    <div className="text-slate-300 leading-relaxed bg-indigo-500/[0.03] p-6 rounded-3xl border border-indigo-500/10 text-lg font-medium italic">
                      "{aiReport.summary}"
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Activity size={18} />
                      <h4 className="font-black text-xs uppercase tracking-[0.2em]">Optimization Vectors</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {aiReport.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-4 text-slate-300 bg-slate-800/30 p-4 rounded-2xl border border-slate-800/50 hover:border-emerald-500/30 transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {!aiLoading && !aiError && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-end">
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Dismiss Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AICommandModal 
        isOpen={isCommandModalOpen} 
        onClose={() => {
          setIsCommandModalOpen(false);
          setAiCommandPrompt('');
        }} 
        initialPrompt={aiCommandPrompt}
      />
    </div>
  );
}
