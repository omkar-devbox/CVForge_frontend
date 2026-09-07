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
import { parseEducation, parseAllEducations } from "../../services/candidatesApi";
import { formatDateTime } from "@/shared/lib/utils";

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
    <Modal open={isOpen} onClose={onClose} size="3xl">
      <ModalHeader
        title="Candidate Profile"
        description={`Record ID: ${candidate.id} • ${candidate.company || "CVForge Talent Pool"}`}
        onClose={onClose}
      />

      <ModalBody scrollable={false} className="p-0 flex flex-col max-h-[calc(86vh-120px)] overflow-hidden">
        {/* ── Modal Header Banner ── */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 relative overflow-hidden shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center border-2 border-white/20 shadow-md shrink-0">
                {initials || <User className="w-7 h-7" />}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-white truncate">
                  {candidate.fullName || "—"}
                </h2>
                <p className="text-sm text-slate-300 font-medium mt-0.5 truncate">
                  {[candidate.currentRole, candidate.company].filter(Boolean).join(" • ") || "—"}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{candidate.email || "—"}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{candidate.phone || "—"}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{candidate.location || "—"}</span>
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
                Added: {formatDateTime(candidate.createdAt)}
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
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 shrink-0">
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

        {/* ── Modal Tab Content (Flex-1 scrollable with custom scrollbar and generous bottom padding) ── */}
        <div className="p-6 pb-12 flex-1 overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Experience
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.experienceYears && candidate.experienceYears > 0
                      ? `${candidate.experienceYears} ${candidate.experienceYears === 1 ? "Year" : "Years"}`
                      : "—"}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Notice Period
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.noticePeriod || "—"}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Current CTC
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.currentSalary || "—"}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                    Expected CTC
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
                    {candidate.expectedSalary || "—"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Technical Skills & Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-start">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs mb-2">
                    <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Highest Degree / Education</span>
                  </div>
                  {(() => {
                    const educations = parseAllEducations(candidate.highestDegree);
                    if (educations.length === 0) {
                      return <p className="text-xs text-slate-400 font-normal py-1">—</p>;
                    }
                    return (
                      <div className="space-y-3">
                        {educations.map((edu, idx) => (
                          <div
                            key={idx}
                            className={idx > 0 ? "pt-2.5 border-t border-slate-200 dark:border-slate-800" : ""}
                          >
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-tight flex items-center gap-1.5">
                              {educations.length > 1 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              )}
                              <span>{edu.degree}</span>
                            </p>
                            {(edu.institution || edu.year) && (
                              <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium ${educations.length > 1 ? "pl-3" : ""}`}>
                                {[edu.institution, edu.year].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-start">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs mb-2">
                    <Tag className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Sourced Via & Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.source && (
                      <Badge variant="info" size="sm">
                        Source: {candidate.source}
                      </Badge>
                    )}
                    {candidate.tags && candidate.tags.length > 0 ? (
                      candidate.tags.map((tag) => (
                        <Badge key={tag} variant="info" size="sm">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      !candidate.source && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Note / Remarks Section in Overview */}
              {candidate.notes && candidate.notes.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Latest Note / Remarks</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("notes")}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                    >
                      View all ({candidate.notes.length})
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {candidate.notes[0].text}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    — {candidate.notes[0].author} • {formatDateTime(candidate.notes[0].date)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* APPLICATION HISTORY TAB */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Work Experience & Application History
              </h4>
              {candidate.applicationHistory.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4">
                  No previous applications or work history records documented.
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
                          {app.department} <span className="mx-1">•</span> Period / Applied: {app.appliedDate}
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
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {candidate.resumeFileName || `${candidate.fullName.replace(/\s+/g, "_")}_Resume.pdf`}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Extracted Resume File <span className="mx-1">•</span> Available in FilePathUpload
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
                    Download
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* NOTES & ACTIVITY TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {onAddNote && (
                <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add interview feedback or candidate note..."
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
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
                        <span className="text-[11px] text-slate-400 font-medium">{formatDateTime(note.date)}</span>
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

      <ModalFooter className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Candidate ID: {candidate.id}
        </span>
        <Button variant="outline" onClick={onClose} className="rounded-lg text-xs font-semibold px-5">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
