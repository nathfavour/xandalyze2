import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, trend, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 icon-bg-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 icon-bg-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 icon-bg-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 icon-bg-orange-500/20",
  };

  const activeColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  const [bg, text, border, iconBg] = activeColor.split(' ');

  return (
    <div className={`p-6 rounded-2xl border ${bg} ${border} backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10 group relative overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg.replace('icon-bg-', '')} ${text} shadow-inner`}>
          {icon || <Activity size={22} />}
        </div>
      </div>
      
      {subValue && (
        <div className="mt-4 flex items-center text-xs font-medium relative z-10">
          <div className={`flex items-center px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 
            trend === 'down' ? 'bg-rose-500/20 text-rose-400' : 
            'bg-slate-500/20 text-slate-400'
          }`}>
            {trend === 'up' && <ArrowUpRight size={14} className="mr-1" />}
            {trend === 'down' && <ArrowDownRight size={14} className="mr-1" />}
            {subValue}
          </div>
          <span className="text-slate-500 ml-2">vs last epoch</span>
        </div>
      )}
    </div>
  );
};
