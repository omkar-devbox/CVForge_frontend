import React from "react";
import {
  Code2,
  Sparkles,
  Award,
  Server,
  Briefcase,
  Zap,
  Plus,
  Star,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen,
} from "lucide-react";
import type { TalentPoolCategory } from "../types/talentpool.types";
import { cn } from "@/shared/lib/utils";

interface TalentPoolCategoryCardsProps {
  pools: TalentPoolCategory[];
  selectedPoolId: string;
  onSelectPool: (poolId: string) => void;
  onCreatePool: () => void;
  onEditPool: (pool: TalentPoolCategory) => void;
  onDeletePool: (poolId: string) => void;
  onToggleStarPool: (poolId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Sparkles,
  Award,
  Server,
  Briefcase,
  Zap,
};

const COLOR_CLASSES: Record<
  TalentPoolCategory["color"],
  {
    bg: string;
    border: string;
    iconBg: string;
    iconText: string;
    badge: string;
    activeRing: string;
  }
> = {
  blue: {
    bg: "hover:border-blue-300 dark:hover:border-blue-700",
    border: "border-blue-200 dark:border-blue-900/50",
    iconBg: "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400",
    iconText: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60",
    activeRing: "ring-2 ring-blue-500 border-blue-500 dark:border-blue-500",
  },
  purple: {
    bg: "hover:border-purple-300 dark:hover:border-purple-700",
    border: "border-purple-200 dark:border-purple-900/50",
    iconBg: "bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400",
    iconText: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60",
    activeRing: "ring-2 ring-purple-500 border-purple-500 dark:border-purple-500",
  },
  emerald: {
    bg: "hover:border-emerald-300 dark:hover:border-emerald-700",
    border: "border-emerald-200 dark:border-emerald-900/50",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400",
    iconText: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
    activeRing: "ring-2 ring-emerald-500 border-emerald-500 dark:border-emerald-500",
  },
  amber: {
    bg: "hover:border-amber-300 dark:hover:border-amber-700",
    border: "border-amber-200 dark:border-amber-900/50",
    iconBg: "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400",
    iconText: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
    activeRing: "ring-2 ring-amber-500 border-amber-500 dark:border-amber-500",
  },
  rose: {
    bg: "hover:border-rose-300 dark:hover:border-rose-700",
    border: "border-rose-200 dark:border-rose-900/50",
    iconBg: "bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400",
    iconText: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
    activeRing: "ring-2 ring-rose-500 border-rose-500 dark:border-rose-500",
  },
  cyan: {
    bg: "hover:border-cyan-300 dark:hover:border-cyan-700",
    border: "border-cyan-200 dark:border-cyan-900/50",
    iconBg: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400",
    iconText: "text-cyan-600 dark:text-cyan-400",
    badge: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60",
    activeRing: "ring-2 ring-cyan-500 border-cyan-500 dark:border-cyan-500",
  },
  indigo: {
    bg: "hover:border-indigo-300 dark:hover:border-indigo-700",
    border: "border-indigo-200 dark:border-indigo-900/50",
    iconBg: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400",
    iconText: "text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60",
    activeRing: "ring-2 ring-indigo-500 border-indigo-500 dark:border-indigo-500",
  },
};

export const TalentPoolCategoryCards: React.FC<TalentPoolCategoryCardsProps> = ({
  pools,
  selectedPoolId,
  onSelectPool,
  onCreatePool,
  onEditPool,
  onDeletePool,
  onToggleStarPool,
}) => {
  const totalCandidatesAcrossPools = pools.reduce((acc, p) => acc + p.candidateCount, 0);

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={20} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Talent Pool Collections
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            {pools.length} Categories
          </span>
        </div>
        <button
          onClick={onCreatePool}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-xs transition-colors"
        >
          <Plus size={15} />
          Create Talent Pool
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {/* All Pooled Talent Card */}
        <div
          onClick={() => onSelectPool("all")}
          className={cn(
            "bg-white dark:bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all duration-200 relative group flex flex-col justify-between",
            selectedPoolId === "all"
              ? "ring-2 ring-blue-600 border-blue-600 dark:border-blue-500 shadow-sm"
              : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600"
          )}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Users size={20} />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {totalCandidatesAcrossPools} Candidates
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              All Pooled Talent
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              View all candidates across every talent pool category in your database.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-300">Complete Directory</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
              View All &rarr;
            </span>
          </div>
        </div>

        {/* Dynamic Talent Pool Cards */}
        {pools.map((pool) => {
          const IconComponent = ICON_MAP[pool.iconName] || Code2;
          const style = COLOR_CLASSES[pool.color] || COLOR_CLASSES.blue;
          const isSelected = selectedPoolId === pool.id;

          return (
            <div
              key={pool.id}
              onClick={() => onSelectPool(pool.id)}
              className={cn(
                "bg-white dark:bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all duration-200 relative group flex flex-col justify-between",
                style.bg,
                isSelected ? style.activeRing : style.border
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-semibold", style.iconBg)}>
                    <IconComponent size={20} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStarPool(pool.id);
                      }}
                      className={cn(
                        "p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                        pool.isStarred ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      )}
                      title={pool.isStarred ? "Unstar Pool" : "Star Pool"}
                    >
                      <Star size={16} fill={pool.isStarred ? "currentColor" : "none"} />
                    </button>
                    <div className="relative group/menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoreVertical size={15} />
                      </button>
                      <div className="hidden group-hover/menu:block absolute right-0 top-6 z-20 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPool(pool);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                        >
                          <Edit2 size={13} /> Edit Pool
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePool(pool.id);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 size={13} /> Delete Pool
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {pool.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                    {pool.description}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {pool.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                        style.badge
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                  {pool.tags.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-medium px-1 py-0.5">
                      +{pool.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pool.candidateCount} Candidates
                  </span>
                  <span className="text-slate-400">Owner: {pool.owner.split(" ")[0]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
