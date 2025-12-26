'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PNode, NodeStatus } from '../types';

interface ChartProps {
  nodes: PNode[];
}

const COLORS = ['#10b981', '#fbbf24', '#f43f5e']; // Emerald, Amber, Rose

export const StatusPieChart: React.FC<ChartProps> = ({ nodes }) => {
  const data = [
    { name: 'Active', value: nodes.filter(n => n.status === NodeStatus.ACTIVE).length },
    { name: 'Delinquent', value: nodes.filter(n => n.status === NodeStatus.DELINQUENT).length },
    { name: 'Offline', value: nodes.filter(n => n.status === NodeStatus.OFFLINE).length },
  ];

  return (
    <div className="h-[350px] w-full bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
      <h3 className="text-slate-200 font-bold mb-6 text-xs uppercase tracking-[0.2em]">Node Status Distribution</h3>
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#f8fafc', fontSize: '12px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-black text-white">{nodes.length}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex flex-col items-center p-2 rounded-xl bg-slate-950/50 border border-slate-800/50">
            <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: COLORS[index] }}></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{entry.name}</span>
            <span className="text-xs font-black text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LatencyChart: React.FC<ChartProps> = ({ nodes }) => {
  // Simulate historical data based on current nodes
  const data = Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    latency: Math.floor(nodes.reduce((acc, n) => acc + (n.latency || 0), 0) / (nodes.length || 1) + Math.random() * 20 - 10)
  }));

  return (
    <div className="h-[350px] w-full bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-xl">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-slate-200 font-bold text-xs uppercase tracking-[0.2em]">Average Network Latency (24h)</h3>
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
           <span className="text-[10px] text-slate-500 font-bold uppercase">Live Feed</span>
         </div>
       </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#475569" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontWeight: 'bold' }}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `${val}ms`}
            tick={{ fontWeight: 'bold' }}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#818cf8', fontSize: '12px', fontWeight: 'bold' }}
          />
          <Area 
            type="monotone" 
            dataKey="latency" 
            stroke="#6366f1" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorLatency)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
