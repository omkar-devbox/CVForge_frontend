import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Users,
  FileText,
  CheckCircle2,
  Sparkles,
  Briefcase,
  UserCheck,
  Filter,
} from "lucide-react";
import { FormField } from "@/shared/ui";
import { Page } from "@/shared/pages/Page/Page";
import { ApplicationDetailTable } from "./items/ApplicationDetailTable";
import { ApplicationDetailModal } from "./items/ApplicationDetailModal";
import { ApplicationDeleteModal } from "./items/ApplicationDeleteModal";
import { INITIAL_APPLICATIONS } from "./data/mockApplicationsData";
import { toast } from "@/shared/ui/toast";
import type {
  CandidateApplication,
  ApplicationFilterState,
  ApplicationStage,
  ApplicationStatus,
} from "./types/application.types";

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>(INITIAL_APPLICATIONS);
  const [filters, setFilters] = useState<ApplicationFilterState>({
    search: "",
    status: "All",
    stage: "All",
    jobTitle: "",
    department: "All",
    matchTier: "all",
  });

  // Modal States
  const [selectedAppIds, setSelectedAppIds] = useState<(string | number)[]>([]);
  const [bulkDeleteAppIds, setBulkDeleteAppIds] = useState<(string | number)[]>([]);
  const [selectedAppDetail, setSelectedAppDetail] = useState<CandidateApplication | null>(null);
  const [deletingAppTarget, setDeletingAppTarget] = useState<{ id: string; name: string } | null>(null);

  // Available Job Openings for the Dropdown filter
  const jobOptions = useMemo(() => {
    const jobCountMap = new Map<string, number>();
    applications.forEach((app) => {
      jobCountMap.set(app.jobTitle, (jobCountMap.get(app.jobTitle) || 0) + 1);
    });

    return Array.from(jobCountMap.entries()).map(([title, count]) => ({
      title,
      count,
    }));
  }, [applications]);

  const jobSelectOptions = useMemo(
    () => [
      { label: `All Job Openings (${applications.length})`, value: "All" },
      ...jobOptions.map((job) => ({
        label: `${job.title} (${job.count})`,
        value: job.title,
      })),
    ],
    [applications.length, jobOptions]
  );

  // Filtered applications list (empty by default if no job is selected)
  const filteredApplications = useMemo(() => {
    if (!filters.jobTitle) {
      return [];
    }

    return applications.filter((app) => {
      if (filters.status !== "All" && app.status !== filters.status) {
        return false;
      }
      if (filters.stage !== "All" && app.stage !== filters.stage) {
        return false;
      }
      if (filters.department !== "All" && app.department !== filters.department) {
        return false;
      }
      if (filters.jobTitle !== "All" && app.jobTitle !== filters.jobTitle) {
        return false;
      }
      if (filters.matchTier === "high" && app.matchScore < 90) {
        return false;
      }
      if (filters.matchTier === "eligible" && app.matchScore < 80) {
        return false;
      }
      if (filters.matchTier === "review" && app.matchScore >= 80) {
        return false;
      }
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = app.candidateName.toLowerCase().includes(query);
        const matchesEmail = app.candidateEmail.toLowerCase().includes(query);
        const matchesJob = app.jobTitle.toLowerCase().includes(query);
        const matchesDept = app.department.toLowerCase().includes(query);
        const matchesCompany = app.currentCompany.toLowerCase().includes(query);
        const matchesBrief = app.briefInfo?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesEmail && !matchesJob && !matchesDept && !matchesCompany && !matchesBrief) {
          return false;
        }
      }
      return true;
    });
  }, [applications, filters]);

  // Statistics KPI metrics (dynamically calculated for the active filtered set)
  const stats = useMemo(() => {
    if (!filters.jobTitle) {
      return { total: 0, eligible: 0, shortlisted: 0, avgScore: 0 };
    }
    const baseList = filters.jobTitle === "All" && !filters.search ? applications : filteredApplications;
    const total = baseList.length;
    const eligible = baseList.filter((a) => a.matchScore >= 80 || a.eligibilityStatus === "Highly Qualified" || a.eligibilityStatus === "Eligible").length;
    const shortlisted = baseList.filter((a) => a.status === "Shortlisted" || a.stage === "Interviewing").length;
    const avgScore = total > 0 ? Math.round(baseList.reduce((acc, curr) => acc + curr.matchScore, 0) / total) : 0;
    return { total, eligible, shortlisted, avgScore };
  }, [applications, filteredApplications, filters.jobTitle, filters.search]);

  // Filter Handlers
  const handleFilterChange = (key: keyof ApplicationFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      stage: "All",
      jobTitle: "",
      department: "All",
      matchTier: "all",
    });
  };

  const handleStageChange = (appId: string, newStage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
    );
    if (selectedAppDetail?.id === appId) {
      setSelectedAppDetail((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
    toast.success(`Candidate stage moved to ${newStage}`);
  };

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    if (selectedAppDetail?.id === appId) {
      setSelectedAppDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Application status updated to ${newStatus}`);
  };

  const handleDownloadResume = (app: CandidateApplication) => {
    toast.info(`Downloading resume: ${app.resumeFileName || `${app.candidateName}_Resume.pdf`}`);
  };

  const handleDeleteRequest = (appId: string, name: string) => {
    setDeletingAppTarget({ id: appId, name });
  };

  const handleConfirmDelete = (appId: string, name: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    setSelectedAppIds((prev) => prev.filter((id) => String(id) !== String(appId)));
    toast.info(`Deleted application for "${name}".`);
    setDeletingAppTarget(null);
  };

  const handleBulkDeleteRequest = (appIds: (string | number)[]) => {
    setBulkDeleteAppIds(appIds);
  };

  const handleConfirmBulkDelete = () => {
    if (bulkDeleteAppIds.length === 0) return;
    const idsSet = new Set(bulkDeleteAppIds.map(String));
    setApplications((prev) => prev.filter((a) => !idsSet.has(String(a.id))));
    toast.info(`Successfully deleted ${bulkDeleteAppIds.length} candidate application(s).`);
    setBulkDeleteAppIds([]);
    setSelectedAppIds([]);
  };

  return (
    <Page
      title={
        filters.jobTitle && filters.jobTitle !== "All"
          ? `${filters.jobTitle} Candidates`
          : "Candidate Applications"
      }
      subtitle={
        filters.jobTitle && filters.jobTitle !== "All"
          ? `Review eligible candidates, AI resume match percentages, and evaluation briefs for ${filters.jobTitle}.`
          : "Select a job opening to inspect candidate qualifications, AI resume match scores, and eligibility details."
      }
      breadcrumbs={[{ label: "Recruitment" }, { label: "Applications" }]}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 🔹 Job Selection Dropdown using FormField */}
          <div className="w-64 md:w-80">
            <FormField
              type="select"
              value={filters.jobTitle}
              onChange={(val: any) =>
                handleFilterChange(
                  "jobTitle",
                  typeof val === "string" ? val : val?.target?.value || ""
                )
              }
              options={jobSelectOptions}
              fieldSize="sm"
              placeholder="Select Job Opening..."
              isClearable={true}
              isSearchable={true}
              fullWidth
            />
          </div>

          {/* Search input using FormField */}
          <div className="w-56 md:w-72">
            <FormField
              type="text"
              value={filters.search}
              onChange={(e: any) =>
                handleFilterChange(
                  "search",
                  e?.target?.value !== undefined ? e.target.value : typeof e === "string" ? e : ""
                )
              }
              placeholder="Search candidate, skills..."
              fieldSize="sm"
              prefixIcon={<Search className="w-4 h-4 text-slate-400" />}
              suffixIcon={
                filters.search ? (
                  <button
                    type="button"
                    onClick={() => handleFilterChange("search", "")}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
              fullWidth
              disabled={!filters.jobTitle}
            />
          </div>
        </div>
      }
    >
      {!filters.jobTitle ? (
        /* Empty Prompt State when no Job is selected by default */
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900 shadow-xs">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Select a Job Opening to View Candidates
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md leading-relaxed">
            Please choose a job opening from the dropdown above to inspect eligible candidates, detailed AI resume match percentages, and profile briefs.
          </p>
        </div>
      ) : (
        <>
          {/* Active Job Filter Indicator Banner */}
          {filters.jobTitle !== "All" && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 mb-5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-900/60 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span>Active Job Opening:</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shadow-2xs">
                  {filters.jobTitle}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  ({filteredApplications.length} {filteredApplications.length === 1 ? "candidate" : "candidates"} listed)
                </span>
              </div>
              <button
                onClick={() => handleFilterChange("jobTitle", "")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Selection
              </button>
            </div>
          )}

          {/* Metric Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Applications
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.total}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Eligible Candidates (80%+)
                </p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.eligible}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Shortlisted / Interviewing
                </p>
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {stats.shortlisted}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Avg AI Resume Match
                </p>
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {stats.avgScore}%
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Eligibility / Match Score Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter by Match:
            </span>
            {[
              { id: "all", label: "All Applicants" },
              { id: "high", label: "Top Matches (90%+)" },
              { id: "eligible", label: "Eligible (80%+)" },
              { id: "review", label: "Under Review (<80%)" },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => handleFilterChange("matchTier", tier.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  (filters.matchTier || "all") === tier.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Main Table Content */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <ApplicationDetailTable
              applications={filteredApplications}
              selectedAppIds={selectedAppIds}
              onSelectionChange={setSelectedAppIds}
              onSelectApplication={setSelectedAppDetail}
              onDownloadResume={handleDownloadResume}
              onDeleteApplication={handleDeleteRequest}
              onBulkDelete={handleBulkDeleteRequest}
              onStageChange={handleStageChange}
              onStatusChange={handleStatusChange}
              onResetFilters={handleResetFilters}
            />
          </div>
        </>
      )}

      {/* In-Depth Candidate & Resume Match Detail Modal */}
      <ApplicationDetailModal
        isOpen={!!selectedAppDetail}
        onClose={() => setSelectedAppDetail(null)}
        application={selectedAppDetail}
        onStageChange={handleStageChange}
        onStatusChange={handleStatusChange}
        onDownloadResume={handleDownloadResume}
      />

      {/* Single Application Delete Modal */}
      <ApplicationDeleteModal
        isOpen={!!deletingAppTarget}
        onClose={() => setDeletingAppTarget(null)}
        appId={deletingAppTarget?.id || null}
        candidateName={deletingAppTarget?.name || null}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Bulk Delete Modal */}
      <ApplicationDeleteModal
        isOpen={bulkDeleteAppIds.length > 0}
        onClose={() => setBulkDeleteAppIds([])}
        selectedCount={bulkDeleteAppIds.length}
        onConfirmBulkDelete={handleConfirmBulkDelete}
      />
    </Page>
  );
};

export default ApplicationsPage;
