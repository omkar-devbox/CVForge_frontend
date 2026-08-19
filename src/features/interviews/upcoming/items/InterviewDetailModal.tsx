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
  Video,
  UserCheck,
  FileText,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Briefcase,
  Star,
  Edit3,
  MessageSquarePlus,
} from "lucide-react";
import type { UpcomingInterview } from "../types/upcoming.types";

interface InterviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: UpcomingInterview | null;
  onReschedule: (interview: UpcomingInterview) => void;
  onFeedback: (interview: UpcomingInterview) => void;
  onJoinMeeting: (meetingLink: string) => void;
}

export const InterviewDetailModal: React.FC<InterviewDetailModalProps> = ({
  isOpen,
  onClose,
  interview,
  onReschedule,
  onFeedback,
  onJoinMeeting,
}) => {
  if (!interview) return null;

  const initials = interview.candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader title={`Interview Overview - ${interview.id}`} onClose={onClose} />
      <ModalBody className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Candidate Profile Header Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center border-2 border-white shadow-sm">
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

          {interview.aiMatchScore && (
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 text-center shrink-0">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-center">
                <Sparkles className="w-3 h-3 text-emerald-500" /> AI Match
              </div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {interview.aiMatchScore}%
              </div>
            </div>
          )}
        </div>

        {/* Schedule & Mode Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Interview Slot
            </span>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{interview.scheduledDate}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>
                {interview.startTime} - {interview.endTime} ({interview.durationMinutes} minutes)
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Mode & Access Link
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm" rounded>
                {interview.mode}
              </Badge>
              <Badge variant="default" size="sm" rounded>
                {interview.status}
              </Badge>
            </div>
            {interview.meetingLink ? (
              <button
                type="button"
                onClick={() => onJoinMeeting(interview.meetingLink!)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                <Video className="w-4 h-4" /> Join Video Room <ExternalLink className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-xs text-slate-500 italic block mt-1">
                {interview.location || "In-person location details"}
              </span>
            )}
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
            Assigned Interview Panelists
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

        {/* Preparation Notes */}
        {interview.notes && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Agenda & Focus Notes
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {interview.notes}
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {interview.meetingLink && (
              <Button
                size="sm"
                onClick={() => onJoinMeeting(interview.meetingLink!)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
              >
                <Video className="w-3.5 h-3.5" /> Join Room
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onFeedback(interview);
              }}
              className="text-xs font-semibold text-amber-600 border-amber-200 gap-1"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" /> Submit Feedback
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onReschedule(interview);
              }}
              className="text-xs font-semibold gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-500" /> Reschedule
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};
