import React from "react";
import {
  Star,
  Building2,
  MapPin,
  Briefcase,
  Sparkles,
  Send,
  FileText,
  Trash2,
  CheckSquare,
  Square,
  Clock,
} from "lucide-react";
import type { PooledCandidate, ReadinessStatus, TalentPoolCategory } from "../types/talentpool.types";
import { cn } from "@/shared/lib/utils";

interface TalentPoolTableProps {
  candidates: PooledCandidate[];
  pools: TalentPoolCategory[];
  selectedCandidateIds: (string | number)[];
  onToggleSelectAll: () => void;
  onToggleSelectCandidate: (id: string) => void;
  onQuickView: (candidate: PooledCandidate) => void;
  onAssignToJob: (candidate: PooledCandidate) => void;
  onRemoveFromPool: (candidate: PooledCandidate) => void;
}

const READINESS_STYLES: Record<ReadinessStatus, { bg: string; text: string; dot: string }> = {
  "Ready to Move": {
    bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Exploring: {
    bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Passive: {
    bg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  "Not Available": {
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

export const TalentPoolTable: React.FC<TalentPoolTableProps> = ({
  candidates,
  pools,
  selectedCandidateIds,
  onToggleSelectAll,
  onToggleSelectCandidate,
  onQuickView,
  onAssignToJob,
  onRemoveFromPool,
}) => {
  const isAllSelected =
    candidates.length > 0 && candidates.every((c) => selectedCandidateIds.includes(c.id));

  if (candidates.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No candidates in table view
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust filter parameters or search terms to display candidate records.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Candidate Profile</th>
              <th className="py-3 px-4">Readiness & Notice</th>
              <th className="py-3 px-4 text-center">Match Score</th>
              <th className="py-3 px-4">Primary Skills</th>
              <th className="py-3 px-4">Talent Pools</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {candidates.map((candidate) => {
              const isSelected = selectedCandidateIds.includes(candidate.id);
              const readiness = READINESS_STYLES[candidate.readinessStatus] || READINESS_STYLES.Exploring;
              const attachedPools = pools.filter((p) => candidate.poolIds?.includes(p.id));

              return (
                <tr
                  key={candidate.id}
                  className={cn(
                    "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
                    isSelected && "bg-blue-50/30 dark:bg-blue-950/20"
                  )}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectCandidate(candidate.id)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Profile */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {candidate.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onQuickView(candidate)}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {candidate.fullName}
                          </span>
                          {candidate.rating >= 4 && (
                            <Star size={13} className="text-amber-400" fill="currentColor" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {candidate.currentRole} @ {candidate.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Readiness */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium",
                          readiness.bg,
                          readiness.text
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", readiness.dot)} />
                        {candidate.readinessStatus}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Notice: {candidate.noticePeriod}
                      </p>
                    </div>
                  </td>

                  {/* Match Score */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800">
                      <Sparkles size={11} className="text-blue-500" />
                      {candidate.matchScore}%
                    </span>
                  </td>

                  {/* Skills */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {candidate.skills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{candidate.skills.length - 3}</span>
                      )}
                    </div>
                  </td>

                  {/* Pools Attached */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {attachedPools.map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Last Activity */}
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      {candidate.lastContactedDate || candidate.lastActivity}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onQuickView(candidate)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Full Profile"
                      >
                        <FileText size={15} />
                      </button>
                      <button
                        onClick={() => onAssignToJob(candidate)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
                        title="Assign to active job opening"
                      >
                        <Send size={12} />
                        Assign
                      </button>
                      <button
                        onClick={() => onRemoveFromPool(candidate)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove from pool"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
