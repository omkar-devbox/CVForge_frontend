import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  Eye,
  Edit3,
  Share2,
  Trash2,
  ChevronDown,
  CheckCircle2,
  X,
  User,
  Star,
  Download,
  UserX,
  RotateCcw,
  Filter,
  MapPin,
  Copy,
  Check,
  Mail,
  Phone,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { parseEducation, parseAllEducations } from "../../services/candidatesApi";
import type { Candidate, CandidateStatus, CandidateStage } from "../types/candidate.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";
import { formatDateTime } from "@/shared/lib/utils";

export interface CandidateDetailTableProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onShareCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string, name: string) => void;
  onBulkDelete?: (candidateIds: (string | number)[]) => void;
  onStatusChange?: (candidateId: string, status: CandidateStatus) => void;
  onStageChange?: (candidateId: string, stage: CandidateStage) => void;
  onDownloadResume?: (candidate: Candidate) => void;
  onResetFilters?: () => void;
  isLoading?: boolean;
  selectable?: boolean;
  selectedCandidateIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

/* =========================================================
   🔹 HELPER FUNCTIONS & CELL COMPONENTS
========================================================= */

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
      return "default";
  }
};

const getStageBadgeVariant = (stage: CandidateStage): BadgeVariant => {
  switch (stage) {
    case "New":
    case "Screening":
      return "info";
    case "Interview":
      return "warning";
    case "Offer":
    case "Hired":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "default";
  }
};

export const CANDIDATE_STAGES: CandidateStage[] = [
  "New",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

export const CANDIDATE_STATUSES: CandidateStatus[] = [
  "Active",
  "In Pipeline",
  "Interviewing",
  "Hired",
  "Archived",
  "Blacklisted",
];

// --- Cell Components ---

interface CandidateNameCellProps {
  candidate: Candidate;
  onSelectCandidate: (candidate: Candidate) => void;
}

const CandidateNameCell: React.FC<CandidateNameCellProps> = ({ candidate, onSelectCandidate }) => {
  const displayName = candidate.fullName?.trim() || "—";
  const initials =
    displayName !== "—"
      ? displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
      : "";

  const subTitle = candidate.appliedJobTitle?.trim() || candidate.currentRole?.trim() || "";

  return (
    <div
      className="flex items-center gap-3 py-1 cursor-pointer group"
      onClick={() => onSelectCandidate(candidate)}
    >
      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800 shadow-2xs group-hover:border-blue-400 transition-colors">
        {initials || <User className="w-4 h-4" />}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm truncate">
          {displayName}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-normal">
          {subTitle || "—"}
        </div>
      </div>
    </div>
  );
};

interface CandidateEmailCellProps {
  email: string;
}

const CandidateEmailCell: React.FC<CandidateEmailCellProps> = ({ email }) => {
  const [copied, setCopied] = useState(false);
  const hasEmail = Boolean(email && email.trim() && email !== "—" && email !== "-");

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasEmail) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
    }
    setCopied(true);
    toast.success(`Copied email: ${email}`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasEmail) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5 py-1 group/email max-w-[210px]" onClick={(e) => e.stopPropagation()}>
      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
      <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-normal select-all" title={email}>
        {email}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-70 group-hover/email:opacity-100 shrink-0 cursor-pointer"
        title={copied ? "Copied!" : "Copy email"}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};

interface CandidatePhoneCellProps {
  phone: string;
}

const CandidatePhoneCell: React.FC<CandidatePhoneCellProps> = ({ phone }) => {
  const [copied, setCopied] = useState(false);
  const hasPhone = Boolean(phone && phone.trim() && phone !== "—" && phone !== "-");

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPhone) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
    }
    setCopied(true);
    toast.success(`Copied contact number: ${phone}`);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasPhone) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5 py-1 group/phone max-w-[180px]" onClick={(e) => e.stopPropagation()}>
      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate select-all whitespace-nowrap" title={phone}>
        {phone}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-70 group-hover/phone:opacity-100 shrink-0 cursor-pointer"
        title={copied ? "Copied!" : "Copy contact number"}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};

interface CandidateRoleCellProps {
  currentRole: string;
}

const CandidateRoleCell: React.FC<CandidateRoleCellProps> = ({ currentRole }) => {
  const hasRole = Boolean(currentRole && currentRole.trim() && currentRole !== "—" && currentRole !== "-");
  if (!hasRole) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }
  return (
    <div className="py-1">
      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentRole}>
        {currentRole}
      </div>
    </div>
  );
};

interface CandidateExperienceCellProps {
  experienceYears?: number | null;
}

const CandidateExperienceCell: React.FC<CandidateExperienceCellProps> = ({ experienceYears }) => {
  if (experienceYears === undefined || experienceYears === null || experienceYears <= 0) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }
  return (
    <div className="py-1">
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
        {experienceYears} {experienceYears === 1 ? "Year" : "Years"}
      </span>
    </div>
  );
};

interface CandidateProfileDomainCellProps {
  profile?: string;
}

const CandidateProfileDomainCell: React.FC<CandidateProfileDomainCellProps> = ({ profile }) => {
  const hasProfile = Boolean(profile && profile.trim() && profile !== "—" && profile !== "-");
  if (!hasProfile) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }
  return (
    <div className="py-1">
      <Badge variant="primary" size="sm" rounded>
        {profile}
      </Badge>
    </div>
  );
};

interface CandidateEducationCellProps {
  education?: string;
}

const CandidateEducationCell: React.FC<CandidateEducationCellProps> = ({ education }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const educations = useMemo(() => parseAllEducations(education), [education]);

  if (educations.length === 0) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  const primaryEdu = educations[0];
  const additionalCount = educations.length - 1;

  return (
    <div className="py-1 min-w-0 max-w-[240px]" onClick={(e) => e.stopPropagation()}>
      {/* Primary / Highest Education (Same dot design as requested) */}
      <div className="text-xs">
        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span
            className="truncate"
            title={[primaryEdu.degree, primaryEdu.institution, primaryEdu.year].filter(Boolean).join(" • ")}
          >
            {primaryEdu.degree}
          </span>
          {additionalCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer select-none shrink-0"
              title={isExpanded ? "Show fewer educations" : `Click to view all ${educations.length} qualifications`}
            >
              {isExpanded ? "Less" : `+${additionalCount}...`}
            </button>
          )}
        </div>
        {(primaryEdu.institution || primaryEdu.year) && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 mt-0.5 font-normal">
            {[primaryEdu.institution, primaryEdu.year].filter(Boolean).join(" • ")}
          </div>
        )}
      </div>

      {/* Expanded additional educations - exact same dot design, no vertical line */}
      {isExpanded && additionalCount > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
          {educations.slice(1).map((edu, idx) => (
            <div key={idx} className="text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">{edu.degree}</span>
              </div>
              {(edu.institution || edu.year) && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-3 mt-0.5 font-normal">
                  {[edu.institution, edu.year].filter(Boolean).join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface CandidateSkillsCellProps {
  skills?: string[];
}

const CandidateSkillsCell: React.FC<CandidateSkillsCellProps> = ({ skills = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const validSkills = Array.isArray(skills)
    ? skills.filter((s) => s && s.trim() && s !== "—" && s !== "-")
    : [];

  if (validSkills.length === 0) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  return (
    <div className="py-1" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-center gap-1.5">
        {(isExpanded ? validSkills : validSkills.slice(0, 3)).map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {skill}
          </span>
        ))}

        {validSkills.length > 3 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer select-none active:scale-95 ${isExpanded
              ? "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
              : "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold"
              }`}
            title={isExpanded ? "Show fewer skills" : `Show all ${validSkills.length} skills`}
          >
            {isExpanded ? "Show less" : `+${validSkills.length - 3}`}
          </button>
        )}
      </div>
    </div>
  );
};

interface CandidateSalaryCellProps {
  salary?: string;
}

const CandidateSalaryCell: React.FC<CandidateSalaryCellProps> = ({ salary }) => {
  const hasSalary = Boolean(
    salary &&
    salary.trim() &&
    salary !== "—" &&
    salary !== "-"
  );

  if (!hasSalary) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  return (
    <div className="py-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
      {salary}
    </div>
  );
};

interface CandidateSourceCellProps {
  source?: string;
}

const CandidateSourceCell: React.FC<CandidateSourceCellProps> = ({ source }) => {
  const hasSource = Boolean(
    source &&
    source.trim() &&
    source !== "—" &&
    source !== "-"
  );

  if (!hasSource) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  return (
    <div className="py-1">
      <Badge variant="default" size="sm" rounded>
        {source}
      </Badge>
    </div>
  );
};

interface CandidateNoteCellProps {
  candidate: Candidate;
  isOpen: boolean;
  onToggleMenu: (id: string | null) => void;
  onOpenDetailModal?: (candidate: Candidate) => void;
}

const CandidateNoteCell: React.FC<CandidateNoteCellProps> = ({
  candidate,
  isOpen,
  onToggleMenu,
  onOpenDetailModal,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean } | null>(null);

  const noteList = candidate.notes && candidate.notes.length > 0 ? candidate.notes : [];
  const latestNoteText = candidate.note || (noteList.length > 0 ? noteList[0].text : "") || "";
  const hasNote = Boolean(
    latestNoteText &&
    latestNoteText.trim() &&
    latestNoteText !== "—" &&
    latestNoteText !== "-"
  );

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 330;
    const popoverHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

    let left = rect.right - popoverWidth;
    if (left < 16) left = 16;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16);
    }

    const top = placeAbove ? rect.top - 6 : rect.bottom + 6;
    setCoords({ top, left, placeAbove });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const onScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    }
  }, [isOpen, updatePosition]);

  if (!hasNote) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 font-normal py-1 block">—</span>;
  }

  const latestDate = noteList.length > 0 && noteList[0].date ? formatDateTime(noteList[0].date) : "";

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      {/* ── Compact Interactive Note Pill ── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onToggleMenu(isOpen ? null : `note-${candidate.id}`)}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all cursor-pointer select-none max-w-[190px] text-left ${
          isOpen
            ? "bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs"
            : "bg-slate-50/90 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
        title="Click to view candidate notes"
      >
        <span className="w-4 h-4 rounded bg-blue-500/10 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <FileText className="w-2.5 h-2.5" />
        </span>
        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate min-w-0 flex-1">
          {latestNoteText}
        </span>
        {noteList.length > 1 && (
          <span className="ml-auto inline-flex items-center justify-center h-4 min-w-[18px] px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white shrink-0 shadow-2xs">
            {noteList.length}
          </span>
        )}
      </button>

      {/* ── Portaled Floating Popover Card ── */}
      {isOpen && coords && createPortal(
        <>
          {/* Click-away backdrop overlay */}
          <div
            className="fixed inset-0 z-[9998] bg-transparent"
            onClick={() => onToggleMenu(null)}
          />

          {/* Floating Card */}
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: coords.placeAbove ? "translateY(-100%)" : undefined,
              zIndex: 9999,
              width: "min(340px, calc(100vw - 32px))",
            }}
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-3.5 text-slate-900 dark:text-slate-100 select-text animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </span>
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    Candidate Notes
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {candidate.fullName} • {noteList.length || 1} {(noteList.length || 1) === 1 ? "entry" : "entries"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleMenu(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notes Timeline List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {(noteList.length > 0
                ? noteList
                : [
                    {
                      id: "single",
                      author: "Recruiter Note",
                      text: latestNoteText,
                      date: latestDate,
                    },
                  ]
              ).map((n, idx) => (
                <div
                  key={n.id || idx}
                  className="p-2.5 rounded-lg bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0" />
                      {n.author || "Recruiter Note"}
                    </span>
                    {n.date && <span className="shrink-0">{formatDateTime(n.date)}</span>}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words text-[11px]">
                    {n.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Popover Footer Action */}
            {onOpenDetailModal && (
              <div className="pt-2 mt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onToggleMenu(null);
                    onOpenDetailModal(candidate);
                  }}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Open Full Activity & Notes →
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

interface CandidateStatusCellProps {
  candidate: Candidate;
  isOpen: boolean;
  onToggleMenu: (id: string | null) => void;
  onStatusChange?: (candidateId: string, status: CandidateStatus) => void;
}

const CandidateStatusCell: React.FC<CandidateStatusCellProps> = ({
  candidate,
  isOpen,
  onToggleMenu,
  onStatusChange,
}) => (
  <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
    {onStatusChange ? (
      <>
        <button
          type="button"
          onClick={() => onToggleMenu(isOpen ? null : `status-${candidate.id}`)}
          className="inline-flex items-center focus:outline-hidden"
        >
          <Badge
            variant={getStatusBadgeVariant(candidate.status)}
            size="sm"
            rounded
            dot
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            {candidate.status}
            <ChevronDown className="w-3 h-3 ml-1 inline-block opacity-70" />
          </Badge>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-36 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => {
                  onStatusChange(candidate.id, st);
                  onToggleMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors ${candidate.status === st
                  ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-slate-700 dark:text-slate-300"
                  }`}
              >
                <span>{st}</span>
                {candidate.status === st && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </>
    ) : (
      <Badge variant={getStatusBadgeVariant(candidate.status)} size="sm" rounded dot>
        {candidate.status}
      </Badge>
    )}
  </div>
);

interface CandidateActionsCellProps {
  candidate: Candidate;
  onSelectCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string, name: string) => void;
  onDownloadResume?: (candidate: Candidate) => void;
}

const CandidateActionsCell: React.FC<CandidateActionsCellProps> = ({
  candidate,
  onSelectCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onDownloadResume,
}) => (
  <div
    className="flex items-center justify-end gap-1.5"
    onClick={(e) => e.stopPropagation()}
  >
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onSelectCandidate(candidate)}
      title="View Candidate Details"
      className="h-9 w-9 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Eye className="w-5 h-5" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onEditCandidate(candidate)}
      title="Edit Candidate"
      className="h-9 w-9 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Edit3 className="w-5 h-5" />
    </Button>

    {onDownloadResume && (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDownloadResume(candidate)}
        title="Download Resume"
        className="h-9 w-9 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Download className="w-5 h-5 text-blue-500" />
      </Button>
    )}

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onDeleteCandidate(candidate.id, candidate.fullName)}
      title="Delete Candidate"
      className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    >
      <Trash2 className="w-5 h-5" />
    </Button>
  </div>
);

interface CandidateCardProps {
  candidate: Candidate;
  isSelected?: boolean;
  selectable?: boolean;
  onSelectCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onShareCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string, name: string) => void;
  onDownloadResume?: (candidate: Candidate) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected = false,
  selectable = true,
  onSelectCandidate,
  onEditCandidate,
  onShareCandidate,
  onDeleteCandidate,
  onDownloadResume,
}) => {
  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className={`p-4 bg-white dark:bg-slate-900 border ${isSelected
        ? "border-blue-500 ring-1 ring-blue-500/50 dark:border-blue-500"
        : "border-slate-200 dark:border-slate-800"
        } rounded-xl space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {selectable && (
            <div className="pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
            </div>
          )}
          <div
            className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800 shadow-2xs cursor-pointer"
            onClick={() => onSelectCandidate(candidate)}
          >
            {initials || <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h4
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-sm truncate"
              onClick={() => onSelectCandidate(candidate)}
            >
              {candidate.fullName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {candidate.currentRole} {candidate.company ? `• ${candidate.company}` : ""}
            </p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(candidate.status)} size="sm" rounded dot>
          {candidate.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          {candidate.location || "Remote"}
        </span>
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {candidate.experienceYears} yrs exp
        </span>
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="inline-flex items-center px-1 py-0.5 text-[10px] font-medium text-slate-400">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-3 h-3 ${idx < candidate.rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-700"
                }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelectCandidate(candidate)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditCandidate(candidate)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          {onDownloadResume && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDownloadResume(candidate)}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              title="Download Resume"
            >
              <Download className="w-4 h-4 text-blue-500" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDeleteCandidate(candidate.id, candidate.fullName)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface EmptyCandidatesViewProps {
  onResetFilters?: () => void;
}

const EmptyCandidatesView: React.FC<EmptyCandidatesViewProps> = ({ onResetFilters }) => (
  <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3">
      <UserX className="w-7 h-7 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
      No Candidates Found
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
      No candidate profiles matched your search criteria or active filters.
      Try clearing your filters to see all available candidates.
    </p>
    {onResetFilters && (
      <Button
        onClick={onResetFilters}
        variant="outline"
        size="sm"
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        className="mt-4"
      >
        Clear All Filters
      </Button>
    )}
  </div>
);

/* =========================================================
   🔹 MAIN CANDIDATE DETAIL TABLE COMPONENT
========================================================= */

export const CandidateDetailTable: React.FC<CandidateDetailTableProps> = ({
  candidates,
  onSelectCandidate,
  onEditCandidate,
  onShareCandidate,
  onDeleteCandidate,
  onBulkDelete,
  onStatusChange,
  onStageChange,
  onDownloadResume,
  onResetFilters,
  isLoading = false,
  selectable = true,
  selectedCandidateIds,
  onSelectionChange,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [internalSelection, setInternalSelection] = useState<(string | number)[]>(
    selectedCandidateIds || []
  );

  // Column search / select filters state (matching JobDetailTable.tsx)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    fullName: "",
    email: "",
    phone: "",
    currentRole: "",
    experienceYears: "",
    highestDegree: "",
    skills: "",
    status: "",
    noticePeriod: "",
    currentSalary: "",
    expectedSalary: "",
    source: "",
    note: "",
  });

  // Sync internal selection with external prop
  useEffect(() => {
    if (selectedCandidateIds !== undefined) {
      setInternalSelection(selectedCandidateIds);
    }
  }, [selectedCandidateIds]);

  const activeSelection = selectedCandidateIds !== undefined ? selectedCandidateIds : internalSelection;

  const handleSelectionChange = useCallback(
    (newSelection: (string | number)[]) => {
      setInternalSelection(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    },
    [onSelectionChange]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleToggleMenu = useCallback((id: string | null) => {
    setActiveDropdownId(id);
  }, []);

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  }, []);

  const handleClearColumnFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: "",
    }));
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setColumnFilters({
      fullName: "",
      email: "",
      phone: "",
      currentRole: "",
      experienceYears: "",
      highestDegree: "",
      skills: "",
      status: "",
      noticePeriod: "",
      currentSalary: "",
      expectedSalary: "",
      source: "",
      note: "",
    });
    if (onResetFilters) {
      onResetFilters();
    }
  }, [onResetFilters]);

  // Columns definition using reusable ColumnDef with isFilter & filterSectionRender
  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        id: "fullName",
        label: "Candidate Name",
        key: "fullName",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Candidate Name
            </label>
            <FormField
              type="text"
              placeholder="Search name, email, or phone..."
              value={columnFilters.fullName || ""}
              onChange={(e: any) => handleColumnFilterChange("fullName", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.fullName && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("fullName")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 220,
        minWidth: 180,
        render: (candidate: Candidate) => (
          <CandidateNameCell candidate={candidate} onSelectCandidate={onSelectCandidate} />
        ),
      },
      {
        id: "email",
        label: "Email",
        key: "email",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Email
            </label>
            <FormField
              type="text"
              placeholder="Search email address..."
              value={columnFilters.email || ""}
              onChange={(e: any) => handleColumnFilterChange("email", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.email && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("email")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 210,
        render: (candidate: Candidate) => <CandidateEmailCell email={candidate.email} />,
      },
      {
        id: "phone",
        label: "Contact Number",
        key: "phone",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Contact Number
            </label>
            <FormField
              type="text"
              placeholder="Search contact number..."
              value={columnFilters.phone || ""}
              onChange={(e: any) => handleColumnFilterChange("phone", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.phone && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("phone")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 175,
        render: (candidate: Candidate) => <CandidatePhoneCell phone={candidate.phone} />,
      },
      {
        id: "currentRole",
        label: "Role",
        key: "currentRole",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Role
            </label>
            <FormField
              type="text"
              placeholder="Search role/designation..."
              value={columnFilters.currentRole || ""}
              onChange={(e: any) => handleColumnFilterChange("currentRole", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.currentRole && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("currentRole")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 170,
        render: (candidate: Candidate) => <CandidateRoleCell currentRole={candidate.currentRole} />,
      },
      {
        id: "experienceYears",
        label: "Total Experience",
        key: "experienceYears",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Experience
            </label>
            <FormField
              type="text"
              placeholder="Search experience (years)..."
              value={columnFilters.experienceYears || ""}
              onChange={(e: any) => handleColumnFilterChange("experienceYears", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.experienceYears && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("experienceYears")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 130,
        render: (candidate: Candidate) => (
          <CandidateExperienceCell experienceYears={candidate.experienceYears} />
        ),
      },
      {
        id: "highestDegree",
        label: "Education",
        key: "highestDegree",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Education
            </label>
            <FormField
              type="text"
              placeholder="Search degree / education..."
              value={columnFilters.highestDegree || ""}
              onChange={(e: any) => handleColumnFilterChange("highestDegree", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.highestDegree && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("highestDegree")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 200,
        minWidth: 160,
        render: (candidate: Candidate) => (
          <CandidateEducationCell education={candidate.highestDegree} />
        ),
      },
      {
        id: "skills",
        label: "Skills",
        key: "skills",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Skills
            </label>
            <FormField
              type="text"
              placeholder="Search skill keyword..."
              value={columnFilters.skills || ""}
              onChange={(e: any) => handleColumnFilterChange("skills", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.skills && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("skills")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 220,
        render: (candidate: Candidate) => <CandidateSkillsCell skills={candidate.skills} />,
      },

      {
        id: "noticePeriod",
        label: "Notice Period",
        key: "noticePeriod",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Notice Period
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Notice Periods", value: "" },
                { label: "Immediate", value: "Immediate" },
                { label: "15 Days", value: "15 Days" },
                { label: "30 Days", value: "30 Days" },
                { label: "60 Days", value: "60 Days" },
                { label: "90 Days", value: "90 Days" },
              ]}
              value={columnFilters.noticePeriod || ""}
              onChange={(val: any) => handleColumnFilterChange("noticePeriod", typeof val === "string" ? val : (val?.value ?? ""))}
              fieldSize="sm"
            />
            {columnFilters.noticePeriod && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("noticePeriod")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 130,
        render: (candidate: Candidate) => {
          const hasNotice = Boolean(
            candidate.noticePeriod &&
            candidate.noticePeriod.trim() &&
            candidate.noticePeriod !== "—" &&
            candidate.noticePeriod !== "-"
          );
          return (
            <div className="py-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
              {hasNotice ? (
                candidate.noticePeriod
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">—</span>
              )}
            </div>
          );
        },
      },
      {
        id: "currentSalary",
        label: "Current CTC",
        key: "currentSalary",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Current CTC
            </label>
            <FormField
              type="text"
              placeholder="Search current CTC..."
              value={columnFilters.currentSalary || ""}
              onChange={(e: any) => handleColumnFilterChange("currentSalary", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.currentSalary && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("currentSalary")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 125,
        render: (candidate: Candidate) => (
          <CandidateSalaryCell salary={candidate.currentSalary} />
        ),
      },
      {
        id: "expectedSalary",
        label: "Expected CTC",
        key: "expectedSalary",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Expected CTC
            </label>
            <FormField
              type="text"
              placeholder="Search expected CTC..."
              value={columnFilters.expectedSalary || ""}
              onChange={(e: any) => handleColumnFilterChange("expectedSalary", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.expectedSalary && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("expectedSalary")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 130,
        render: (candidate: Candidate) => (
          <CandidateSalaryCell salary={candidate.expectedSalary} />
        ),
      },
      {
        id: "source",
        label: "Source",
        key: "source",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Source
            </label>
            <FormField
              type="text"
              placeholder="Search source..."
              value={columnFilters.source || ""}
              onChange={(e: any) => handleColumnFilterChange("source", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.source && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("source")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 140,
        render: (candidate: Candidate) => (
          <CandidateSourceCell source={candidate.source} />
        ),
      },
      {
        id: "status",
        label: "Status",
        key: "status",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Status
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Statuses", value: "" },
                { label: "Active", value: "Active" },
                { label: "In Pipeline", value: "In Pipeline" },
                { label: "Interviewing", value: "Interviewing" },
                { label: "Hired", value: "Hired" },
                { label: "Archived", value: "Archived" },
                { label: "Blacklisted", value: "Blacklisted" },
              ]}
              value={columnFilters.status || ""}
              onChange={(val: any) => handleColumnFilterChange("status", typeof val === "string" ? val : (val?.value ?? ""))}
              fieldSize="sm"
            />
            {columnFilters.status && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("status")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 140,
        render: (candidate: Candidate) => (
          <CandidateStatusCell
            candidate={candidate}
            isOpen={activeDropdownId === `status-${candidate.id}`}
            onToggleMenu={handleToggleMenu}
            onStatusChange={onStatusChange}
          />
        ),
      },
      {
        id: "note",
        label: "Note",
        key: "note",
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Note
            </label>
            <FormField
              type="text"
              placeholder="Search notes..."
              value={columnFilters.note || ""}
              onChange={(e: any) => handleColumnFilterChange("note", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.note && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("note")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 210,
        minWidth: 180,
        sortable: true,
        render: (candidate: Candidate) => (
          <CandidateNoteCell
            candidate={candidate}
            isOpen={activeDropdownId === `note-${candidate.id}`}
            onToggleMenu={handleToggleMenu}
            onOpenDetailModal={onSelectCandidate}
          />
        ),
      },
      {
        id: "actions",
        label: "Actions",
        width: 170,
        render: (candidate: Candidate) => (
          <CandidateActionsCell
            candidate={candidate}
            onSelectCandidate={onSelectCandidate}
            onEditCandidate={onEditCandidate}
            onDeleteCandidate={onDeleteCandidate}
            onDownloadResume={onDownloadResume}
          />
        ),
      },
    ],
    [
      onSelectCandidate,
      onEditCandidate,
      onShareCandidate,
      onDeleteCandidate,
      onDownloadResume,
      onStageChange,
      onStatusChange,
      activeDropdownId,
      handleToggleMenu,
      columnFilters,
      handleColumnFilterChange,
      handleClearColumnFilter,
    ]
  );

  // Filtered candidate list based on local column filter values
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (
        columnFilters.fullName &&
        !c.fullName.toLowerCase().includes(columnFilters.fullName.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.email &&
        !c.email.toLowerCase().includes(columnFilters.email.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.phone &&
        !c.phone.toLowerCase().includes(columnFilters.phone.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.currentRole &&
        !c.currentRole.toLowerCase().includes(columnFilters.currentRole.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.highestDegree &&
        !(c.highestDegree || "").toLowerCase().includes(columnFilters.highestDegree.toLowerCase())
      ) {
        return false;
      }
      if (columnFilters.experienceYears) {
        const query = columnFilters.experienceYears.toLowerCase();
        if (!String(c.experienceYears).includes(query)) {
          return false;
        }
      }
      if (columnFilters.skills) {
        const query = columnFilters.skills.toLowerCase();
        if (!c.skills.some((s) => s.toLowerCase().includes(query))) {
          return false;
        }
      }
      if (
        columnFilters.status &&
        columnFilters.status !== "All" &&
        !c.status.toLowerCase().includes(columnFilters.status.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.noticePeriod &&
        columnFilters.noticePeriod !== "All" &&
        !c.noticePeriod.toLowerCase().includes(columnFilters.noticePeriod.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.currentSalary &&
        !(c.currentSalary || "").toLowerCase().includes(columnFilters.currentSalary.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.expectedSalary &&
        !(c.expectedSalary || "").toLowerCase().includes(columnFilters.expectedSalary.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.source &&
        !(c.source || "").toLowerCase().includes(columnFilters.source.toLowerCase())
      ) {
        return false;
      }
      if (columnFilters.note) {
        const query = columnFilters.note.toLowerCase();
        const noteText = (c.note || (c.notes && c.notes.length > 0 ? c.notes[0].text : "") || "").toLowerCase();
        const matchesAnyNote =
          noteText.includes(query) ||
          Boolean(c.notes && c.notes.some((n) => (n.text || "").toLowerCase().includes(query)));
        if (!matchesAnyNote) {
          return false;
        }
      }
      return true;
    });
  }, [candidates, columnFilters]);

  // Active filters list
  const activeFilters = useMemo(() => {
    return Object.entries(columnFilters).filter(([_, val]) => Boolean(val));
  }, [columnFilters]);

  // Single selected candidate item
  const singleSelectedCandidate = useMemo(() => {
    if (activeSelection.length === 1) {
      return filteredCandidates.find((c) => String(c.id) === String(activeSelection[0])) || null;
    }
    return null;
  }, [filteredCandidates, activeSelection]);

  const renderCard = useCallback(
    (candidate: Candidate) => (
      <CandidateCard
        candidate={candidate}
        selectable={selectable}
        isSelected={activeSelection.some((id) => String(id) === String(candidate.id))}
        onSelectCandidate={onSelectCandidate}
        onEditCandidate={onEditCandidate}
        onShareCandidate={onShareCandidate}
        onDeleteCandidate={onDeleteCandidate}
        onDownloadResume={onDownloadResume}
      />
    ),
    [selectable, activeSelection, onSelectCandidate, onEditCandidate, onShareCandidate, onDeleteCandidate, onDownloadResume]
  );

  const getRowId = useCallback((candidate: Candidate) => candidate.id, []);

  // If no candidates found after filtering, show empty view matching JobDetailTable
  if (filteredCandidates.length === 0 && !isLoading) {
    return <EmptyCandidatesView onResetFilters={handleResetAllFilters} />;
  }

  const selectedCount = activeSelection.length;

  return (
    <div className="flex flex-col w-full">
      {/* ── Selection Action Bar (Matching JobDetailTable) ── */}
      {selectedCount > 0 && (
        <div className="bg-blue-50/95 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800/60 px-4 py-2.5 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
              {selectedCount}
            </span>
            <span>
              {selectedCount === 1
                ? `1 candidate selected${singleSelectedCandidate ? `: ${singleSelectedCandidate.fullName}` : ""}`
                : `${selectedCount} candidates selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Single Select: View, Edit & Delete buttons */}
            {selectedCount === 1 && singleSelectedCandidate && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectCandidate(singleSelectedCandidate)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  className="h-8 text-xs font-medium bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditCandidate(singleSelectedCandidate)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  className="h-8 text-xs font-medium bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Edit Candidate
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDeleteCandidate(singleSelectedCandidate.id, singleSelectedCandidate.fullName)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="h-8 text-xs font-medium shadow-xs"
                >
                  Delete Candidate
                </Button>
              </>
            )}

            {/* Multi Select: Bulk Delete button */}
            {selectedCount > 1 && onBulkDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onBulkDelete(activeSelection)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="h-8 text-xs font-medium shadow-xs"
              >
                Bulk Delete ({selectedCount})
              </Button>
            )}

            {/* Clear Selection */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSelectionChange([])}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-blue-100/60 dark:hover:bg-blue-900/40 rounded-lg ml-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Active Filters Tag Bar ── */}
      {activeFilters.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              Active Filters:
            </span>
            {activeFilters.map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <span className="capitalize text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  {key === "fullName"
                    ? "Name"
                    : key === "currentRole"
                      ? "Role/Loc"
                      : key === "experienceYears"
                        ? "Exp/Skills"
                        : key === "currentSalary"
                          ? "Current CTC"
                          : key === "expectedSalary"
                            ? "Expected CTC"
                            : key === "source"
                              ? "Source"
                              : key === "note"
                                ? "Note"
                                : key}:
                </span>
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => handleClearColumnFilter(key)}
                  className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full cursor-pointer ml-0.5"
                  title={`Remove ${key} filter`}
                >
                  <X className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                </button>
              </span>
            ))}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetAllFilters}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-7 px-2"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* ── Reusable DataTable ── */}
      <DataTable<Candidate>
        data={filteredCandidates}
        columns={columns}
        isLoading={isLoading}
        selectable={selectable}
        selection={activeSelection}
        onSelectionChange={handleSelectionChange}
        getRowId={getRowId}
        hideToolbar={true}
        pageSize={10}
        renderCard={renderCard}
      />
    </div>
  );
};
