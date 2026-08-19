import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Star,
  Sparkles,
  FileText,
  Send,
} from "lucide-react";
import type { PooledCandidate, ReadinessStatus, TalentPoolCategory } from "../types/talentpool.types";
import { cn } from "@/shared/lib/utils";

interface CandidateQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: PooledCandidate | null;
  pools: TalentPoolCategory[];
  onAssignToJob: (candidate: PooledCandidate) => void;
  onUpdateReadiness: (candidateId: string, status: ReadinessStatus) => void;
  onTogglePoolMembership: (candidateId: string, poolId: string) => void;
  onAddNote: (candidateId: string, noteText: string) => void;
}

export const CandidateQuickViewModal: React.FC<CandidateQuickViewModalProps> = ({
  isOpen,
  onClose,
  candidate,
  pools,
  onAssignToJob,
  onUpdateReadiness,
  onTogglePoolMembership,
  onAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "pools" | "notes">("overview");
  const [newNoteText, setNewNoteText] = useState("");

  if (!candidate) return null;

  const attachedPools = pools.filter((p) => candidate.poolIds?.includes(p.id));

  const handleNoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(candidate.id, newNoteText.trim());
    setNewNoteText("");
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title="Candidate Talent Card"
        description={`Curated Profile: ${candidate.id}`}
        onClose={onClose}
      />
      <ModalBody className="space-y-4">
        {/* Candidate Top Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-inner uppercase shrink-0">
                {candidate.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{candidate.fullName}</h3>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={13}
                        fill={star <= candidate.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                  <span>{candidate.currentRole}</span> &bull; <span>{candidate.company}</span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {candidate.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} /> {candidate.experienceYears} Years Exp
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-300 bg-blue-900/80 px-2.5 py-1 rounded-full border border-blue-700">
                <Sparkles size={13} className="text-blue-400" />
                {candidate.matchScore}% Match
              </span>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 hover:bg-blue-500"
                onClick={() => {
                  onClose();
                  onAssignToJob(candidate);
                }}
              >
                <Send size={13} />
                Assign to Job
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 border-b-2 transition-colors",
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Overview & Skills
          </button>
          <button
            onClick={() => setActiveTab("pools")}
            className={cn(
              "px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "pools"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Talent Pools ({attachedPools.length})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={cn(
              "px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "notes"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Notes ({candidate.notes?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Readiness */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Readiness Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(["Ready to Move", "Exploring", "Passive", "Not Available"] as ReadinessStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateReadiness(candidate.id, st)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md border transition-all",
                        candidate.readinessStatus === st
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Notice Period
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {candidate.noticePeriod}
                </span>
              </div>
            </div>

            {/* AI Summary */}
            {candidate.aiSummary && (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200/80 dark:border-blue-800">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} className="text-blue-500" />
                  AI Candidate Summary
                </h4>
                <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed">
                  {candidate.aiSummary}
                </p>
              </div>
            )}

            {/* Contact & Comp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Contact Information
                </span>
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Mail size={13} className="text-slate-400" /> {candidate.email}
                </p>
                <p className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Phone size={13} className="text-slate-400" /> {candidate.phone}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Compensation
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Current: <span className="font-bold">{candidate.currentSalary}</span> | Expected: <span className="font-bold text-emerald-600 dark:text-emerald-400">{candidate.expectedSalary}</span>
                </p>
                <p className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText size={13} /> {candidate.resumeFileName || "Resume.pdf"}
                  </span>
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                Evaluated Technical Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pools" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toggle membership of {candidate.fullName} across available talent pools:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pools.map((pool) => {
                const isMember = candidate.poolIds?.includes(pool.id);
                return (
                  <div
                    key={pool.id}
                    className={cn(
                      "p-3 rounded-lg border flex items-center justify-between transition-colors",
                      isMember
                        ? "border-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {pool.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {pool.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTogglePoolMembership(candidate.id, pool.id)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-md border transition-all",
                        isMember
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                      )}
                    >
                      {isMember ? "In Pool ✓" : "+ Add to Pool"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <form onSubmit={handleNoteSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Add recruiter note or remark..."
                value={newNoteText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNoteText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <Button type="submit" size="sm">
                Add Note
              </Button>
            </form>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {candidate.notes && candidate.notes.length > 0 ? (
                candidate.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {note.author}
                      </span>
                      <span>{note.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{note.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  No notes recorded yet.
                </p>
              )}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close Profile
        </Button>
      </ModalFooter>
    </Modal>
  );
};
