import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  Eye,
  Edit3,
  Trash2,
  ChevronDown,
  CheckCircle2,
  FileText,
  Download,
  Star,
  Sparkles,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import type {
  CandidateApplication,
  ApplicationStage,
  ApplicationStatus,
} from "../types/application.types";

export interface ApplicationDetailTableProps {
  applications: CandidateApplication[];
  onSelectApplication: (app: CandidateApplication) => void;
  onEditApplication: (app: CandidateApplication) => void;
  onDownloadResume?: (app: CandidateApplication) => void;
  onDeleteApplication: (appId: string, name: string) => void;
  onBulkDelete?: (appIds: (string | number)[]) => void;
  onStageChange?: (appId: string, stage: ApplicationStage) => void;
  onStatusChange?: (appId: string, status: ApplicationStatus) => void;
  onResetFilters?: () => void;
  isLoading?: boolean;
  selectable?: boolean;
  selectedAppIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

/* =========================================================
   🔹 HELPER FUNCTIONS & CELL COMPONENTS
========================================================= */

import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

const getStageBadgeVariant = (stage: ApplicationStage): BadgeVariant => {
  switch (stage) {
    case "Sourced":
      return "info";
    case "Screened":
      return "info";
    case "Interviewing":
      return "warning";
    case "Offered":
      return "warning";
    case "Hired":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "default";
  }
};

const getStatusBadgeVariant = (status: ApplicationStatus): BadgeVariant => {
  switch (status) {
    case "Active":
    case "Shortlisted":
      return "success";
    case "In Review":
      return "info";
    case "On Hold":
      return "warning";
    case "Hired":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "default";
  }
};

const STAGE_OPTIONS: ApplicationStage[] = [
  "Sourced",
  "Screened",
  "Interviewing",
  "Offered",
  "Hired",
  "Rejected",
];

const STATUS_OPTIONS: ApplicationStatus[] = [
  "Active",
  "In Review",
  "Shortlisted",
  "On Hold",
  "Hired",
  "Rejected",
];

interface CandidateCellProps {
  app: CandidateApplication;
  onSelectApplication: (app: CandidateApplication) => void;
}

const CandidateCell: React.FC<CandidateCellProps> = ({ app, onSelectApplication }) => {
  const initials = app.candidateName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className="flex items-center gap-3 py-1 cursor-pointer group"
      onClick={() => onSelectApplication(app)}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm break-words whitespace-normal leading-snug">
          {app.candidateName}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {app.candidateEmail}
          </span>
        </div>
      </div>
    </div>
  );
};

interface JobCellProps {
  app: CandidateApplication;
}

const JobCell: React.FC<JobCellProps> = ({ app }) => (
  <div className="py-1">
    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
      {app.jobTitle}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {app.department} <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> {app.location}
    </div>
  </div>
);

interface StageCellProps {
  app: CandidateApplication;
  isOpen: boolean;
  onToggleMenu: (id: string | null) => void;
  onStageChange?: (appId: string, stage: ApplicationStage) => void;
}

const StageCell: React.FC<StageCellProps> = ({
  app,
  isOpen,
  onToggleMenu,
  onStageChange,
}) => (
  <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
    {onStageChange ? (
      <>
        <button
          type="button"
          onClick={() => onToggleMenu(isOpen ? null : `stage-${app.id}`)}
          className="inline-flex items-center focus:outline-hidden"
        >
          <Badge
            variant={getStageBadgeVariant(app.stage)}
            size="sm"
            rounded
            dot
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            {app.stage}
            <ChevronDown className="w-3 h-3 ml-1 inline-block opacity-70" />
          </Badge>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-36 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
            {STAGE_OPTIONS.map((stg) => (
              <button
                key={stg}
                onClick={() => {
                  onStageChange(app.id, stg);
                  onToggleMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors ${
                  app.stage === stg
                    ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{stg}</span>
                {app.stage === stg && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </>
    ) : (
      <Badge variant={getStageBadgeVariant(app.stage)} size="sm" rounded dot>
        {app.stage}
      </Badge>
    )}
  </div>
);

interface MatchScoreCellProps {
  score: number;
}

const MatchScoreCell: React.FC<MatchScoreCellProps> = ({ score }) => {
  let color = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  if (score < 75) {
    color = "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  } else if (score < 65) {
    color = "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800";
  }

  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${color}`}>
        <Sparkles className="w-3 h-3" />
        {score}%
      </span>
    </div>
  );
};

interface ApplicationActionsCellProps {
  app: CandidateApplication;
  onSelectApplication: (app: CandidateApplication) => void;
  onEditApplication: (app: CandidateApplication) => void;
  onDownloadResume?: (app: CandidateApplication) => void;
  onDeleteApplication: (appId: string, name: string) => void;
}

const ApplicationActionsCell: React.FC<ApplicationActionsCellProps> = ({
  app,
  onSelectApplication,
  onEditApplication,
  onDownloadResume,
  onDeleteApplication,
}) => (
  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onSelectApplication(app)}
      title="View Application Details"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Eye className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onEditApplication(app)}
      title="Edit Application"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Edit3 className="w-4 h-4" />
    </Button>

    {onDownloadResume && (
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDownloadResume(app)}
        title="Download Resume"
        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
      </Button>
    )}

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onDeleteApplication(app.id, app.candidateName)}
      title="Delete Application"
      className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

interface ApplicationCardProps {
  app: CandidateApplication;
  isSelected?: boolean;
  selectable?: boolean;
  onSelectApplication: (app: CandidateApplication) => void;
  onEditApplication: (app: CandidateApplication) => void;
  onDeleteApplication: (appId: string, name: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  app,
  isSelected = false,
  selectable = true,
  onSelectApplication,
  onEditApplication,
  onDeleteApplication,
}) => (
  <div
    className={`p-4 bg-white dark:bg-slate-900 border ${
      isSelected
        ? "border-blue-500 ring-1 ring-blue-500/50 dark:border-blue-500"
        : "border-slate-200 dark:border-slate-800"
    } rounded-xl space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        {selectable && (
          <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
            />
          </div>
        )}
        <div className="min-w-0">
          <h4
            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-sm"
            onClick={() => onSelectApplication(app)}
          >
            {app.candidateName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {app.jobTitle} • {app.experienceYears} yrs exp
          </p>
        </div>
      </div>
      <Badge variant={getStageBadgeVariant(app.stage)} size="sm" rounded dot>
        {app.stage}
      </Badge>
    </div>

    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
      <span>Match Score</span>
      <MatchScoreCell score={app.matchScore} />
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Applied {app.appliedDate}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSelectApplication(app)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditApplication(app)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          title="Edit"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDeleteApplication(app.id, app.candidateName)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </div>
);

interface EmptyApplicationsViewProps {
  onResetFilters?: () => void;
}

const EmptyApplicationsView: React.FC<EmptyApplicationsViewProps> = ({ onResetFilters }) => (
  <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3">
      <FileText className="w-7 h-7 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
      No Candidate Applications Found
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
      No applications matched your search criteria, stage, or status filter. Try resetting filters or add a new candidate application.
    </p>
    {onResetFilters && (
      <Button onClick={onResetFilters} variant="outline" size="sm" className="mt-4">
        Clear All Filters
      </Button>
    )}
  </div>
);

/* =========================================================
   🔹 MAIN TABLE COMPONENT
========================================================= */

export const ApplicationDetailTable: React.FC<ApplicationDetailTableProps> = ({
  applications,
  onSelectApplication,
  onEditApplication,
  onDownloadResume,
  onDeleteApplication,
  onBulkDelete,
  onStageChange,
  onStatusChange,
  onResetFilters,
  isLoading = false,
  selectable = true,
  selectedAppIds,
  onSelectionChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [internalSelection, setInternalSelection] = useState<(string | number)[]>(
    selectedAppIds || []
  );

  // Column Filters State
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    candidateName: "",
    jobTitle: "",
    stage: "",
    status: "",
    matchScore: "",
    appliedDate: "",
  });

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

  // Filter applications by column search filters
  const displayApplications = useMemo(() => {
    return applications.filter((app) => {
      if (
        columnFilters.candidateName &&
        !app.candidateName.toLowerCase().includes(columnFilters.candidateName.toLowerCase()) &&
        !app.candidateEmail.toLowerCase().includes(columnFilters.candidateName.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.jobTitle &&
        !app.jobTitle.toLowerCase().includes(columnFilters.jobTitle.toLowerCase()) &&
        !app.department.toLowerCase().includes(columnFilters.jobTitle.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.stage &&
        columnFilters.stage !== "All" &&
        !app.stage.toLowerCase().includes(columnFilters.stage.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.status &&
        columnFilters.status !== "All" &&
        !app.status.toLowerCase().includes(columnFilters.status.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.matchScore &&
        !String(app.matchScore).includes(columnFilters.matchScore)
      ) {
        return false;
      }
      if (
        columnFilters.appliedDate &&
        !app.appliedDate.toLowerCase().includes(columnFilters.appliedDate.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [applications, columnFilters]);

  useEffect(() => {
    if (selectedAppIds !== undefined) {
      setInternalSelection(selectedAppIds);
    }
  }, [selectedAppIds]);

  const activeSelection = selectedAppIds !== undefined ? selectedAppIds : internalSelection;

  const handleSelectionChange = useCallback(
    (newSelection: (string | number)[]) => {
      setInternalSelection(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    },
    [onSelectionChange]
  );

  const handleToggleMenu = useCallback((id: string | null) => {
    setActiveMenuId(id);
  }, []);

  // Close dropdown menu on outside click
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  // Define DataTable columns
  const columns = useMemo<ColumnDef<CandidateApplication>[]>(
    () => [
      {
        id: "candidateName",
        label: "Candidate",
        key: "candidateName",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Candidate
            </label>
            <FormField
              type="text"
              placeholder="Search candidate name or email..."
              value={columnFilters.candidateName || ""}
              onChange={(e: any) => handleColumnFilterChange("candidateName", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.candidateName && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("candidateName")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (app) => <CandidateCell app={app} onSelectApplication={onSelectApplication} />,
      },
      {
        id: "jobTitle",
        label: "Job Opening",
        key: "jobTitle",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Job Title
            </label>
            <FormField
              type="text"
              placeholder="Search job title..."
              value={columnFilters.jobTitle || ""}
              onChange={(e: any) => handleColumnFilterChange("jobTitle", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.jobTitle && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("jobTitle")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (app) => <JobCell app={app} />,
      },
      {
        id: "stage",
        label: "Stage",
        key: "stage",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Stage
            </label>
            <FormField
              type="select"
              value={columnFilters.stage || "All"}
              onChange={(val: any) => handleColumnFilterChange("stage", val === "All" ? "" : val)}
              options={[
                { label: "All Stages", value: "All" },
                ...STAGE_OPTIONS.map((s) => ({ label: s, value: s })),
              ]}
              fieldSize="sm"
            />
          </div>
        ),
        render: (app) => (
          <StageCell
            app={app}
            isOpen={activeMenuId === `stage-${app.id}`}
            onToggleMenu={handleToggleMenu}
            onStageChange={onStageChange}
          />
        ),
      },
      {
        id: "matchScore",
        label: "AI Match Score",
        key: "matchScore",
        sortable: true,
        render: (app) => <MatchScoreCell score={app.matchScore} />,
      },
      {
        id: "appliedDate",
        label: "Applied Date",
        key: "appliedDate",
        sortable: true,
        render: (app) => (
          <div className="py-1">
            <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
              {app.appliedDate}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {app.experienceYears} yrs experience
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        key: "id",
        sortable: false,
        align: "right",
        render: (app) => (
          <ApplicationActionsCell
            app={app}
            onSelectApplication={onSelectApplication}
            onEditApplication={onEditApplication}
            onDownloadResume={onDownloadResume}
            onDeleteApplication={onDeleteApplication}
          />
        ),
      },
    ],
    [
      activeMenuId,
      columnFilters,
      handleClearColumnFilter,
      handleColumnFilterChange,
      handleToggleMenu,
      onDeleteApplication,
      onDownloadResume,
      onEditApplication,
      onSelectApplication,
      onStageChange,
    ]
  );

  return (
    <div className="w-full space-y-3">
      {/* Selection Action Header Toolbar */}
      {activeSelection.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl transition-all shadow-2xs">
          <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
            {activeSelection.length} {activeSelection.length === 1 ? "application" : "applications"} selected
          </span>
          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onBulkDelete(activeSelection)}
                className="text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 font-semibold"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete Selected ({activeSelection.length})
              </Button>
            )}
          </div>
        </div>
      )}

      {displayApplications.length === 0 ? (
        <EmptyApplicationsView onResetFilters={onResetFilters} />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <DataTable<CandidateApplication>
              columns={columns}
              data={displayApplications}
              getRowId={(item) => item.id}
              isLoading={isLoading}
              layout="table"
              hideToolbar={true}
              selectable={selectable}
              selection={activeSelection}
              onSelectionChange={handleSelectionChange}
              pageSize={10}
            />
          </div>
        </>
      )}

      {/* Mobile Card Grid View */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {displayApplications.length > 0 ? (
          displayApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              isSelected={activeSelection.map(String).includes(String(app.id))}
              selectable={selectable}
              onSelectApplication={onSelectApplication}
              onEditApplication={onEditApplication}
              onDeleteApplication={onDeleteApplication}
            />
          ))
        ) : (
          <EmptyApplicationsView onResetFilters={onResetFilters} />
        )}
      </div>
    </div>
  );
};
