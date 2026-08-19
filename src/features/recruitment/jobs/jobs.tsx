import React, { useState, useMemo } from "react";
import { Plus, Upload, Search, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { JobDetailTable } from "./items/JobDetailTable";
import { JobDetailModal } from "./items/JobDetailModal";
import { JobFormModal } from "./items/JobFormModal";
import { JobUploadModal } from "./items/JobUploadModal";
import { JobDeleteModal } from "./items/JobDeleteModal";
import { INITIAL_JOBS } from "./data/mockJobsData";
import { toast } from "@/shared/ui/toast";
import type { JobPosting, JobFilterState, JobStatus } from "./types/jobs.types";

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOBS);
  const [filters, setFilters] = useState<JobFilterState>({
    search: "",
    status: "All",
    department: "All",
    location: "All",
    employmentType: "All",
  });

  // Selection & Modal states
  const [selectedJobIds, setSelectedJobIds] = useState<(string | number)[]>([]);
  const [bulkDeleteJobIds, setBulkDeleteJobIds] = useState<(string | number)[]>([]);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobPosting | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingJobTarget, setDeletingJobTarget] = useState<{ id: string; title: string } | null>(null);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status filter
      if (filters.status !== "All" && job.status !== filters.status) {
        return false;
      }
      // Department filter
      if (filters.department !== "All" && job.department !== filters.department) {
        return false;
      }
      // Location filter
      if (filters.location !== "All" && job.location !== filters.location) {
        return false;
      }
      // Employment type filter
      if (filters.employmentType !== "All" && job.employmentType !== filters.employmentType) {
        return false;
      }
      // Search query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesDept = job.department.toLowerCase().includes(query);
        const matchesLoc = job.location.toLowerCase().includes(query);
        const matchesManager = job.hiringManager.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDept && !matchesLoc && !matchesManager) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, filters]);

  // Filter Handlers
  const handleFilterChange = (key: keyof JobFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      department: "All",
      location: "All",
      employmentType: "All",
    });
  };

  // CRUD Handlers
  const handleSaveJob = (jobData: Partial<JobPosting>) => {
    if (jobData.id) {
      // Update existing
      setJobs((prev) =>
        prev.map((j) => (j.id === jobData.id ? ({ ...j, ...jobData } as JobPosting) : j))
      );
      toast.success(`Job "${jobData.title}" updated successfully!`);
    } else {
      // Create new
      const newJob: JobPosting = {
        id: `JOB-${Date.now().toString().slice(-4)}`,
        title: jobData.title || "New Job Opening",
        department: jobData.department || "Engineering",
        location: jobData.location || "Remote",
        employmentType: jobData.employmentType || "Full-time",
        experienceLevel: jobData.experienceLevel || "Senior",
        salaryRange: jobData.salaryRange || "Competitive",
        status: jobData.status || "Open",
        applicationsCount: 0,
        postedDate: new Date().toISOString().split("T")[0],
        daysOpen: 1,
        hiringManager: jobData.hiringManager || {
          id: `HM-${Date.now()}`,
          name: "Aniket Sharma",
          role: "Hiring Manager",
          email: "aniket.sharma@systemmechatronics.com",
        },
        teamMembers: [
          jobData.hiringManager || {
            id: `HM-${Date.now()}`,
            name: "Aniket Sharma",
            role: "Hiring Manager",
            email: "aniket.sharma@systemmechatronics.com",
          },
        ],
        description: jobData.description || "",
        requirements: jobData.requirements || [],
        benefits: jobData.benefits || [],
        channels: [
          { id: "c1", name: "LinkedIn Jobs", iconName: "Linkedin", status: "Published", publishedDate: new Date().toISOString().split("T")[0] },
          { id: "c2", name: "Naukri.com", iconName: "Briefcase", status: "Published", publishedDate: new Date().toISOString().split("T")[0] },
          { id: "c3", name: "Company Career Page", iconName: "Globe", status: "Published", publishedDate: new Date().toISOString().split("T")[0] },
        ],
        pipelineStages: [
          { id: "s1", name: "Sourced", count: 0, color: "bg-blue-500" },
          { id: "s2", name: "Screened", count: 0, color: "bg-indigo-500" },
          { id: "s3", name: "Interviewing", count: 0, color: "bg-purple-500" },
          { id: "s4", name: "Offered", count: 0, color: "bg-amber-500" },
          { id: "s5", name: "Hired", count: 0, color: "bg-emerald-500" },
        ],
      };
      setJobs((prev) => [newJob, ...prev]);
      toast.success(`Job Opening "${newJob.title}" posted successfully!`);
    }
  };

  const handleImportJobs = (importedJobs: JobPosting[]) => {
    setJobs((prev) => [...importedJobs, ...prev]);
    toast.success(`Successfully imported ${importedJobs.length} job opening(s)!`);
  };

  const handleDuplicateJob = (job: JobPosting) => {
    const dup: JobPosting = {
      ...job,
      id: `JOB-${Date.now().toString().slice(-4)}`,
      title: `${job.title} (Copy)`,
      status: "Draft",
      applicationsCount: 0,
      postedDate: new Date().toISOString().split("T")[0],
      daysOpen: 0,
    };
    setJobs((prev) => [dup, ...prev]);
    toast.success(`Duplicated job as "${dup.title}" in Draft mode.`);
  };

  const handleShareJob = (job: JobPosting) => {
    const shareUrl = `${window.location.origin}/recruitment/jobs?id=${job.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Job posting link copied to clipboard!");
    } else {
      toast.info(`Job Link: ${shareUrl}`);
    }
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    if (selectedJobDetail?.id === jobId) {
      setSelectedJobDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Job status changed to ${newStatus}`);
  };

  const handleDeleteJobRequest = (jobId: string, title: string) => {
    setDeletingJobTarget({ id: jobId, title });
  };

  const handleConfirmDeleteJob = (jobId: string, title: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSelectedJobIds((prev) => prev.filter((id) => String(id) !== String(jobId)));
    toast.info(`Deleted job opening "${title}".`);
    setDeletingJobTarget(null);
  };

  const handleBulkDeleteRequest = (jobIds: (string | number)[]) => {
    setBulkDeleteJobIds(jobIds);
  };

  const handleConfirmBulkDelete = () => {
    if (bulkDeleteJobIds.length === 0) return;
    const idsSet = new Set(bulkDeleteJobIds.map(String));
    setJobs((prev) => prev.filter((j) => !idsSet.has(String(j.id))));
    toast.info(`Successfully deleted ${bulkDeleteJobIds.length} selected job opening(s).`);
    setBulkDeleteJobIds([]);
    setSelectedJobIds([]);
  };

  const hasActiveFilters = filters.search !== "";

  return (
    <Page
      title="Job Openings"
      subtitle="Manage your recruitment pipeline, publish job openings, and track candidate flows."
      breadcrumbs={[{ label: "Applications" }]}
      actions={
        <div className="flex items-center gap-2">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search jobs..."
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
          <Button
            onClick={() => {
              setEditingJob(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs shrink-0 rounded-lg px-4"
          >
            Post New Job
          </Button>

          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            leftIcon={<Upload className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium shrink-0 rounded-lg shadow-2xs"
            title="Upload Job File (JSON / CSV)"
          >
            Upload File
          </Button>
        </div>
      }
    >

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <JobDetailTable
          jobs={filteredJobs}
          selectedJobIds={selectedJobIds}
          onSelectionChange={setSelectedJobIds}
          onSelectJob={setSelectedJobDetail}
          onEditJob={(job) => {
            setEditingJob(job);
            setIsFormModalOpen(true);
          }}
          onDuplicateJob={handleDuplicateJob}
          onShareJob={handleShareJob}
          onDeleteJob={handleDeleteJobRequest}
          onBulkDelete={handleBulkDeleteRequest}
          onStatusChange={handleStatusChange}
          onResetFilters={handleResetFilters}
        />
      </div>

      {/* Detail Modal */}
      <JobDetailModal
        isOpen={!!selectedJobDetail}
        onClose={() => setSelectedJobDetail(null)}
        job={selectedJobDetail}
        onEditJob={(j) => {
          setEditingJob(j);
          setIsFormModalOpen(true);
        }}
        onShareJob={handleShareJob}
        onStatusChange={handleStatusChange}
      />

      {/* Create / Edit Job Form Modal */}
      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingJob(null);
        }}
        onSaveJob={handleSaveJob}
        editingJob={editingJob}
      />

      {/* Upload File Modal */}
      <JobUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportJobs={handleImportJobs}
      />

      {/* Single Job Delete Confirmation Modal */}
      <JobDeleteModal
        isOpen={!!deletingJobTarget}
        onClose={() => setDeletingJobTarget(null)}
        jobId={deletingJobTarget?.id || null}
        jobTitle={deletingJobTarget?.title || null}
        onConfirmDelete={handleConfirmDeleteJob}
      />

      {/* Bulk Delete Confirmation Modal */}
      <JobDeleteModal
        isOpen={bulkDeleteJobIds.length > 0}
        onClose={() => setBulkDeleteJobIds([])}
        selectedCount={bulkDeleteJobIds.length}
        onConfirmBulkDelete={handleConfirmBulkDelete}
      />
    </Page>
  );
};

export default JobsPage;
