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
  User,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  Sparkles,
  Mail,
  Phone,
  Briefcase,
  Star,
  Award,
  Download,
} from "lucide-react";
import type { CompletedInterview, RecommendationType } from "../types/completed.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

interface CompletedDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: CompletedInterview | null;
  onViewScorecard: (interview: CompletedInterview) => void;
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

export const CompletedDetailModal: React.FC<CompletedDetailModalProps> = ({
  isOpen,
  onClose,
  interview,
  onViewScorecard,
}) => {
  if (!interview) return null;

  const initials = interview.candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader title={`Completed Evaluation - ${interview.id}`} onClose={onClose} />
      <ModalBody className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Candidate Profile Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-100 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-base flex items-center justify-center border-2 border-white shadow-sm">
              {initials || <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {interview.candidateName}
                </h3>
                <Badge variant="default" size="sm" rounded>
                  {interview.round}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {interview.candidateEmail}
                </span>
                {interview.candidatePhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {interview.candidatePhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 text-center shrink-0">
            <div className="text-xs font-semibold text-slate-400 uppercase">
              Recommendation
            </div>
            <Badge variant={getRecommendationBadgeVariant(interview.recommendation)} size="sm" rounded dot className="mt-1">
              {interview.recommendation}
            </Badge>
          </div>
        </div>

        {/* Evaluation Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Interview Details
            </span>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Completed on {interview.completedDate}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Duration: {interview.durationMinutes} minutes</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Final Hiring Outcome
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info" size="md" rounded>
                {interview.finalOutcome || "Under Review"}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Evaluated by {interview.scorecards.length} panel member(s)
            </div>
          </div>
        </div>

        {/* Position Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Target Requisition
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" /> {interview.jobTitle}
            </span>
            <span className="text-slate-500 font-medium">Dept: {interview.department}</span>
          </div>
        </div>

        {/* Panel Members */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Evaluation Panel Members
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {interview.interviewers.map((panelist) => (
              <div
                key={panelist.id}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {panelist.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{panelist.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <Button
            size="sm"
            onClick={() => {
              onClose();
              onViewScorecard(interview);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> View Scorecard
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
