import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  Star,
  FileText,
  UserCheck,
  Award,
  Sparkles,
  Quote,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { CompletedInterview, RecommendationType } from "../types/completed.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

interface FeedbackScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: CompletedInterview | null;
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

export const FeedbackScorecardModal: React.FC<FeedbackScorecardModalProps> = ({
  isOpen,
  onClose,
  interview,
}) => {
  if (!interview) return null;

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title={`Interview Scorecard - ${interview.candidateName}`}
        onClose={onClose}
      />
      <ModalBody className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Candidate & Recommendation Top Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {interview.candidateName}
              </h3>
              <Badge variant="default" size="sm" rounded>
                {interview.round}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {interview.jobTitle} • Completed on {interview.completedDate}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Recommendation
              </span>
              <Badge variant={getRecommendationBadgeVariant(interview.recommendation)} size="md" rounded dot>
                {interview.recommendation}
              </Badge>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-center">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3.5 h-3.5 ${
                      idx < interview.overallRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                {interview.overallRating} / 5 Rating
              </div>
            </div>
          </div>
        </div>

        {/* AI Synthesis Summary if available */}
        {interview.aiSummary && (
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">AI Synthesis Summary</span>
              <span>{interview.aiSummary}</span>
            </div>
          </div>
        )}

        {/* Interviewer Scorecards List */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Interviewer Feedback Breakdown ({interview.scorecards.length} Panel Evaluation{interview.scorecards.length > 1 ? "s" : ""})
          </h4>

          {interview.scorecards.map((sc) => (
            <div
              key={sc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3"
            >
              {/* Panelist Info Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {sc.interviewerName}
                    </div>
                    <div className="text-[11px] text-slate-500">{sc.interviewerRole}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getRecommendationBadgeVariant(sc.recommendation)} size="sm" rounded>
                    {sc.recommendation}
                  </Badge>
                  <span className="text-[11px] font-medium text-slate-400">
                    {sc.submittedAt}
                  </span>
                </div>
              </div>

              {/* Competency Ratings Grid */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Technical Depth</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sc.technicalScore} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Communication</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sc.communicationScore} / 5</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-semibold">Problem Solving</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sc.problemSolvingScore} / 5</span>
                </div>
              </div>

              {/* Detailed Comments */}
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <Quote className="w-3.5 h-3.5 text-slate-400 mb-1" />
                <p>{sc.comments}</p>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Scorecard
        </Button>
      </ModalFooter>
    </Modal>
  );
};
