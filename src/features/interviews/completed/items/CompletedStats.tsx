import React from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Award,
  Clock,
  Star,
  UserCheck,
} from "lucide-react";

interface CompletedStatsProps {
  totalCompleted: number;
  strongHireCount: number;
  hiredCount: number;
  underReviewCount: number;
  avgRating: number;
  onFilterClick?: (filterType: string) => void;
}

export const CompletedStats: React.FC<CompletedStatsProps> = ({
  totalCompleted,
  strongHireCount,
  hiredCount,
  underReviewCount,
  avgRating,
  onFilterClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Total Completed */}
      <div
        onClick={() => onFilterClick?.("all")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Evaluated
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalCompleted}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Interview Logs
          </span>
        </div>
      </div>

      {/* 2. Strong Hire (Highlighted Gradient) */}
      <div
        onClick={() => onFilterClick?.("strong_hire")}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
            Strong Hires
          </span>
          <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform backdrop-blur-xs">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white">
            {strongHireCount}
          </span>
          <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
            Top Talent
          </span>
        </div>
      </div>

      {/* 3. Final Hired Outcome */}
      <div
        onClick={() => onFilterClick?.("hired")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Hired Candidates
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {hiredCount}
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Offers Accepted
          </span>
        </div>
      </div>

      {/* 4. Under Review / Hold */}
      <div
        onClick={() => onFilterClick?.("under_review")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Under Review
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {underReviewCount}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending Decision
          </span>
        </div>
      </div>

      {/* 5. Average Score */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Average Score
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {avgRating.toFixed(1)} / 5
          </span>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Panel Rating
          </span>
        </div>
      </div>
    </div>
  );
};
