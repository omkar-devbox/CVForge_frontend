import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  ArrowRight,
} from "lucide-react";
import type { AiInsightItem } from "../types/reports.types";

interface AiReportsInsightsProps {
  insights: AiInsightItem[];
}

const TYPE_CONFIG = {
  positive: {
    icon: CheckCircle2,
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    border: "border-emerald-200 dark:border-emerald-900/60",
    gradient: "from-emerald-50/50 dark:from-emerald-950/20 to-transparent",
  },
  warning: {
    icon: AlertTriangle,
    badgeBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    border: "border-amber-200 dark:border-amber-900/60",
    gradient: "from-amber-50/50 dark:from-amber-950/20 to-transparent",
  },
  opportunity: {
    icon: Lightbulb,
    badgeBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    border: "border-blue-200 dark:border-blue-900/60",
    gradient: "from-blue-50/50 dark:from-blue-950/20 to-transparent",
  },
  info: {
    icon: Info,
    badgeBg: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    border: "border-purple-200 dark:border-purple-900/60",
    gradient: "from-purple-50/50 dark:from-purple-950/20 to-transparent",
  },
};

export const AiReportsInsights: React.FC<AiReportsInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-900 text-white rounded-xl p-5 mb-6 shadow-md relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              CVForge AI Hiring Intelligence
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full">
                Real-time Analysis
              </span>
            </h3>
            <p className="text-xs text-blue-200/80">
              Automated algorithmic insights and hiring efficiency recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {insights.map((insight) => {
          const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={`bg-slate-800/80 backdrop-blur-md border ${config.border} rounded-lg p-4 flex flex-col justify-between transition-all hover:bg-slate-800/95`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${config.badgeBg}`}
                  >
                    <Icon size={12} />
                    <span className="capitalize">{insight.type}</span>
                  </span>

                  {insight.metricImpact && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                      {insight.metricImpact}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white mb-1.5 leading-snug">
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                  {insight.summary}
                </p>
              </div>

              {insight.actionableSuggestion && (
                <div className="pt-2 border-t border-slate-700/60 flex items-start gap-1.5 text-xs text-blue-200">
                  <ArrowRight size={14} className="shrink-0 text-blue-400 mt-0.5" />
                  <span className="italic">{insight.actionableSuggestion}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
