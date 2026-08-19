import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { FormField, CustomSelect, CustomDatePicker } from "@/shared/ui/formField";
import { Button } from "@/shared/ui/button";
import { Calendar, Clock, Edit3 } from "lucide-react";
import type { UpcomingInterview, InterviewMode } from "../types/upcoming.types";

interface RescheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: UpcomingInterview | null;
  onConfirmReschedule: (
    interviewId: string,
    newDate: string,
    newTime: string,
    mode: InterviewMode,
    reason: string
  ) => void;
}

export const RescheduleInterviewModal: React.FC<RescheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
  onConfirmReschedule,
}) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [mode, setMode] = useState<InterviewMode>("Google Meet");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (interview) {
      setScheduledDate(interview.scheduledDate);
      setStartTime(interview.startTime);
      setMode(interview.mode);
      setReason("");
    }
  }, [interview]);

  if (!interview) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReschedule(interview.id, scheduledDate, startTime, mode, reason);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <ModalHeader title={`Reschedule Interview - ${interview.candidateName}`} onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>
              Updating schedule for <strong>{interview.candidateName}</strong> ({interview.round}). Candidate and interviewers will be automatically notified via email.
            </span>
          </div>

          {/* New Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              New Date
            </label>
            <CustomDatePicker
              value={scheduledDate}
              onChange={(val: any) => {
                if (typeof val === "string") setScheduledDate(val || interview.scheduledDate);
                else if (val instanceof Date) setScheduledDate(val.toISOString().split("T")[0]);
                else if (val?.target?.value) setScheduledDate(val.target.value);
              }}
            />
          </div>

          {/* New Start Time & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                New Start Time
              </label>
              <FormField
                type="text"
                value={startTime}
                onChange={(e: any) => setStartTime(e.target?.value ?? e)}
                placeholder="11:30 AM"
                fieldSize="md"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Mode
              </label>
              <CustomSelect
                options={[
                  { label: "Google Meet", value: "Google Meet" },
                  { label: "Zoom", value: "Zoom" },
                  { label: "Microsoft Teams", value: "Microsoft Teams" },
                  { label: "In-Person", value: "In-Person" },
                ]}
                value={mode}
                onChange={(val: any) => setMode(val as InterviewMode)}
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Reason for Rescheduling
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Interviewer availability conflict / Candidate requested alternate slot"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
            Confirm Reschedule
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
