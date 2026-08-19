import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  Star,
  Download,
  Share2,
  Edit3,
  FileText,
  Building2,
  ChevronRight,
  Plus,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Tag,
} from "lucide-react";
import type { Candidate, CandidateStatus, CandidateStage } from "../types/candidate.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

export interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onEditCandidate?: (candidate: Candidate) => void;
  onShareCandidate?: (candidate: Candidate) => void;
  onDownloadResume?: (candidate: Candidate) => void;
  onStatusChange?: (candidateId: string, status: CandidateStatus) => void;
  onStageChange?: (candidateId: string, stage: CandidateStage) => void;
  onAddNote?: (candidateId: string, text: string) => void;
}

const getStatusBadgeVariant = (status: CandidateStatus): BadgeVariant => {
  switch (status) {
    case "Active":
    case "In Pipeline":
      return "info";
    case "Interviewing":
      return "warning";
    case "Hired":
      return "success";
    case "Archived":
    case "Blacklisted":
      return "danger";
    default:
      return "info";
  }
};

const getStageBadgeVariant = (stage: CandidateStage): BadgeVariant => {
  switch (stage) {
    case "New":
    case "Screening":
      return "info";
    case "Interview":
    case "Offer":
      return "warning";
    case "Hired":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "info";
  }
};

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onEditCandidate,
  onShareCandidate,
  onDownloadResume,
  onStatusChange,
  onStageChange,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "resume" | "notes">("overview");
  const [newNoteText, setNewNoteText] = useState("");

  if (!candidate) return null;

  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !onAddNote) return;
    onAddNote(candidate.id, newNoteText.trim());
    setNewNoteText("");
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={candidate.fullName}
        description={`${candidate.currentRole} • ${candidate.company}`}
        onClose={onClose}
      />

      <ModalBody className="p-0 overflow-hidden">
        {/* ── Modal Header Banner ── */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center border-2 border-white/20 shadow-md shrink-0">
                {initials || <User className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    {candidate.fullName}
                  </h2>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-xs font-semibold ml-1 text-slate-200">
                      {candidate.rating}.0
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 font-medium mt-0.5">
                  {candidate.currentRole} <span className="text-slate-500 mx-1.5">•</span> {candidate.company}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    {candidate.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    {candidate.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {candidate.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Badge variant={getStageBadgeVariant(candidate.stage)} size="sm" rounded>
                  Stage: {candidate.stage}
                </Badge>
                <Badge variant={getStatusBadgeVariant(candidate.status)} size="sm" rounded dot>
                  Status: {candidate.status}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Added: {candidate.createdAt}
              </p>
            </div>
          </div>

          {/* Header Quick Action Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 relative z-10">
            {onEditCandidate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditCandidate(candidate)}
                leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs rounded-lg"
              >
                Edit Profile
              </Button>
            )}

            {onDownloadResume && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadResume(candidate)}
                leftIcon={<Download className="w-3.5 h-3.5 text-blue-400" />}
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs rounded-lg"
              >
                Download Resume
              </Button>
            )}

            {onShareCandidate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShareCandidate(candidate)}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-slate-300" />}
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs rounded-lg"
              >
                Share Link
              </Button>
            )}
          </div>
        </div>

        {/* ── Modal Tabs ── */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "history", label: "Application History" },
            { id: "resume", label: "Resume & Documents" },
            { id: "notes", label: `Notes & Activity (${candidate.notes.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-4 text-xs font-semibold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Modal Tab Content ── */}
        <div className="p-6 max-h-[60vh] overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Experience
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.experienceYears} Years
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Notice Period
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.noticePeriod}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Current CTC
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.currentSalary || "N/A"}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Expected CTC
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.expectedSalary || "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Technical Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs mb-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>Highest Degree</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {candidate.highestDegree}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs mb-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span>Sourced Via & Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="info" size="sm">
                      Source: {candidate.source}
                    </Badge>
                    {candidate.tags.map((tag) => (
                      <Badge key={tag} variant="info" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPLICATION HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Applications & Job Openings
              </h4>
              {candidate.applicationHistory.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4">
                  No job applications recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {candidate.applicationHistory.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {app.jobTitle}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {app.department} <span className="mx-1">•</span> Applied: {app.appliedDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStageBadgeVariant(app.stage)} size="sm">
                          {app.stage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RESUME & DOCUMENTS TAB */}
          {activeTab === "resume" && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {candidate.resumeFileName || `${candidate.fullName.replace(/\s+/g, "_")}_Resume.pdf`}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      PDF Document <span className="mx-1">•</span> 2.4 MB
                    </p>
                  </div>
                </div>

                {onDownloadResume && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownloadResume(candidate)}
                    leftIcon={<Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-xs font-semibold"
                  >
                    Download File
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* NOTES & ACTIVITY TAB */}
          {activeTab === "notes" && (
            <div className="space-y-5">
              {onAddNote && (
                <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add interview feedback or recruiter note..."
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newNoteText.trim()}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs"
                  >
                    Post Note
                  </Button>
                </form>
              )}

              <div className="space-y-3">
                {candidate.notes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">
                    No notes recorded yet.
                  </p>
                ) : (
                  candidate.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {note.author}
                        </span>
                        <span>{note.date}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
