import React from "react";
import {
  CalendarClock,
  CalendarCheck2,
  Clock,
  MessageSquareCheck,
  Sparkles,
} from "lucide-react";

interface UpcomingStatsProps {
  totalCount: number;
  todayCount: number;
  rescheduledCount: number;
  pendingFeedbackCount: number;
  avgAiScore: number;
  onFilterClick?: (filterType: string) => void;
}

export const UpcomingStats: React.FC<UpcomingStatsProps> = ({
  totalCount,
  todayCount,
  rescheduledCount,
  pendingFeedbackCount,
  avgAiScore,
  onFilterClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Total Upcoming */}
      <div
        onClick={() => onFilterClick?.("all")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Upcoming
          </span>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalCount}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Schedule
          </span>
        </div>
      </div>

      {/* 2. Today's Interviews (Highlighted gradient) */}
      <div
        onClick={() => onFilterClick?.("today")}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
            Today's Interviews
          </span>
          <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform backdrop-blur-xs">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white">
            {todayCount}
          </span>
          <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
            High Priority
          </span>
        </div>
      </div>

      {/* 3. Pending Feedback */}
      <div
        onClick={() => onFilterClick?.("pending_feedback")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Feedback
          </span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <MessageSquareCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingFeedbackCount}
          </span>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Needs Review
          </span>
        </div>
      </div>

      {/* 4. Rescheduled */}
      <div
        onClick={() => onFilterClick?.("rescheduled")}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rescheduled
          </span>
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {rescheduledCount}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Updated Slots
          </span>
        </div>
      </div>

      {/* 5. AI Match Score Avg */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            AI Match Score
          </span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {avgAiScore}%
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Avg Readiness
          </span>
        </div>
      </div>
    </div>
  );
};
