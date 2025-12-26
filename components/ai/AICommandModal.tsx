'use client';

import React, { useState } from 'react';
import { Bot, X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAI } from '../../hooks/useAI';

export const AICommandModal = ({ isOpen, onClose, initialPrompt = '' }: { isOpen: boolean, onClose: () => void, initialPrompt?: string }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generate } = useAI();

  // Update prompt when initialPrompt changes or modal opens
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Bot size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Command Center</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">What would you like to do?</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Analyze the latency of my nodes' or 'Explain what storage capacity means'"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !prompt.trim()}
                className="absolute bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle size={18} />
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
                <p className="text-slate-300 font-medium">{result.summary}</p>
              </div>
              
              <div className="bg-slate-950 rounded-2xl p-4 overflow-hidden">
                <pre className="text-[10px] text-indigo-300 font-mono">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
