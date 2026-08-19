import React from "react";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  Calendar,
  Star,
  FileText,
  UserCheck,
  Eye,
  Award,
  Sparkles,
  User,
  Quote,
} from "lucide-react";
import type { CompletedInterview, RecommendationType } from "../types/completed.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

interface CompletedCardsViewProps {
  interviews: CompletedInterview[];
  onViewScorecard: (interview: CompletedInterview) => void;
  onViewDetails: (interview: CompletedInterview) => void;
}

const getRecommendationBadgeVariant = (rec: RecommendationType): BadgeVariant => {
  switch (rec) {
    case "Strong Hire":
      return "success";
    case "Hire":
      return "info";
    case "Hold":
      return "warning";
    case "Reject":
      return "danger";
    default:
      return "default";
  }
};

export const CompletedCardsView: React.FC<CompletedCardsViewProps> = ({
  interviews,
  onViewScorecard,
  onViewDetails,
}) => {
  if (interviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
        <Award className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No completed interview logs found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust your filters or complete an ongoing candidate interview round.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {interviews.map((item) => {
        const initials = item.candidateName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("");

        const primaryScorecard = item.scorecards[0];

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Card Top: Candidate Info & Rating */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {initials || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors truncate"
                      onClick={() => onViewDetails(item)}
                    >
                      {item.candidateName}
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.jobTitle}
                    </div>
                  </div>
                </div>

                <Badge variant={getRecommendationBadgeVariant(item.recommendation)} size="sm" rounded dot>
                  {item.recommendation}
                </Badge>
              </div>

              {/* Round & Date */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Badge variant="default" size="sm" rounded className="font-semibold text-[11px]">
                  {item.round}
                </Badge>
                <div className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>{item.completedDate}</span>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Panel Score:
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < item.overallRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    ({item.overallRating}/5)
                  </span>
                </div>
              </div>

              {/* Feedback Quote snippet */}
              {primaryScorecard && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic relative">
                  <Quote className="w-3.5 h-3.5 text-slate-400 mb-1" />
                  <p className="line-clamp-2">{primaryScorecard.comments}</p>
                  <div className="text-[10px] font-bold text-slate-400 not-italic mt-1.5 text-right">
                    — {primaryScorecard.interviewerName}
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer: Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewScorecard(item)}
                className="gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                <FileText className="w-3.5 h-3.5" />
                View Scorecard
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(item)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
