import React, { useState, useMemo } from "react";
import { Search, X, Users, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { ApplicationDetailTable } from "./items/ApplicationDetailTable";
import { ApplicationDetailModal } from "./items/ApplicationDetailModal";
import { ApplicationFormModal } from "./items/ApplicationFormModal";
import { ApplicationUploadModal } from "./items/ApplicationUploadModal";
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
    jobTitle: "All",
    department: "All",
  });

  // Modal States
  const [selectedAppIds, setSelectedAppIds] = useState<(string | number)[]>([]);
  const [bulkDeleteAppIds, setBulkDeleteAppIds] = useState<(string | number)[]>([]);
  const [selectedAppDetail, setSelectedAppDetail] = useState<CandidateApplication | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<CandidateApplication | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingAppTarget, setDeletingAppTarget] = useState<{ id: string; name: string } | null>(null);

  // Filtered applications list
  const filteredApplications = useMemo(() => {
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
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = app.candidateName.toLowerCase().includes(query);
        const matchesEmail = app.candidateEmail.toLowerCase().includes(query);
        const matchesJob = app.jobTitle.toLowerCase().includes(query);
        const matchesDept = app.department.toLowerCase().includes(query);
        const matchesCompany = app.currentCompany.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesJob && !matchesDept && !matchesCompany) {
          return false;
        }
      }
      return true;
    });
  }, [applications, filters]);

  // Statistics KPI metrics
  const stats = useMemo(() => {
    const total = applications.length;
    const shortlisted = applications.filter((a) => a.status === "Shortlisted" || a.stage === "Interviewing").length;
    const hired = applications.filter((a) => a.status === "Hired" || a.stage === "Hired").length;
    const avgScore = total > 0 ? Math.round(applications.reduce((acc, curr) => acc + curr.matchScore, 0) / total) : 0;
    return { total, shortlisted, hired, avgScore };
  }, [applications]);

  // Filter Handlers
  const handleFilterChange = (key: keyof ApplicationFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      stage: "All",
      jobTitle: "All",
      department: "All",
    });
  };

  // CRUD & Pipeline Handlers
  const handleSaveApplication = (appData: Partial<CandidateApplication>) => {
    if (appData.id) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appData.id ? ({ ...a, ...appData } as CandidateApplication) : a))
      );
      toast.success(`Application for "${appData.candidateName}" updated successfully!`);
    } else {
      const newApp: CandidateApplication = {
        id: `APP-${Date.now().toString().slice(-4)}`,
        candidateName: appData.candidateName || "New Candidate",
        candidateEmail: appData.candidateEmail || "candidate@example.com",
        candidatePhone: appData.candidatePhone || "+91 90000 00000",
        jobId: appData.jobId || "JOB-1001",
        jobTitle: appData.jobTitle || "Senior Mechanical Engineer",
        department: appData.department || "Engineering",
        location: appData.location || "Pune, India",
        stage: appData.stage || "Sourced",
        status: appData.status || "Active",
        appliedDate: new Date().toISOString().split("T")[0],
        experienceYears: appData.experienceYears || 4,
        matchScore: appData.matchScore || 85,
        currentCompany: appData.currentCompany || "N/A",
        currentRole: appData.currentRole || "Engineer",
        expectedSalary: appData.expectedSalary || "Competitive",
        noticePeriod: appData.noticePeriod || "30 Days",
        rating: 4,
        resumeFileName: `${appData.candidateName?.replace(/\s+/g, "_")}_Resume.pdf`,
        summary: appData.summary || "",
        skills: ["Engineering", "Problem Solving", "CAD"],
        tags: ["New Application"],
        notes: [],
      };
      setApplications((prev) => [newApp, ...prev]);
      toast.success(`Application for "${newApp.candidateName}" submitted successfully!`);
    }
  };

  const handleImportApplications = (imported: CandidateApplication[]) => {
    setApplications((prev) => [...imported, ...prev]);
    toast.success(`Successfully imported ${imported.length} candidate application(s)!`);
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
      title="Candidate Applications"
      subtitle="Track candidate submissions, AI match scores, interview stages, and hiring decisions."
      breadcrumbs={[{ label: "Recruitment" }, { label: "Applications" }]}
      actions={
        <div className="flex items-center gap-2">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search candidate, email, job..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-2xs"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange("search", "")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      }
    >
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
              Shortlisted & Interviewing
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
              Hired Candidates
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.hired}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg AI Match Score
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

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <ApplicationDetailTable
          applications={filteredApplications}
          selectedAppIds={selectedAppIds}
          onSelectionChange={setSelectedAppIds}
          onSelectApplication={setSelectedAppDetail}
          onEditApplication={(app) => {
            setEditingApp(app);
            setIsFormModalOpen(true);
          }}
          onDownloadResume={handleDownloadResume}
          onDeleteApplication={handleDeleteRequest}
          onBulkDelete={handleBulkDeleteRequest}
          onStageChange={handleStageChange}
          onStatusChange={handleStatusChange}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Detail Modal */}
      <ApplicationDetailModal
        isOpen={!!selectedAppDetail}
        onClose={() => setSelectedAppDetail(null)}
        application={selectedAppDetail}
        onEditApplication={(app) => {
          setEditingApp(app);
          setIsFormModalOpen(true);
        }}
        onStageChange={handleStageChange}
        onStatusChange={handleStatusChange}
        onDownloadResume={handleDownloadResume}
      />

      {/* Create / Edit Modal */}
      <ApplicationFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingApp(null);
        }}
        onSaveApplication={handleSaveApplication}
        editingApplication={editingApp}
      />

      {/* Upload File Modal */}
      <ApplicationUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportApplications={handleImportApplications}
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
