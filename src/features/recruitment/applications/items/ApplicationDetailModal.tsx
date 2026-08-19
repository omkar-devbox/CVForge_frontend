import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/Badge";
import {
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Download,
  Edit3,
  Star,
  CheckCircle2,
  FileText,
  Building2,
  Plus,
  Send,
  Award,
} from "lucide-react";
import type {
  CandidateApplication,
  ApplicationStage,
  ApplicationStatus,
} from "../types/application.types";
import { toast } from "@/shared/ui/toast";

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CandidateApplication | null;
  onEditApplication: (app: CandidateApplication) => void;
  onStageChange?: (appId: string, stage: ApplicationStage) => void;
  onStatusChange?: (appId: string, status: ApplicationStatus) => void;
  onDownloadResume?: (app: CandidateApplication) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onEditApplication,
  onStageChange,
  onStatusChange,
  onDownloadResume,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "resume" | "pipeline" | "notes">("overview");
  const [newNote, setNewNote] = useState("");
  const [newRating, setNewRating] = useState(5);

  if (!application) return null;

  const initials = application.candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const noteObj = {
      id: `note-${Date.now()}`,
      author: "Hiring Manager",
      date: new Date().toISOString().split("T")[0],
      content: newNote.trim(),
      rating: newRating,
    };

    application.notes.unshift(noteObj);
    setNewNote("");
    toast.success("Interviewer feedback note added!");
  };

  const STAGES_LIST: ApplicationStage[] = [
    "Sourced",
    "Screened",
    "Interviewing",
    "Offered",
    "Hired",
  ];

  const currentStageIndex = STAGES_LIST.indexOf(application.stage);

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={application.candidateName}
        description={`Application for ${application.jobTitle} (${application.department})`}
        onClose={onClose}
      />

      <ModalBody className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
        {/* Candidate Banner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
                  {application.candidateName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                  <Sparkles className="w-3 h-3" />
                  {application.matchScore}% Match
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {application.currentRole} at {application.currentCompany}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" size="sm" rounded>
              Stage: {application.stage}
            </Badge>
            <Badge variant="success" size="sm" rounded>
              Status: {application.status}
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "resume", label: "Resume & Skills" },
            { id: "pipeline", label: "Hiring Stage Timeline" },
            { id: "notes", label: `Notes (${application.notes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{application.candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{application.candidatePhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium">{application.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Experience & Expectations
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Total Experience:</span>
                    <span className="font-semibold">{application.experienceYears} Years</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Expected Salary:</span>
                    <span className="font-semibold">{application.expectedSalary}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Notice Period:</span>
                    <span className="font-semibold">{application.noticePeriod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            {application.summary && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Executive Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {application.summary}
                </p>
              </div>
            )}

            {/* Candidate Tags */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Candidate Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {application.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESUME & SKILLS */}
        {activeTab === "resume" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {application.resumeFileName || "Candidate_Resume.pdf"}
                  </span>
                </div>
                {onDownloadResume && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadResume(application)}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download Resume
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Technical & Core Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HIRING STAGE TIMELINE */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hiring Pipeline Progress
              </h4>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 z-0" />
                {STAGES_LIST.map((stageName, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stageName} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {stageName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EVALUATION NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-5">
            <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Add Interviewer Feedback Note
              </h4>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write feedback, key interview observations, technical evaluation..."
                rows={3}
                className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 mr-1">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`p-0.5 ${star <= newRating ? "text-amber-500" : "text-slate-300 dark:text-slate-700"}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Post Note
                </Button>
              </div>
            </form>

            <div className="space-y-3">
              {application.notes.length > 0 ? (
                application.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {note.author}
                      </span>
                      <span className="text-slate-400">{note.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  No interview feedback notes recorded yet.
                </p>
              )}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => {
            onClose();
            onEditApplication(application);
          }}
          leftIcon={<Edit3 className="w-4 h-4" />}
        >
          Edit Application
        </Button>
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
