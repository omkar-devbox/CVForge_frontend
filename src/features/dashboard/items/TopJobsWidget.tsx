import React from "react";
import { Briefcase, ChevronRight, Users, Calendar, ArrowUpRight } from "lucide-react";
import type { TopActiveJob } from "../types/dashboard.types";
import { Badge } from "@/shared/ui/Badge";
import { useNavigate } from "react-router-dom";

interface TopJobsWidgetProps {
  jobs: TopActiveJob[];
}

export const TopJobsWidget: React.FC<TopJobsWidgetProps> = ({ jobs }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              High Priority Job Openings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top active requisitions by candidate activity
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/recruitment/jobs")}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
        >
          Manage Jobs
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate("/recruitment/jobs")}
            className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {job.title}
                </h4>
                {job.status === "Urgent" && (
                  <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{job.department}</span>
                <span>•</span>
                <span>{job.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-right">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-end gap-1">
                  <Users size={12} className="text-blue-500" />
                  <span>{job.applicantsCount} Applicants</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {job.interviewsCount} interviews • {job.daysActive}d active
                </div>
              </div>
              <ArrowUpRight
                size={16}
                className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
