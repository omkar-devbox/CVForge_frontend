import React from "react";
import { Users, Sparkles, Award, Zap, ChevronUp } from "lucide-react";

interface TalentPoolStatsProps {
  totalCandidates: number;
  totalPools: number;
  topMatchCount: number;
  readyToMoveCount: number;
  onSelectStatFilter?: (filterType: string) => void;
}

export const TalentPoolStats: React.FC<TalentPoolStatsProps> = ({
  totalCandidates,
  totalPools,
  topMatchCount,
  readyToMoveCount,
  onSelectStatFilter,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Pooled Candidates */}
      <div 
        onClick={() => onSelectStatFilter?.("all")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Pooled Talent
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalCandidates}
          </span>
          <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 gap-0.5">
            <ChevronUp size={14} />
            +14% this mo
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Across all active talent pools
        </p>
      </div>

      {/* Active Talent Pools */}
      <div 
        onClick={() => onSelectStatFilter?.("pools")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Talent Pools
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalPools}
          </span>
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
            Curated Pools
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Categorized by role & expertise
        </p>
      </div>

      {/* Top AI Skill Matches */}
      <div 
        onClick={() => onSelectStatFilter?.("topMatch")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Top Matches (&ge;90%)
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {topMatchCount}
          </span>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
            Pre-Vetted
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Ready for immediate requisition match
        </p>
      </div>

      {/* Ready to Move Joiners */}
      <div 
        onClick={() => onSelectStatFilter?.("ready")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ready to Move
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {readyToMoveCount}
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
            Immediate Availability
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Notice period &lt; 15 days or served
        </p>
      </div>
    </div>
  );
};
