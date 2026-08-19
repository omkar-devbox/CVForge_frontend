import React from "react";
import { Users, Filter, Clock, ChevronRight, AlertCircle } from "lucide-react";
import type { FunnelStage } from "../types/reports.types";

interface RecruitmentFunnelChartProps {
  stages: FunnelStage[];
}

export const RecruitmentFunnelChart: React.FC<RecruitmentFunnelChartProps> = ({ stages }) => {
  const maxCount = stages[0]?.count || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter size={18} className="text-blue-600 dark:text-blue-400" />
            Recruitment Pipeline Conversion Funnel
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Applicant dropoff and conversion rate analysis across each hiring stage.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Top-of-Funnel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Final Hires</span>
          </div>
        </div>
      </div>

      {/* Funnel visual bars */}
      <div className="space-y-3.5">
        {stages.map((stage, idx) => {
          const widthPercentage = Math.max(12, Math.round((stage.count / maxCount) * 100));
          const isFinal = idx === stages.length - 1;
          const prevStage = idx > 0 ? stages[idx - 1] : null;
          const dropoffCount = prevStage ? prevStage.count - stage.count : 0;
          const dropoffRate = prevStage ? Math.round((dropoffCount / prevStage.count) * 100) : 0;

          return (
            <div
              key={stage.id}
              className="relative group p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-[170px]">
                    {stage.stageName}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {stage.count.toLocaleString()} candidates
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    Avg {stage.avgDaysInStage}d latency
                  </span>

                  {idx > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                      -{dropoffRate}% dropoff
                    </span>
                  )}

                  <span className="font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {stage.conversionRate}% conversion
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-3.5 rounded-full overflow-hidden flex items-center p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
