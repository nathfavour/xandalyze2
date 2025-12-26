'use client';

import React, { useState, useMemo } from 'react';
import { Bot, X, Sparkles, Loader2, AlertCircle, TrendingUp, Shield, Zap, Info } from 'lucide-react';
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
  const [prompt, setPrompt] = useState(initialPrompt);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generate } = useAI();

  // Offline Insights Calculation
  const insights = useMemo(() => {
    if (!nodes.length) return [];
    
    const activeNodes = nodes.filter(n => n.status === 'Active');
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

  // Update prompt when initialPrompt changes or sidebar opens
  React.useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
      setResult(null);
      setError(null);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const systemPrompt = `
    You are an intelligent assistant for Xandalyze, a Xandeum pNode monitoring platform.
    Analyze the user's request and extract the intent.
    
    Current Date: ${new Date().toISOString()}
    
    Return ONLY a valid JSON object with this structure:
    {
      "intent": "analyze_network" | "optimize_nodes" | "explain_metric" | "unknown",
      "summary": "A short summary of what will be performed",
      "data": {
        "target": "string (e.g. latency, storage, specific node)",
        "action": "string",
        "parameters": {}
      }
    }
  `;

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await generate(`${systemPrompt}\n\nUser Request: ${prompt}`);
      
      // Clean Markdown formatting if AI includes it
      const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      setResult(parsed);
    } catch (err: any) {
      console.error('AI Analysis failed', err);
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside 
      style={{ width: `${width}px` }}
      className="h-full bg-[#0A0A0B] border-l border-white/5 flex flex-col shadow-2xl z-20 animate-in slide-in-from-right duration-300"
    >
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0B]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-xandeum-blue rounded-lg shadow-lg shadow-xandeum-blue/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">AI Command</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-white/10"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
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
                onClick={handleAnalyze}
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
                onClick={() => setPrompt(s)}
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

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase">
                  {result.intent}
                </span>
              </div>
              <p className="text-slate-300 font-medium text-sm">{result.summary}</p>
            </div>
            
            <div className="bg-slate-950 rounded-2xl p-4 overflow-hidden border border-slate-800">
              <pre className="text-[10px] text-indigo-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
