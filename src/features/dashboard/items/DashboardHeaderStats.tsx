import React from "react";
import {
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
} from "lucide-react";
import type { KpiMetric } from "../types/dashboard.types";
import { Tooltip } from "@/shared/ui/tooltip/Tooltip";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderStatsProps {
  metrics: KpiMetric[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Sparkles,
};

const COLOR_THEMES: Record<
  string,
  { bg: string; text: string; ring: string; border: string; glow: string }
> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    ring: "bg-blue-500",
    border: "border-blue-200/60 dark:border-blue-800/40",
    glow: "group-hover:shadow-blue-500/10",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "bg-emerald-500",
    border: "border-emerald-200/60 dark:border-emerald-800/40",
    glow: "group-hover:shadow-emerald-500/10",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-600 dark:text-purple-400",
    ring: "bg-purple-500",
    border: "border-purple-200/60 dark:border-purple-800/40",
    glow: "group-hover:shadow-purple-500/10",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    ring: "bg-amber-500",
    border: "border-amber-200/60 dark:border-amber-800/40",
    glow: "group-hover:shadow-amber-500/10",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-600 dark:text-indigo-400",
    ring: "bg-indigo-500",
    border: "border-indigo-200/60 dark:border-indigo-800/40",
    glow: "group-hover:shadow-indigo-500/10",
  },
};

const DEFAULT_KPI_ROUTES: Record<string, string> = {
  "active-jobs": "/recruitment/jobs",
  "total-applications": "/recruitment/applications",
  "interviews-scheduled": "/interviews/upcoming",
  "time-to-hire": "/reports",
  "ai-match-rate": "/candidates/talent-pool",
};

export const DashboardHeaderStats: React.FC<DashboardHeaderStatsProps> = ({ metrics }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((m) => {
        const Icon = ICON_MAP[m.iconName] || Briefcase;
        const theme = COLOR_THEMES[m.colorTheme] || COLOR_THEMES.blue;
        const targetRoute = DEFAULT_KPI_ROUTES[m.id] || "/";

        return (
          <Tooltip key={m.id} content={`Click to view ${m.title} module details`}>
            <div
              onClick={() => navigate(targetRoute)}
              className={`group relative bg-white dark:bg-slate-900 border ${theme.border} hover:border-blue-400 dark:hover:border-blue-500/50 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 ${theme.glow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                  {m.title}
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 group-hover:opacity-100 text-blue-500 transition-all duration-150 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
                <div className={`p-2 rounded-lg ${theme.bg} ${theme.text}`}>
                  <Icon size={18} />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {m.value}
                </h3>
                <div
                  className={`flex items-center text-xs font-medium ${
                    m.trend === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : m.trend === "down"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {m.trend === "up" && <TrendingUp size={13} className="mr-0.5" />}
                  {m.trend === "down" && <TrendingDown size={13} className="mr-0.5" />}
                  {m.trend === "neutral" && <Minus size={13} className="mr-0.5" />}
                  <span>{m.change}</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] font-normal text-slate-500 dark:text-slate-400">
                {m.subtitle}
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

