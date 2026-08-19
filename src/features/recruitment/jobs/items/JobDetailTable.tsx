import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  Eye,
  Edit3,
  Share2,
  Trash2,
  Briefcase,
  ChevronDown,
  CheckCircle2,
  X,
} from "lucide-react";
import type { JobPosting, JobStatus } from "../types/jobs.types";

export interface JobDetailTableProps {
  jobs: JobPosting[];
  onSelectJob: (job: JobPosting) => void;
  onEditJob: (job: JobPosting) => void;
  onDuplicateJob?: (job: JobPosting) => void;
  onShareJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string, title: string) => void;
  onBulkDelete?: (jobIds: (string | number)[]) => void;
  onStatusChange?: (jobId: string, status: JobStatus) => void;
  onResetFilters?: () => void;
  isLoading?: boolean;
  selectable?: boolean;
  selectedJobIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
}

/* =========================================================
   🔹 HELPER FUNCTIONS & CELL COMPONENTS (OUTSIDE RENDER)
========================================================= */

const getStatusBadgeVariant = (status: JobStatus) => {
  switch (status) {
    case "Open":
      return "success";
    case "On Hold":
      return "warning";
    case "Closed":
      return "danger";
    case "Draft":
    default:
      return "info";
  }
};

interface JobTitleCellProps {
  job: JobPosting;
  onSelectJob: (job: JobPosting) => void;
}

const JobTitleCell: React.FC<JobTitleCellProps> = ({ job, onSelectJob }) => (
  <div
    className="cursor-pointer group py-1"
    onClick={() => onSelectJob(job)}
  >
    <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm break-words whitespace-normal leading-snug">
      {job.title}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal break-words whitespace-normal">
      {job.department} <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> {job.experienceLevel}
    </div>
  </div>
);

interface JobLocationCellProps {
  job: JobPosting;
}

const JobLocationCell: React.FC<JobLocationCellProps> = ({ job }) => (
  <div className="py-1">
    <div className="text-sm text-slate-800 dark:text-slate-200 font-medium break-words whitespace-normal">
      {job.location}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words whitespace-normal">
      {job.employmentType}
    </div>
  </div>
);

interface JobStatusCellProps {
  job: JobPosting;
  isOpen: boolean;
  onToggleMenu: (id: string | null) => void;
  onStatusChange?: (jobId: string, status: JobStatus) => void;
}

const STATUS_OPTIONS: JobStatus[] = ["Open", "On Hold", "Closed", "Draft"];

const JobStatusCell: React.FC<JobStatusCellProps> = ({
  job,
  isOpen,
  onToggleMenu,
  onStatusChange,
}) => (
  <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
    {onStatusChange ? (
      <>
        <button
          type="button"
          onClick={() => onToggleMenu(isOpen ? null : `status-${job.id}`)}
          className="inline-flex items-center focus:outline-none"
        >
          <Badge
            variant={getStatusBadgeVariant(job.status)}
            size="sm"
            rounded
            dot
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            {job.status}
            <ChevronDown className="w-3 h-3 ml-1 inline-block opacity-70" />
          </Badge>
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-32 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
            {STATUS_OPTIONS.map((st) => (
              <button
                key={st}
                onClick={() => {
                  onStatusChange(job.id, st);
                  onToggleMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center justify-between transition-colors ${job.status === st
                  ? "font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "text-slate-700 dark:text-slate-300"
                  }`}
              >
                <span>{st}</span>
                {job.status === st && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </>
    ) : (
      <Badge
        variant={getStatusBadgeVariant(job.status)}
        size="sm"
        rounded
        dot
      >
        {job.status}
      </Badge>
    )}
  </div>
);

interface JobApplicationsCellProps {
  job: JobPosting;
}

const JobApplicationsCell: React.FC<JobApplicationsCellProps> = ({ job }) => (
  <div className="py-1">
    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
      {job.applicationsCount}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400">
      {job.applicationsCount === 1 ? "applicant" : "applicants"}
    </div>
  </div>
);

interface JobPostedDateCellProps {
  job: JobPosting;
}

const JobPostedDateCell: React.FC<JobPostedDateCellProps> = ({ job }) => (
  <div className="py-1">
    <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
      {job.postedDate}
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {job.daysOpen} {job.daysOpen === 1 ? "day active" : "days active"}
    </div>
  </div>
);

interface JobHiringManagerCellProps {
  job: JobPosting;
}

const JobHiringManagerCell: React.FC<JobHiringManagerCellProps> = ({ job }) => (
  <div className="flex items-center gap-2.5 py-1">
    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
      {job.hiringManager.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words whitespace-normal leading-tight">
        {job.hiringManager.name}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 break-words whitespace-normal leading-tight mt-0.5">
        {job.hiringManager.role}
      </p>
    </div>
  </div>
);

interface JobActionsCellProps {
  job: JobPosting;
  onSelectJob: (job: JobPosting) => void;
  onEditJob: (job: JobPosting) => void;
  onShareJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string, title: string) => void;
}

const JobActionsCell: React.FC<JobActionsCellProps> = ({
  job,
  onSelectJob,
  onEditJob,
  onShareJob,
  onDeleteJob,
}) => (
  <div
    className="flex items-center justify-end gap-1"
    onClick={(e) => e.stopPropagation()}
  >
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onSelectJob(job)}
      title="View Details"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Eye className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onEditJob(job)}
      title="Edit Job"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Edit3 className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onShareJob(job)}
      title="Share Job Link"
      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
    </Button>

    <Button
      size="sm"
      variant="ghost"
      onClick={() => onDeleteJob(job.id, job.title)}
      title="Delete Job"
      className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  </div>
);

interface JobCardProps {
  job: JobPosting;
  isSelected?: boolean;
  selectable?: boolean;
  onSelectJob: (job: JobPosting) => void;
  onEditJob: (job: JobPosting) => void;
  onShareJob: (job: JobPosting) => void;
  onDeleteJob: (jobId: string, title: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected = false,
  selectable = true,
  onSelectJob,
  onEditJob,
  onShareJob,
  onDeleteJob,
}) => (
  <div
    className={`p-4 bg-white dark:bg-slate-900 border ${isSelected
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
            onClick={() => onSelectJob(job)}
          >
            {job.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {job.department} • {job.experienceLevel}
          </p>
        </div>
      </div>
      <Badge
        variant={getStatusBadgeVariant(job.status)}
        size="sm"
        rounded
        dot
      >
        {job.status}
      </Badge>
    </div>

    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
      <span>{job.location} ({job.employmentType})</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{job.applicationsCount} applicants</span>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Posted {job.postedDate}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSelectJob(job)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditJob(job)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          title="Edit"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onShareJob(job)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          title="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDeleteJob(job.id, job.title)}
          className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </div>
);

interface EmptyJobsViewProps {
  onResetFilters?: () => void;
}

const EmptyJobsView: React.FC<EmptyJobsViewProps> = ({ onResetFilters }) => (
  <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-3">
      <Briefcase className="w-7 h-7 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
      No Job Openings Found
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
      No job postings matched your search criteria or active status filter.
      Try resetting filters or post a new job.
    </p>
    {onResetFilters && (
      <Button
        onClick={onResetFilters}
        variant="outline"
        size="sm"
        className="mt-4"
      >
        Clear All Filters
      </Button>
    )}
  </div>
);

/* =========================================================
   🔹 MAIN COMPONENT
========================================================= */

export const JobDetailTable: React.FC<JobDetailTableProps> = ({
  jobs,
  onSelectJob,
  onEditJob,
  onDuplicateJob,
  onShareJob,
  onDeleteJob,
  onBulkDelete,
  onStatusChange,
  onResetFilters,
  isLoading = false,
  selectable = true,
  selectedJobIds,
  onSelectionChange,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [internalSelection, setInternalSelection] = useState<(string | number)[]>(
    selectedJobIds || []
  );

  // Column Filters State
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    title: "",
    location: "",
    status: "",
    applicationsCount: "",
    postedDate: "",
    hiringManager: "",
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

  const handleResetAllFilters = useCallback(() => {
    setColumnFilters({
      title: "",
      location: "",
      status: "",
      applicationsCount: "",
      postedDate: "",
      hiringManager: "",
    });
    if (onResetFilters) {
      onResetFilters();
    }
  }, [onResetFilters]);

  // Filter jobs by column search filters
  const displayJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (
        columnFilters.title &&
        !job.title.toLowerCase().includes(columnFilters.title.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.location &&
        !job.location.toLowerCase().includes(columnFilters.location.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.status &&
        columnFilters.status !== "All" &&
        !job.status.toLowerCase().includes(columnFilters.status.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.applicationsCount &&
        !String(job.applicationsCount).includes(columnFilters.applicationsCount)
      ) {
        return false;
      }
      if (
        columnFilters.postedDate &&
        !job.postedDate.toLowerCase().includes(columnFilters.postedDate.toLowerCase())
      ) {
        return false;
      }
      if (columnFilters.hiringManager) {
        const query = columnFilters.hiringManager.toLowerCase();
        const matchesName = job.hiringManager.name.toLowerCase().includes(query);
        const matchesRole = job.hiringManager.role.toLowerCase().includes(query);
        if (!matchesName && !matchesRole) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, columnFilters]);

  useEffect(() => {
    if (selectedJobIds !== undefined) {
      setInternalSelection(selectedJobIds);
    }
  }, [selectedJobIds]);

  const activeSelection = selectedJobIds !== undefined ? selectedJobIds : internalSelection;

  const singleSelectedJob = useMemo(() => {
    if (activeSelection.length === 1) {
      return displayJobs.find((j) => String(j.id) === String(activeSelection[0])) || null;
    }
    return null;
  }, [displayJobs, activeSelection]);

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

  // Define DataTable columns with FormField search filters
  const columns = useMemo<ColumnDef<JobPosting>[]>(
    () => [
      {
        id: "title",
        label: "Job Title",
        key: "title",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Job Title
            </label>
            <FormField
              type="text"
              placeholder="Search title..."
              value={columnFilters.title || ""}
              onChange={(e: any) => handleColumnFilterChange("title", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.title && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("title")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (job) => (
          <JobTitleCell job={job} onSelectJob={onSelectJob} />
        ),
      },
      {
        id: "location",
        label: "Location",
        key: "location",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Location
            </label>
            <FormField
              type="text"
              placeholder="Search location..."
              value={columnFilters.location || ""}
              onChange={(e: any) => handleColumnFilterChange("location", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.location && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("location")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (job) => <JobLocationCell job={job} />,
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
                { label: "Open", value: "Open" },
                { label: "On Hold", value: "On Hold" },
                { label: "Closed", value: "Closed" },
                { label: "Draft", value: "Draft" },
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
        render: (job) => (
          <JobStatusCell
            job={job}
            isOpen={activeMenuId === `status-${job.id}`}
            onToggleMenu={handleToggleMenu}
            onStatusChange={onStatusChange}
          />
        ),
      },
      {
        id: "applicationsCount",
        label: "Applicants",
        key: "applicationsCount",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Applicants
            </label>
            <FormField
              type="text"
              placeholder="Search count..."
              value={columnFilters.applicationsCount || ""}
              onChange={(e: any) => handleColumnFilterChange("applicationsCount", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.applicationsCount && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("applicationsCount")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (job) => <JobApplicationsCell job={job} />,
      },
      {
        id: "postedDate",
        label: "Posted Date",
        key: "postedDate",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Posted Date
            </label>
            <FormField
              type="text"
              placeholder="Search posted date..."
              value={columnFilters.postedDate || ""}
              onChange={(e: any) => handleColumnFilterChange("postedDate", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.postedDate && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("postedDate")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (job) => <JobPostedDateCell job={job} />,
      },
      {
        id: "hiringManager",
        label: "Hiring Manager",
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Hiring Manager
            </label>
            <FormField
              type="text"
              placeholder="Search manager..."
              value={columnFilters.hiringManager || ""}
              onChange={(e: any) => handleColumnFilterChange("hiringManager", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.hiringManager && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("hiringManager")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (job) => <JobHiringManagerCell job={job} />,
      },
      {
        id: "actions",
        label: "Actions",
        align: "center",
        render: (job) => (
          <JobActionsCell
            job={job}
            onSelectJob={onSelectJob}
            onEditJob={onEditJob}
            onShareJob={onShareJob}
            onDeleteJob={onDeleteJob}
          />
        ),
      },
    ],
    [
      onSelectJob,
      onEditJob,
      onShareJob,
      onDeleteJob,
      onStatusChange,
      activeMenuId,
      handleToggleMenu,
      columnFilters,
      handleColumnFilterChange,
      handleClearColumnFilter,
    ]
  );

  const renderCard = useCallback(
    (job: JobPosting) => (
      <JobCard
        job={job}
        selectable={selectable}
        isSelected={activeSelection.some((id) => String(id) === String(job.id))}
        onSelectJob={onSelectJob}
        onEditJob={onEditJob}
        onShareJob={onShareJob}
        onDeleteJob={onDeleteJob}
      />
    ),
    [selectable, activeSelection, onSelectJob, onEditJob, onShareJob, onDeleteJob]
  );

  const getRowId = useCallback((job: JobPosting) => job.id, []);

  if (displayJobs.length === 0 && !isLoading) {
    return <EmptyJobsView onResetFilters={handleResetAllFilters} />;
  }

  return (
    <div className="w-full">
      {/* ── Selection Action Bar ────────────────────────────────────────── */}
      {activeSelection.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800/60 transition-all">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
              {activeSelection.length}
            </span>
            <span>
              {activeSelection.length === 1
                ? `1 job selected${singleSelectedJob ? `: ${singleSelectedJob.title}` : ""}`
                : `${activeSelection.length} jobs selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Single Select: Edit & Delete buttons */}
            {activeSelection.length === 1 && singleSelectedJob && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditJob(singleSelectedJob)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  className="h-8 text-xs font-medium bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Edit Job
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDeleteJob(singleSelectedJob.id, singleSelectedJob.title)}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  className="h-8 text-xs font-medium shadow-xs"
                >
                  Delete Job
                </Button>
              </>
            )}

            {/* Multi Select: Bulk Delete button */}
            {activeSelection.length > 1 && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onBulkDelete?.(activeSelection)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="h-8 text-xs font-medium shadow-xs"
              >
                Bulk Delete ({activeSelection.length})
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

      <DataTable<JobPosting>
        data={displayJobs}
        columns={columns}
        getRowId={getRowId}
        isLoading={isLoading}
        layout="table"
        hideToolbar={true}
        pageSize={10}
        selectable={selectable}
        selection={activeSelection}
        onSelectionChange={handleSelectionChange}
        renderCard={renderCard}
      />
    </div>
  );
};

