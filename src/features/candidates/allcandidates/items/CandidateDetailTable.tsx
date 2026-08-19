import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  Sparkles,
  Download,
} from "lucide-react";
import type { Candidate, CandidateStatus, CandidateStage } from "../types/candidate.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

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

const STATUS_OPTIONS: CandidateStatus[] = [
  "Active",
  "In Pipeline",
  "Interviewing",
  "Hired",
  "Archived",
  "Blacklisted",
];

const STAGE_OPTIONS: CandidateStage[] = [
  "New",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

// --- Cell Components ---

interface CandidateNameCellProps {
  candidate: Candidate;
  onSelectCandidate: (candidate: Candidate) => void;
}

const CandidateNameCell: React.FC<CandidateNameCellProps> = ({ candidate, onSelectCandidate }) => {
  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

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
          {candidate.fullName}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 truncate font-normal">
          <span className="truncate">{candidate.email}</span>
          <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
          <span className="shrink-0">{candidate.phone}</span>
        </div>
      </div>
    </div>
  );
};

interface CandidateRoleCellProps {
  candidate: Candidate;
}

const CandidateRoleCell: React.FC<CandidateRoleCellProps> = ({ candidate }) => (
  <div className="py-1">
    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
      {candidate.currentRole}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
      {candidate.company} <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> {candidate.location}
    </div>
  </div>
);

interface CandidateExperienceSkillsCellProps {
  candidate: Candidate;
}

const CandidateExperienceSkillsCell: React.FC<CandidateExperienceSkillsCellProps> = ({ candidate }) => (
  <div className="py-1">
    <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">
      {candidate.experienceYears} {candidate.experienceYears === 1 ? "yr exp" : "yrs exp"}
    </div>
    <div className="flex flex-wrap gap-1 mt-1">
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
  </div>
);

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
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors ${
                  candidate.status === st
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

interface CandidateStageCellProps {
  candidate: Candidate;
  isOpen: boolean;
  onToggleMenu: (id: string | null) => void;
  onStageChange?: (candidateId: string, stage: CandidateStage) => void;
}

const CandidateStageCell: React.FC<CandidateStageCellProps> = ({
  candidate,
  isOpen,
  onToggleMenu,
  onStageChange,
}) => (
  <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
    {onStageChange ? (
      <>
        <button
          type="button"
          onClick={() => onToggleMenu(isOpen ? null : `stage-${candidate.id}`)}
          className="inline-flex items-center focus:outline-hidden"
        >
          <Badge
            variant={getStageBadgeVariant(candidate.stage)}
            size="sm"
            rounded
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            {candidate.stage}
            <ChevronDown className="w-3 h-3 ml-1 inline-block opacity-70" />
          </Badge>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-32 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
            {STAGE_OPTIONS.map((sg) => (
              <button
                key={sg}
                onClick={() => {
                  onStageChange(candidate.id, sg);
                  onToggleMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors ${
                  candidate.stage === sg
                    ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{sg}</span>
                {candidate.stage === sg && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </>
    ) : (
      <Badge variant={getStageBadgeVariant(candidate.stage)} size="sm" rounded>
        {candidate.stage}
      </Badge>
    )}
  </div>
);

interface CandidateRatingCellProps {
  candidate: Candidate;
}

const CandidateRatingCell: React.FC<CandidateRatingCellProps> = ({ candidate }) => (
  <div className="flex items-center gap-1 py-1 text-amber-500">
    {Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        className={`w-3.5 h-3.5 ${
          idx < candidate.rating
            ? "fill-amber-400 text-amber-400"
            : "text-slate-300 dark:text-slate-700"
        }`}
      />
    ))}
  </div>
);

interface CandidateActionsCellProps {
  candidate: Candidate;
  onSelectCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onShareCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidateId: string, name: string) => void;
  onDownloadResume?: (candidate: Candidate) => void;
}

const CandidateActionsCell: React.FC<CandidateActionsCellProps> = ({
  candidate,
  onSelectCandidate,
  onEditCandidate,
  onShareCandidate,
  onDeleteCandidate,
  onDownloadResume,
}) => (
  <div
    className="flex items-center justify-end gap-1"
    onClick={(e) => e.stopPropagation()}
  >
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onSelectCandidate(candidate)}
      title="View Candidate Details"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Eye className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onEditCandidate(candidate)}
      title="Edit Candidate"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Edit3 className="w-4 h-4" />
    </Button>

    {onDownloadResume && (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDownloadResume(candidate)}
        title="Download Resume"
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4 text-blue-500" />
      </Button>
    )}

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onShareCandidate(candidate)}
      title="Share Candidate Profile"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onDeleteCandidate(candidate.id, candidate.fullName)}
      title="Delete Candidate"
      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
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
  selectedCandidateIds = [],
  onSelectionChange,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Column search / select filters state (matching JobDetailTable.tsx)
  const [columnFilters, setColumnFilters] = useState({
    fullName: "",
    currentRole: "",
    experienceYears: "",
    stage: "",
    status: "",
    noticePeriod: "",
  });

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

  // Columns definition using reusable ColumnDef with isFilter & filterSectionRender (matching JobDetailTable.tsx)
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
              placeholder="Search name or email..."
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
        width: 250,
        minWidth: 200,
        render: (candidate: Candidate) => (
          <CandidateNameCell candidate={candidate} onSelectCandidate={onSelectCandidate} />
        ),
      },
      {
        id: "currentRole",
        label: "Role & Company",
        key: "currentRole",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Role or Company
            </label>
            <FormField
              type="text"
              placeholder="Search role or company..."
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
        width: 220,
        render: (candidate: Candidate) => <CandidateRoleCell candidate={candidate} />,
      },
      {
        id: "experienceYears",
        label: "Experience & Skills",
        key: "experienceYears",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Experience / Skills
            </label>
            <FormField
              type="text"
              placeholder="Search experience or skills..."
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
        width: 190,
        render: (candidate: Candidate) => <CandidateExperienceSkillsCell candidate={candidate} />,
      },
      {
        id: "stage",
        label: "Pipeline Stage",
        key: "stage",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Pipeline Stage
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Stages", value: "" },
                { label: "New", value: "New" },
                { label: "Screening", value: "Screening" },
                { label: "Interview", value: "Interview" },
                { label: "Offer", value: "Offer" },
                { label: "Hired", value: "Hired" },
                { label: "Rejected", value: "Rejected" },
              ]}
              value={columnFilters.stage || ""}
              onChange={(val: any) => handleColumnFilterChange("stage", typeof val === "string" ? val : (val?.value ?? ""))}
              fieldSize="sm"
            />
            {columnFilters.stage && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("stage")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 140,
        render: (candidate: Candidate) => (
          <CandidateStageCell
            candidate={candidate}
            isOpen={activeDropdownId === `stage-${candidate.id}`}
            onToggleMenu={handleToggleMenu}
            onStageChange={onStageChange}
          />
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
        render: (candidate: Candidate) => (
          <div className="py-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {candidate.noticePeriod}
          </div>
        ),
      },
      {
        id: "rating",
        label: "Rating",
        key: "rating",
        sortable: true,
        width: 120,
        render: (candidate: Candidate) => <CandidateRatingCell candidate={candidate} />,
      },
      {
        id: "actions",
        label: "Actions",
        render: (candidate: Candidate) => (
          <CandidateActionsCell
            candidate={candidate}
            onSelectCandidate={onSelectCandidate}
            onEditCandidate={onEditCandidate}
            onShareCandidate={onShareCandidate}
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
        !c.fullName.toLowerCase().includes(columnFilters.fullName.toLowerCase()) &&
        !c.email.toLowerCase().includes(columnFilters.fullName.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.currentRole &&
        !c.currentRole.toLowerCase().includes(columnFilters.currentRole.toLowerCase()) &&
        !c.company.toLowerCase().includes(columnFilters.currentRole.toLowerCase())
      ) {
        return false;
      }
      if (columnFilters.experienceYears) {
        const query = columnFilters.experienceYears.toLowerCase();
        const matchesExp = String(c.experienceYears).includes(query);
        const matchesSkills = c.skills.some((s) => s.toLowerCase().includes(query));
        if (!matchesExp && !matchesSkills) {
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
        columnFilters.stage &&
        columnFilters.stage !== "All" &&
        !c.stage.toLowerCase().includes(columnFilters.stage.toLowerCase())
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
      return true;
    });
  }, [candidates, columnFilters]);

  // Handle bulk action triggers
  const selectedCount = selectedCandidateIds.length;

  return (
    <div className="flex flex-col w-full">
      {/* ── Selection Action Bar ── */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2.5 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-200 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              {selectedCount} candidate{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onBulkDelete(selectedCandidateIds)}
                className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-semibold rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Selected
              </Button>
            )}
            <button
              onClick={() => onSelectionChange?.([])}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Reusable DataTable ── */}
      <DataTable<Candidate>
        data={filteredCandidates}
        columns={columns}
        isLoading={isLoading}
        selectable={selectable}
        selection={selectedCandidateIds}
        onSelectionChange={onSelectionChange}
        getRowId={(row) => row.id}
        hideToolbar={true}
        pageSize={10}
      />
    </div>
  );
};
