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
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Download,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Building2,
  GraduationCap,
  Clock,
  DollarSign,
  Award,
  Layers,
  Check,
  X,
  Send,
  UserCheck,
} from "lucide-react";
import type {
  CandidateApplication,
  ApplicationStage,
  ApplicationStatus,
  EligibilityStatus,
} from "../types/application.types";
import { toast } from "@/shared/ui/toast";

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CandidateApplication | null;
  onStageChange?: (appId: string, stage: ApplicationStage) => void;
  onStatusChange?: (appId: string, status: ApplicationStatus) => void;
  onDownloadResume?: (app: CandidateApplication) => void;
}

const getEligibilityBadge = (status?: EligibilityStatus) => {
  switch (status) {
    case "Highly Qualified":
      return { variant: "success" as const, label: "Highly Qualified", icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" };
    case "Eligible":
      return { variant: "info" as const, label: "Eligible for Role", icon: CheckCircle2, color: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" };
    case "Partially Eligible":
      return { variant: "warning" as const, label: "Partially Eligible", icon: AlertCircle, color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" };
    case "Not Eligible":
      return { variant: "danger" as const, label: "Not Eligible", icon: XCircle, color: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800" };
    default:
      return { variant: "default" as const, label: "Under Review", icon: Clock, color: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" };
  }
};

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  isOpen,
  onClose,
  application,
  onStageChange,
  onStatusChange,
  onDownloadResume,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "match" | "pipeline" | "notes">("overview");
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

    application.notes = [noteObj, ...(application.notes || [])];
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
  const eligibility = getEligibilityBadge(application.eligibilityStatus);
  const EligibilityIcon = eligibility.icon;
  const match = application.matchBreakdown;

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={application.candidateName}
        description={`Application for ${application.jobTitle} • ${application.department}`}
        onClose={onClose}
      />

      <ModalBody className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
        {/* Candidate Banner Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
                  {application.candidateName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  {application.matchScore}% Resume Match
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${eligibility.color}`}>
                  <EligibilityIcon className="w-3.5 h-3.5" />
                  {eligibility.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-slate-800 dark:text-slate-200">{application.currentRole}</span>
                <span className="text-slate-400">•</span>
                <span>{application.currentCompany}</span>
                <span className="text-slate-400">•</span>
                <span>{application.experienceYears} Years Exp</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onDownloadResume && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadResume(application)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Resume
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: "overview", label: "Candidate Profile & Overview" },
            { id: "match", label: `Resume Match & Eligibility (${application.matchScore}%)` },
            { id: "pipeline", label: "Hiring Pipeline" },
            { id: "notes", label: `Evaluation Notes (${application.notes?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
            {/* Brief Info Callout */}
            {application.briefInfo && (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/90 dark:border-blue-900/60 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                    Executive Profile Brief
                  </h4>
                  <p className="text-xs text-blue-950 dark:text-blue-100 mt-1 leading-relaxed">
                    {application.briefInfo}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Contact & Location
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{application.candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{application.candidatePhone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium">{application.location}</span>
                  </div>
                  {application.education && (
                    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">{application.education}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Experience & Compensation
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Total Experience:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{application.experienceYears} Years</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Current Role:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{application.currentRole}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Current Company:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{application.currentCompany}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Expected Salary:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{application.expectedSalary}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500">Notice Period:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{application.noticePeriod}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            {application.summary && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full Candidate Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {application.summary}
                </p>
              </div>
            )}

            {/* Candidate Tags & Skills */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Skills & Candidate Badges
              </h4>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
                {application.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESUME MATCH & ELIGIBILITY */}
        {activeTab === "match" && (
          <div className="space-y-5">
            {/* AI Resume Match Score Breakdown Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Overall Match
                  </span>
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {application.matchScore}%
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">score</span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 dark:bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${application.matchScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Skills Match
                  </span>
                  <Layers className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {match?.skillsMatch || application.matchScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${match?.skillsMatch || application.matchScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Experience Match
                  </span>
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {match?.experienceMatch || 90}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${match?.experienceMatch || 90}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Education & Degree
                  </span>
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {match?.educationMatch || 92}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-purple-600 dark:bg-purple-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${match?.educationMatch || 92}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Recommendation Summary */}
            {match?.aiRecommendation && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  AI Matching Analysis & Evaluation
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {match.aiRecommendation}
                </p>
              </div>
            )}

            {/* Job Eligibility Criteria Checklist */}
            {match?.eligibilityCriteria && match.eligibilityCriteria.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Job Requirements Eligibility Checklist
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {match.eligibilityCriteria.map((crit, idx) => (
                    <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {crit.status === "met" && (
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                          {crit.status === "partially_met" && (
                            <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
                              <AlertCircle className="w-3 h-3" />
                            </div>
                          )}
                          {crit.status === "unmet" && (
                            <div className="w-4 h-4 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {crit.criterion}
                          </span>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                            {crit.details}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          crit.status === "met"
                            ? "success"
                            : crit.status === "partially_met"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                        rounded
                      >
                        {crit.status === "met"
                          ? "Criteria Met"
                          : crit.status === "partially_met"
                          ? "Partial Match"
                          : "Unmet"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched vs Missing Skills Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Skills ({match?.matchedSkills?.length || application.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(match?.matchedSkills || application.skills).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Missing / Desired Skills ({match?.missingSkills?.length || 0})
                </h4>
                {match?.missingSkills && match.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {match.missingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      >
                        • {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Candidate satisfies all key required job skills!
                  </p>
                )}
              </div>
            </div>

            {/* Resume File Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {application.resumeFileName || "Candidate_Resume.pdf"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Uploaded on {application.appliedDate} • Verified PDF
                  </p>
                </div>
              </div>
              {onDownloadResume && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownloadResume(application)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download CV
                </Button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HIRING PIPELINE */}
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
                    <div
                      key={stageName}
                      className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group"
                      onClick={() => onStageChange?.(application.id, stageName)}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/60 scale-110"
                            : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isCompleted && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : isCompleted
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-400"
                        }`}
                      >
                        {stageName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Current Pipeline Stage:{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {application.stage}
                </span>
              </div>
              {onStageChange && (
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStageChange(application.id, "Rejected")}
                    className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Reject Candidate
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      const nextIdx = Math.min(currentStageIndex + 1, STAGES_LIST.length - 1);
                      onStageChange(application.id, STAGES_LIST[nextIdx]);
                    }}
                    className="text-xs"
                  >
                    Advance to Next Stage
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EVALUATION NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-5">
            {/* Add New Note Form */}
            <form onSubmit={handleAddNote} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Add Interviewer Evaluation Feedback
              </h4>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write interview observations, rating, or resume evaluation remarks..."
                rows={3}
                className="w-full text-xs p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`p-1 cursor-pointer transition-colors ${
                        star <= newRating ? "text-amber-400" : "text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
                <Button size="sm" variant="primary" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Post Feedback
                </Button>
              </div>
            </form>

            {/* Existing Notes List */}
            <div className="space-y-3">
              {application.notes && application.notes.length > 0 ? (
                application.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {note.author}
                        </span>
                        <span className="text-slate-400 text-2xs">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {note.date}
                        </span>
                      </div>
                      {note.rating && (
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: note.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No evaluation feedback notes yet. Add the first note above!
                </div>
              )}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center justify-between p-4">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Application ID: <span className="font-semibold text-slate-800 dark:text-slate-200">{application.id}</span>
        </div>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
