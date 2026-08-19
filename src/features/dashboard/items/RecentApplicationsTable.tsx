import React from "react";
import { FileText, Eye, Sparkles, ChevronRight } from "lucide-react";
import type { RecentApplication } from "../types/dashboard.types";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip/Tooltip";

interface RecentApplicationsTableProps {
  applications: RecentApplication[];
  onViewCandidate?: (app: RecentApplication) => void;
  onNavigateToApplications?: () => void;
}

export const RecentApplicationsTable: React.FC<RecentApplicationsTableProps> = ({
  applications,
  onViewCandidate,
  onNavigateToApplications,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent Candidate Applications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest incoming candidate profiles & AI ATS match scores
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToApplications}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          View All Applications
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="pb-3 px-2">Candidate</th>
              <th className="pb-3 px-2">Applied Job Role</th>
              <th className="pb-3 px-2">AI Match Score</th>
              <th className="pb-3 px-2">Stage</th>
              <th className="pb-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => onViewCandidate?.(app)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                {/* Candidate Column */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {app.candidateName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {app.candidateName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {app.candidateEmail} • {app.experienceYears} yrs exp
                      </div>
                    </div>
                  </div>
                </td>

                {/* Job Role Column */}
                <td className="py-3 px-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {app.jobTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {app.department}
                  </div>
                </td>

                {/* AI Match Score Column */}
                <td className="py-3 px-2">
                  <Tooltip content={`AI match rating for ${app.jobTitle}: ${app.matchScore}%`}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`px-2 py-0.5 rounded-md font-bold text-xs flex items-center gap-1 ${
                          app.matchScore >= 90
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : app.matchScore >= 80
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        <Sparkles size={11} />
                        <span>{app.matchScore}%</span>
                      </div>
                    </div>
                  </Tooltip>
                </td>

                {/* Stage Column */}
                <td className="py-3 px-2">
                  <Badge
                    variant={
                      app.stage === "Offer" || app.stage === "Hired"
                        ? "success"
                        : app.stage === "Interview"
                        ? "warning"
                        : app.stage === "Screening"
                        ? "info"
                        : "default"
                    }
                    className="text-[11px] px-2 py-0.5"
                  >
                    {app.stage}
                  </Badge>
                </td>

                {/* Action Column */}
                <td className="py-3 px-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewCandidate?.(app);
                    }}
                    className="h-7 text-xs gap-1 px-2.5"
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

