import React from "react";
import { Clock, TrendingDown, Award } from "lucide-react";
import type { DepartmentTimeToHire } from "../types/reports.types";

interface TimeToHireChartProps {
  departments: DepartmentTimeToHire[];
}

export const TimeToHireChart: React.FC<TimeToHireChartProps> = ({ departments }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-blue-600 dark:text-blue-400" />
            Departmental Time-to-Hire Velocity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Average days to complete hiring vs target industry benchmarks per department.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const beatBenchmark = dept.avgDaysToHire <= dept.benchmarkDays;
          const diffDays = Math.abs(dept.benchmarkDays - dept.avgDaysToHire).toFixed(1);

          return (
            <div
              key={dept.id}
              className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {dept.department}
                  </h4>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      beatBenchmark
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    {beatBenchmark ? `${diffDays}d faster than benchmark` : `${diffDays}d over benchmark`}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {dept.avgDaysToHire} <span className="text-xs font-normal text-slate-500">days</span>
                  </span>
                  <span className="text-xs text-slate-400">/ Target {dept.benchmarkDays}d</span>
                </div>

                {/* Visual metric bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      beatBenchmark ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, (dept.avgDaysToHire / dept.benchmarkDays) * 80)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{dept.openPositionsCount} Open Requisitions</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {dept.hiredThisQuarter} Hired QTD
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
