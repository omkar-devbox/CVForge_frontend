import React from "react";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Briefcase,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { KpiMetric } from "../types/reports.types";

interface ReportsHeaderStatsProps {
  metrics: KpiMetric[];
}

const ICON_MAP = {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Briefcase,
  DollarSign,
};

export const ReportsHeaderStats: React.FC<ReportsHeaderStatsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {metrics.map((metric) => {
        const IconComponent = ICON_MAP[metric.iconName] || Users;
        return (
          <div
            key={metric.id}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                  {metric.title}
                </span>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <IconComponent size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                {metric.value}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  metric.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {metric.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{metric.change}</span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]" title={metric.trendPeriod}>
                {metric.trendPeriod}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
