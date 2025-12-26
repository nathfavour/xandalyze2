'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Bot, X, Sparkles, Loader2, AlertCircle, TrendingUp, Shield, Zap, Plus, ChevronUp } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { PNode } from '../../types';

export const AICommandSidebar = ({ 
  isOpen, 
  onClose, 
  initialPrompt = '', 
  width,
  nodes = []
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  initialPrompt?: string, 
  width: number,
  nodes?: PNode[]
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; result?: any }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { generate } = useAI();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Handle scroll to show/hide scroll top button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 400);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load cached conversation on mount
  useEffect(() => {
    const cached = localStorage.getItem('xandalyze_ai_messages');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Failed to load AI cache', e);
      }
    }
  }, []);

  // Cache conversation whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('xandalyze_ai_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  const handleNewChat = () => {
    setPrompt('');
    setMessages([]);
    setError(null);
    localStorage.removeItem('xandalyze_ai_messages');
  };

  // Offline Insights Calculation
  const insights = useMemo(() => {
    if (!nodes.length) return [];
    
    const offlineNodes = nodes.filter(n => n.status !== 'Active');
    const avgLat = nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length;
    const totalStorage = nodes.reduce((acc, n) => acc + (n.diskSpace || 0), 0);
    
    const list = [];
    
    if (offlineNodes.length > 0) {
      list.push({
        title: 'Network Alert',
        desc: `${offlineNodes.length} nodes are currently offline or unreachable.`,
        icon: <AlertCircle className="text-rose-400" size={16} />,
        color: 'rose'
      });
    }
    
    if (avgLat < 100) {
      list.push({
        title: 'Performance',
        desc: `Average latency is optimal at ${Math.round(avgLat)}ms.`,
        icon: <Zap className="text-emerald-400" size={16} />,
        color: 'emerald'
      });
    } else {
      list.push({
        title: 'Latency Warning',
        desc: `High average latency detected: ${Math.round(avgLat)}ms.`,
        icon: <TrendingUp className="text-amber-400" size={16} />,
        color: 'amber'
      });
    }
    
    list.push({
      title: 'Capacity',
      desc: `Total network storage is ${totalStorage.toLocaleString()} TB.`,
      icon: <Shield className="text-indigo-400" size={16} />,
      color: 'indigo'
    });
    
    return list;
  }, [nodes]);

  const suggestions = [
    "Analyze network health",
    "Find highest latency nodes",
    "Summarize storage capacity",
    "Identify offline pNodes"
  ];

  // Helper to summarize nodes for AI context
  const nodeSummary = useMemo(() => {
    if (!nodes.length) return "No nodes currently connected.";
    
    const stats = {
      total: nodes.length,
      active: nodes.filter(n => n.status === 'Active').length,
      offline: nodes.filter(n => n.status !== 'Active').length,
      avgLatency: Math.round(nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length),
      totalStorage: nodes.reduce((acc, n) => acc + (n.diskSpace || 0), 0),
      topLatency: [...nodes].sort((a, b) => b.latency - a.latency).slice(0, 3).map(n => `${n.identityPubkey.slice(0,8)} (${n.latency}ms)`),
      versions: Array.from(new Set(nodes.map(n => n.version))).slice(0, 3)
    };

    return `
      Network Stats:
      - Total Nodes: ${stats.total} (${stats.active} Active, ${stats.offline} Offline)
      - Avg Latency: ${stats.avgLatency}ms
      - Total Storage: ${stats.totalStorage} TB
      - High Latency Nodes: ${stats.topLatency.join(', ')}
      - Node Versions: ${stats.versions.join(', ')}
    `.trim();
  }, [nodes]);

  // Update prompt when initialPrompt changes or sidebar opens
  React.useEffect(() => {
    if (isOpen && initialPrompt) {
      handleAnalyze(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const systemPrompt = `
    You are Xandalyze AI, an expert analyst for the Xandeum pNode network.
    Your goal is to provide intelligent, actionable insights based on real-time node data.
    
    CURRENT NETWORK CONTEXT:
    ${nodeSummary}
    
    INSTRUCTIONS:
    1. Analyze the user's request in the context of the provided network data.
    2. Be technical, professional, and concise.
    3. If the user asks for an analysis, provide a clear summary and specific recommendations.
    4. Use bullet points for lists in your message.
    5. ALWAYS return your response as a JSON object with the following structure:
    {
      "message": "Your human-readable response/analysis here. Use markdown-style bullet points if needed.",
      "intent": "analyze_network" | "optimize_nodes" | "explain_metric" | "general_chat",
      "suggestions": ["A specific follow-up question or action", "Another suggestion"],
      "data_points": { "Relevant Metric": "Value" }
    }
  `;

  const handleAnalyze = async (overridePrompt?: string) => {
    const targetPrompt = overridePrompt || prompt;
    if (!targetPrompt.trim()) return;
    
    const newUserMessage = { role: 'user' as const, content: targetPrompt };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setPrompt('');
    
    setIsLoading(true);
    setError(null);
    try {
      // Prepare history for the API (excluding the very last message which is the current prompt)
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await generate(`${systemPrompt}\n\nUser Request: ${targetPrompt}`, history);
      
      // Robust JSON extraction
      let jsonStr = response.text;
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      
      let parsed = JSON.parse(jsonStr);
      
      // If the AI didn't follow the structure perfectly, try to adapt
      if (typeof parsed === 'string') {
        parsed = { message: parsed };
      } else if (parsed && !parsed.message && parsed.summary) {
        parsed.message = parsed.summary;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: parsed.message, 
        result: parsed 
      }]);
    } catch (err: unknown) {
      console.error('AI Analysis failed', err);
      setError('I encountered an error while processing your request. Please try again with a more specific question about the network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside 
      style={{ width: typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : `${width}px` }}
      className="fixed inset-y-0 right-0 lg:relative h-full bg-[#0A0A0B] border-l border-white/5 flex flex-col shadow-2xl z-50 lg:z-20 animate-in slide-in-from-right duration-300"
    >
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0B]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-xandeum-blue rounded-lg shadow-lg shadow-xandeum-blue/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Xandalyze AI</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleNewChat}
            title="New Chat"
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all border border-white/10"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={onClose} 
            title="Close Sidebar"
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 rounded-lg transition-all border border-white/10"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
      >
        {/* Offline Insights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dynamic Insights</h4>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-3 sm:p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-[#050505] border border-white/5 group-hover:scale-110 transition-transform shrink-0`}>
                    {insight.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white mb-0.5 truncate">{insight.title}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{insight.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Command Center</h4>
          </div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about the network..."
              className="w-full bg-[#050505] border border-white/5 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-xandeum-blue/50 min-h-[120px] resize-none text-sm shadow-inner"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {prompt && (
                <button 
                  onClick={() => setPrompt('')}
                  className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading || !prompt.trim()}
                className="p-3 bg-xandeum-blue hover:bg-xandeum-blue/80 disabled:opacity-50 disabled:hover:bg-xandeum-blue text-white rounded-xl transition-all shadow-lg shadow-xandeum-blue/20 active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleAnalyze(s)}
                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 text-[10px] font-medium text-slate-400 hover:text-slate-200 rounded-full transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              ref={idx === messages.length - 1 ? lastMessageRef : null}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[85%] p-4 bg-xandeum-blue text-white rounded-2xl rounded-tr-none text-sm shadow-lg shadow-xandeum-blue/10">
                  {msg.content}
                </div>
              ) : (
                <div className="w-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-xandeum-blue animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Analysis Result
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {msg.result?.suggestions && msg.result.suggestions.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Actions</p>
                      <div className="flex flex-col gap-2">
                        {msg.result.suggestions.map((s: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => handleAnalyze(s)}
                            className="flex items-center gap-2 p-2.5 bg-xandeum-blue/5 hover:bg-xandeum-blue/10 border border-xandeum-blue/10 rounded-xl text-xs text-xandeum-blue text-left transition-all group"
                          >
                            <Sparkles size={12} className="shrink-0 group-hover:rotate-12 transition-transform" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.result?.data_points && Object.keys(msg.result.data_points).length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <div className="bg-[#050505] rounded-xl p-3 border border-white/5">
                        <pre className="text-[10px] text-slate-500 font-mono overflow-x-auto">
                          {JSON.stringify(msg.result.data_points, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
              <Loader2 className="animate-spin text-xandeum-blue" size={18} />
              <span className="text-xs text-slate-500 font-medium">AI is thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-24 right-6 p-3 bg-slate-800/80 backdrop-blur-md border border-white/10 text-white rounded-full shadow-2xl hover:bg-slate-700 transition-all animate-in fade-in zoom-in duration-200 z-30"
          title="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </aside>
  );
};
