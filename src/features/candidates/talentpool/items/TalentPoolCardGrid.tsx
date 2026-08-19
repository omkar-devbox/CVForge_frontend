import React from "react";
import {
  Star,
  Building2,
  MapPin,
  Briefcase,
  Sparkles,
  UserCheck,
  Send,
  MoreHorizontal,
  FileText,
  Trash2,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { PooledCandidate, ReadinessStatus, TalentPoolCategory } from "../types/talentpool.types";
import { cn } from "@/shared/lib/utils";

interface TalentPoolCardGridProps {
  candidates: PooledCandidate[];
  pools: TalentPoolCategory[];
  selectedCandidateIds: (string | number)[];
  onToggleSelectCandidate: (id: string) => void;
  onQuickView: (candidate: PooledCandidate) => void;
  onAssignToJob: (candidate: PooledCandidate) => void;
  onRemoveFromPool: (candidate: PooledCandidate) => void;
  onToggleStarRating?: (candidateId: string, rating: number) => void;
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

export const TalentPoolCardGrid: React.FC<TalentPoolCardGridProps> = ({
  candidates,
  pools,
  selectedCandidateIds,
  onToggleSelectCandidate,
  onQuickView,
  onAssignToJob,
  onRemoveFromPool,
  onToggleStarRating,
}) => {
  if (candidates.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <UserCheck size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No candidates found in this pool
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          Try adjusting your search criteria, switching pool categories, or adding new candidates to your talent database.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {candidates.map((candidate) => {
        const isSelected = selectedCandidateIds.includes(candidate.id);
        const readiness = READINESS_STYLES[candidate.readinessStatus] || READINESS_STYLES.Exploring;
        
        // Find attached pool names
        const attachedPools = pools.filter((p) => candidate.poolIds?.includes(p.id));

        return (
          <div
            key={candidate.id}
            className={cn(
              "bg-white dark:bg-slate-900 border rounded-xl p-4.5 transition-all duration-200 flex flex-col justify-between group hover:shadow-md relative",
              isSelected
                ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            {/* Header: Checkbox, Avatar, Name & Readiness */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectCandidate(candidate.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                      {candidate.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    {candidate.rating >= 4 && (
                      <span className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 shadow-xs">
                        <Star size={10} fill="currentColor" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3
                      onClick={() => onQuickView(candidate)}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors line-clamp-1"
                    >
                      {candidate.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                      <Building2 size={12} className="shrink-0 text-slate-400" />
                      {candidate.currentRole} &bull; {candidate.company}
                    </p>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="shrink-0 flex flex-col items-end">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-800">
                    <Sparkles size={12} className="text-blue-500" />
                    {candidate.matchScore}% Match
                  </span>
                </div>
              </div>

              {/* Readiness & Notice Period */}
              <div className="mt-3.5 flex items-center gap-2 flex-wrap text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-semibold",
                    readiness.bg,
                    readiness.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", readiness.dot)} />
                  {candidate.readinessStatus}
                </span>

                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                  <Clock size={12} className="text-slate-400" />
                  Notice: {candidate.noticePeriod}
                </span>

                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                  <Briefcase size={12} className="text-slate-400" />
                  {candidate.experienceYears} Yrs Exp
                </span>
              </div>

              {/* AI Summary Quote */}
              {candidate.aiSummary && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">AI Profile Insight: </span>
                  {candidate.aiSummary}
                </div>
              )}

              {/* Key Skill Badges */}
              <div className="mt-3 flex flex-wrap gap-1">
                {candidate.skills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 4 && (
                  <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                    +{candidate.skills.length - 4} more
                  </span>
                )}
              </div>

              {/* Pool Badges */}
              {attachedPools.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Pools:
                  </span>
                  {attachedPools.map((p) => (
                    <span
                      key={p.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onQuickView(candidate)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FileText size={14} />
                View Profile
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAssignToJob(candidate)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
                >
                  <Send size={13} />
                  Assign to Job
                </button>
                <button
                  onClick={() => onRemoveFromPool(candidate)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove candidate from pool"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
