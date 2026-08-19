import React from "react";
import { Filter, ChevronRight, Layers } from "lucide-react";
import type { FunnelStageData } from "../types/dashboard.types";
import { Badge } from "@/shared/ui/Badge";
import { useNavigate } from "react-router-dom";

interface DashboardFunnelOverviewProps {
  funnelData: FunnelStageData[];
}

export const DashboardFunnelOverview: React.FC<DashboardFunnelOverviewProps> = ({
  funnelData,
}) => {
  const navigate = useNavigate();
  const maxCount = Math.max(...funnelData.map((d) => d.count), 1);

  const getStageRoute = (stage: string) => {
    if (stage.includes("Interview")) return "/interviews/upcoming";
    if (stage.includes("Offer") || stage.includes("Hired")) return "/candidates/all";
    return "/recruitment/applications";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Filter size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recruitment Conversion Funnel
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Applicant progression from initial sourcing to offer acceptance
            </p>
          </div>
        </div>

        <Badge variant="info" className="text-xs px-2.5 py-1">
          Active Pipeline
        </Badge>
      </div>

      <div className="space-y-4">
        {funnelData.map((item, index) => {
          const widthPct = Math.max((item.count / maxCount) * 100, 4);

          return (
            <div
              key={item.stage}
              onClick={() => navigate(getStageRoute(item.stage))}
              className="group relative cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold group-hover:bg-blue-100 dark:group-hover:bg-blue-950 group-hover:text-blue-600">
                    {index + 1}
                  </span>
                  <span>{item.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">
                    {item.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-3.5 overflow-hidden p-0.5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-500" />
          <span>Overall Conversion: <strong className="text-slate-800 dark:text-slate-200">2.4% Hired</strong></span>
        </div>
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
        >
          <span>View Funnel Analytics</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

