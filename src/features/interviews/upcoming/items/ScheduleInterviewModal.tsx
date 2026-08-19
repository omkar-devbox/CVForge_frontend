import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { FormField, CustomSelect, CustomDatePicker } from "@/shared/ui/formField";
import { Button } from "@/shared/ui/button";
import { Calendar, Clock, Video, UserCheck, Sparkles } from "lucide-react";
import type { UpcomingInterview, InterviewRound, InterviewMode } from "../types/upcoming.types";
import { MOCK_INTERVIEWERS } from "../data/mockUpcomingInterviews";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (interviewData: Partial<UpcomingInterview>) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("Senior Full Stack Engineer");
  const [department, setDepartment] = useState("Engineering");
  const [round, setRound] = useState<InterviewRound>("Technical Round 1");
  const [mode, setMode] = useState<InterviewMode>("Google Meet");
  const [scheduledDate, setScheduledDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("11:00 AM");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/new-interview-room");
  const [location, setLocation] = useState("");
  const [selectedInterviewerIds, setSelectedInterviewerIds] = useState<string[]>([
    "int-1",
    "int-3",
  ]);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim()) {
      return;
    }

    const panel = MOCK_INTERVIEWERS.filter((i) =>
      selectedInterviewerIds.includes(i.id)
    );

    onSchedule({
      candidateName,
      candidateEmail,
      jobTitle,
      department,
      round,
      mode,
      scheduledDate,
      startTime,
      endTime: "12:00 PM",
      durationMinutes,
      meetingLink: mode !== "In-Person" ? meetingLink : undefined,
      location: mode === "In-Person" ? location : undefined,
      interviewers: panel,
      notes,
      status: "Scheduled",
      aiMatchScore: 92,
    });

    // Reset form
    setCandidateName("");
    setCandidateEmail("");
    setNotes("");
    onClose();
  };

  const handleToggleInterviewer = (id: string) => {
    setSelectedInterviewerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader title="Schedule Candidate Interview" onClose={onClose} />
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Candidate Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Candidate Full Name *
              </label>
              <FormField
                type="text"
                placeholder="e.g. Vikramaditya Sharma"
                value={candidateName}
                onChange={(e: any) => setCandidateName(e.target?.value ?? e)}
                required
                fieldSize="md"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Candidate Email *
              </label>
              <FormField
                type="text"
                placeholder="candidate@example.com"
                value={candidateEmail}
                onChange={(e: any) => setCandidateEmail(e.target?.value ?? e)}
                required
                fieldSize="md"
              />
            </div>
          </div>

          {/* Job Position & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Job Position
              </label>
              <FormField
                type="text"
                value={jobTitle}
                onChange={(e: any) => setJobTitle(e.target?.value ?? e)}
                fieldSize="md"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Department
              </label>
              <FormField
                type="text"
                value={department}
                onChange={(e: any) => setDepartment(e.target?.value ?? e)}
                fieldSize="md"
              />
            </div>
          </div>

          {/* Round & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Interview Round
              </label>
              <CustomSelect
                options={[
                  { label: "Screening", value: "Screening" },
                  { label: "Technical Round 1", value: "Technical Round 1" },
                  { label: "Technical Round 2", value: "Technical Round 2" },
                  { label: "System Design", value: "System Design" },
                  { label: "Culture Fit", value: "Culture Fit" },
                  { label: "Final HR", value: "Final HR" },
                ]}
                value={round}
                onChange={(val: any) => setRound(val as InterviewRound)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Interview Mode
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

          {/* Date, Start Time & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Scheduled Date
              </label>
              <CustomDatePicker
                value={scheduledDate}
                onChange={(val: any) => {
                  if (typeof val === "string") setScheduledDate(val || "2026-08-20");
                  else if (val instanceof Date) setScheduledDate(val.toISOString().split("T")[0]);
                  else if (val?.target?.value) setScheduledDate(val.target.value);
                }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Start Time
              </label>
              <FormField
                type="text"
                value={startTime}
                onChange={(e: any) => setStartTime(e.target?.value ?? e)}
                placeholder="10:00 AM"
                fieldSize="md"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Duration
              </label>
              <CustomSelect
                options={[
                  { label: "30 Minutes", value: "30" },
                  { label: "45 Minutes", value: "45" },
                  { label: "60 Minutes", value: "60" },
                  { label: "90 Minutes", value: "90" },
                ]}
                value={String(durationMinutes)}
                onChange={(val: any) => setDurationMinutes(Number(val))}
              />
            </div>
          </div>

          {/* Meeting Link or Location */}
          {mode !== "In-Person" ? (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block flex items-center justify-between">
                <span>Video Conference Link</span>
                <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setMeetingLink(`https://meet.google.com/${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`)}>
                  Auto Generate
                </span>
              </label>
              <FormField
                type="text"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e: any) => setMeetingLink(e.target?.value ?? e)}
                fieldSize="md"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                In-Person Venue / Room Address
              </label>
              <FormField
                type="text"
                placeholder="e.g. Bangalore HQ - Conference Room 3B"
                value={location}
                onChange={(e: any) => setLocation(e.target?.value ?? e)}
                fieldSize="md"
              />
            </div>
          )}

          {/* Select Interviewers Panel */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Interviewers Panel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-800/40">
              {MOCK_INTERVIEWERS.map((interviewer) => {
                const isChecked = selectedInterviewerIds.includes(interviewer.id);
                return (
                  <div
                    key={interviewer.id}
                    onClick={() => handleToggleInterviewer(interviewer.id)}
                    className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                      isChecked
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{interviewer.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {interviewer.role}
                      </div>
                    </div>
                    <UserCheck
                      className={`w-4 h-4 ${
                        isChecked
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              Agenda & Preparation Notes for Panel
            </label>
            <textarea
              rows={3}
              placeholder="Specify evaluation focus areas, coding topics, design scenario, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" type="button" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Schedule Interview
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
