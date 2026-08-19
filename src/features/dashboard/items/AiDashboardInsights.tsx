import React from "react";
import { Sparkles, ArrowRight, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import type { AiInsightItem } from "../types/dashboard.types";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";

interface AiDashboardInsightsProps {
  insights: AiInsightItem[];
}

export const AiDashboardInsights: React.FC<AiDashboardInsightsProps> = ({ insights }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-md border border-indigo-800/40 relative overflow-hidden mb-6">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-wide text-white">
                  CVForge AI Intelligence Hub
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold">
                  Live Insights
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Automated talent matching, pipeline optimization & bottleneck alerts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {insights.map((item) => {
            const isAction = item.type === "action";
            const isWarning = item.type === "warning";

            return (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-400/40 rounded-lg p-3.5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isWarning
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : isAction
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {item.badgeText}
                    </span>
                    {isWarning ? (
                      <AlertTriangle size={14} className="text-rose-400" />
                    ) : isAction ? (
                      <Sparkles size={14} className="text-amber-400" />
                    ) : (
                      <TrendingUp size={14} className="text-emerald-400" />
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-300/90 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {item.actionText && item.targetPath && (
                  <button
                    onClick={() => navigate(item.targetPath!)}
                    className="self-start text-[11px] font-bold text-indigo-300 hover:text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-all mt-1"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
