import React, { useState, useMemo, useEffect, useCallback } from "react";
import { candidatesApi } from "../services/candidatesApi";
import { Upload, Search, X, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { CandidateDetailTable } from "./items/CandidateDetailTable";
import { CandidateDetailModal } from "./items/CandidateDetailModal";
import { CandidateFormModal } from "./items/CandidateFormModal";
import { CandidateUploadModal } from "./items/CandidateUploadModal";
import { CandidateDeleteModal } from "./items/CandidateDeleteModal";
import { toast } from "@/shared/ui/toast";
import type { Candidate, CandidateFilterState, CandidateStatus, CandidateStage } from "./types/candidate.types";

export const AllCandidatesPage: React.FC = () => {
  // Pure API-driven state (No mock data)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<CandidateFilterState>({
    search: "",
    status: "All",
    stage: "All",
    experience: "All",
    noticePeriod: "All",
    source: "All",
  });

  // Selection & Modal states
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<(string | number)[]>([]);
  const [bulkDeleteCandidateIds, setBulkDeleteCandidateIds] = useState<(string | number)[]>([]);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<Candidate | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingCandidateTarget, setDeletingCandidateTarget] = useState<{ id: string; name: string } | null>(null);

  /**
   * Fetch all candidates from backend API (GET /api/v1/candidates)
   */
  const loadCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await candidatesApi.listCandidates({
        limit: 100,
        offset: 0,
        status: filters.status !== "All" ? filters.status : undefined,
        overall_profile: filters.experience !== "All" ? filters.experience : undefined,
      });
      setCandidates(result.items);
    } catch (err) {
      console.warn("Failed to load candidates from API:", err);
      toast.error("Could not fetch candidate profiles from server.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.experience]);

  // Load from API on mount and filter changes
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Filtered candidates list (search & client filters)
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Status filter
      if (filters.status !== "All" && candidate.status !== filters.status) {
        return false;
      }
      // Stage filter
      if (filters.stage !== "All" && candidate.stage !== filters.stage) {
        return false;
      }
      // Source filter
      if (filters.source !== "All" && candidate.source !== filters.source) {
        return false;
      }
      // Search query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = candidate.fullName.toLowerCase().includes(query);
        const matchesEmail = candidate.email.toLowerCase().includes(query);
        const matchesRole = candidate.currentRole.toLowerCase().includes(query);
        const matchesCompany = candidate.company.toLowerCase().includes(query);
        const matchesSkills = candidate.skills.some((s) => s.toLowerCase().includes(query));
        const matchesTags = candidate.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesEmail && !matchesRole && !matchesCompany && !matchesSkills && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [candidates, filters]);

  // Filter Handlers
  const handleFilterChange = (key: keyof CandidateFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      stage: "All",
      experience: "All",
      noticePeriod: "All",
      source: "All",
    });
  };

  // Open candidate details with deep extraction data from GET /api/v1/candidates/{id}
  const handleSelectCandidate = async (candidate: Candidate) => {
    setSelectedCandidateDetail(candidate);
    if (/^\d+$/.test(candidate.id)) {
      const fullDetail = await candidatesApi.getCandidateById(candidate.id);
      if (fullDetail) {
        setSelectedCandidateDetail(fullDetail);
      }
    }
  };

  // CRUD Handlers
  const handleSaveCandidate = async (candidateData: Partial<Candidate>) => {
    if (candidateData.id) {
      // Optimistically update existing candidate in state
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateData.id ? ({ ...c, ...candidateData } as Candidate) : c))
      );
      if (selectedCandidateDetail?.id === candidateData.id) {
        setSelectedCandidateDetail((prev) => (prev ? ({ ...prev, ...candidateData } as Candidate) : null));
      }

      // Call backend Edit Candidate Profile API (PATCH /candidates/:id/profile)
      if (/^\d+$/.test(candidateData.id)) {
        try {
          const profilePayload = {
            full_name: candidateData.fullName,
            name: candidateData.fullName,
            email: candidateData.email,
            contact_no: candidateData.phone,
            phone: candidateData.phone,
            status: candidateData.status,
            notice_period: candidateData.noticePeriod,
            current_ctc: candidateData.currentSalary,
            expected_ctc: candidateData.expectedSalary,
            source: candidateData.source,
            note:
              candidateData.note !== undefined
                ? candidateData.note
                : candidateData.notes && candidateData.notes.length > 0
                  ? candidateData.notes[0].text
                  : undefined,
          };

          const result = await candidatesApi.editCandidateProfile(candidateData.id, profilePayload);
          if (result?.candidate) {
            const updated = result.candidate;
            setCandidates((prev) =>
              prev.map((c) => (c.id === candidateData.id ? { ...c, ...updated } : c))
            );
            if (selectedCandidateDetail?.id === candidateData.id) {
              setSelectedCandidateDetail((prev) => (prev ? { ...prev, ...updated } : null));
            }
          }
          toast.success(result?.message || `Candidate profile "${candidateData.fullName || 'Candidate'}" updated successfully!`);
        } catch (err) {
          console.error("Error updating candidate profile:", err);
          toast.error("Failed to save profile changes to server.");
        }
      } else {
        toast.success(`Candidate profile "${candidateData.fullName || 'Candidate'}" updated successfully!`);
      }
    } else {
      // Create new candidate locally
      const newCandidate: Candidate = {
        id: `CND-${Date.now().toString().slice(-4)}`,
        fullName: candidateData.fullName || "New Candidate",
        email: candidateData.email || "candidate@example.com",
        phone: candidateData.phone || "+91 90000 00000",
        currentRole: candidateData.currentRole || "Software Engineer",
        company: candidateData.company || "Tech Inc.",
        experienceYears: candidateData.experienceYears || 3,
        location: candidateData.location || "Bengaluru, India",
        skills: candidateData.skills || ["Engineering"],
        primarySkill: candidateData.primarySkill || "Engineering",
        highestDegree: candidateData.highestDegree || "B.Tech",
        status: candidateData.status || "Active",
        stage: candidateData.stage || "New",
        source: candidateData.source || "Manual Entry",
        appliedJobTitle: candidateData.appliedJobTitle || "General Application",
        rating: candidateData.rating || 4,
        noticePeriod: candidateData.noticePeriod || "30 Days",
        currentSalary: candidateData.currentSalary || "N/A",
        expectedSalary: candidateData.expectedSalary || "N/A",
        resumeFileName: candidateData.resumeFileName || `${(candidateData.fullName || "Candidate").replace(/\s+/g, "_")}_CV.pdf`,
        tags: candidateData.tags || ["Direct Entry"],
        createdAt: new Date().toISOString().split("T")[0],
        lastActivity: new Date().toISOString().split("T")[0],
        notes: [],
        applicationHistory: [],
      };

      setCandidates((prev) => [newCandidate, ...prev]);
      toast.success(`Candidate profile "${newCandidate.fullName}" added successfully!`);
    }
  };

  const handleImportCandidates = (importedCandidates: Candidate[]) => {
    // Re-fetch real records from API so everything is synchronized
    loadCandidates();
    toast.success(`Successfully uploaded ${importedCandidates.length} candidate file(s)!`);
  };

  const handleShareCandidate = (candidate: Candidate) => {
    const shareUrl = `${window.location.origin}/candidates/all?id=${candidate.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success(`Candidate link for "${candidate.fullName}" copied to clipboard!`);
    } else {
      toast.info(`Candidate Profile Link: ${shareUrl}`);
    }
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    const fileName = candidate.resumeFileName || `${candidate.fullName}_Resume`;
    const toastId = toast.loading(`Downloading resume: ${fileName}...`);
    try {
      await candidatesApi.downloadResumeFile(candidate);
      toast.dismiss(toastId);
      toast.success(`Successfully downloaded ${fileName}`);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(
        `Failed to download resume: ${err?.message || "File not found or backend unavailable"}`
      );
    }
  };

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    if (/^\d+$/.test(candidateId)) {
      await candidatesApi.updateCandidateField(candidateId, "status", newStatus);
    }
    toast.success(`Candidate status updated to "${newStatus}"`);
  };

  const handleStageChange = async (candidateId: string, newStage: CandidateStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
    if (/^\d+$/.test(candidateId)) {
      await candidatesApi.updateCandidateField(candidateId, "stage", newStage);
    }
    toast.success(`Candidate stage updated to "${newStage}"`);
  };

  const handleAddNote = async (candidateId: string, text: string) => {
    const optimisticNote = {
      id: `note-${Date.now()}`,
      author: "Recruiter Note",
      text,
      date: new Date().toISOString(),
    };

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, note: text, notes: [optimisticNote, ...c.notes] } : c
      )
    );

    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail((prev) =>
        prev ? { ...prev, note: text, notes: [optimisticNote, ...prev.notes] } : null
      );
    }

    if (/^\d+$/.test(candidateId)) {
      try {
        const result = await candidatesApi.editCandidateProfile(candidateId, { note: text });
        if (result?.candidate) {
          const updated = result.candidate;
          setCandidates((prev) =>
            prev.map((c) => (c.id === candidateId ? { ...c, ...updated } : c))
          );
          if (selectedCandidateDetail?.id === candidateId) {
            setSelectedCandidateDetail((prev) => (prev ? { ...prev, ...updated } : null));
          }
        }
      } catch (err) {
        console.error("Failed to persist note to server:", err);
      }
    }
    toast.success("Added new note to candidate profile.");
  };

  const handleDeleteCandidateRequest = (candidateId: string, name: string) => {
    setDeletingCandidateTarget({ id: candidateId, name });
  };

  const handleConfirmDeleteCandidate = async (candidateId: string, name: string) => {
    try {
      if (/^\d+$/.test(candidateId)) {
        await candidatesApi.softDeleteCandidate(candidateId);
      }
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      setSelectedCandidateIds((prev) => prev.filter((id) => String(id) !== String(candidateId)));
      toast.info(`Candidate "${name}" soft-deleted successfully.`);
    } catch (err) {
      console.error(`Failed to soft-delete candidate ${candidateId}:`, err);
      toast.error(`Failed to delete candidate "${name}". Please try again.`);
    } finally {
      setDeletingCandidateTarget(null);
    }
  };

  const handleBulkDeleteRequest = (candidateIds: (string | number)[]) => {
    setBulkDeleteCandidateIds(candidateIds);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteCandidateIds.length === 0) return;
    try {
      for (const id of bulkDeleteCandidateIds) {
        if (/^\d+$/.test(String(id))) {
          await candidatesApi.softDeleteCandidate(id);
        }
      }
      const idsSet = new Set(bulkDeleteCandidateIds.map(String));
      setCandidates((prev) => prev.filter((c) => !idsSet.has(String(c.id))));
      toast.info(`Successfully soft-deleted ${bulkDeleteCandidateIds.length} candidate profile(s).`);
    } catch (err) {
      console.error("Failed to soft-delete some selected candidates:", err);
      toast.error("Failed to soft-delete some candidate profiles. Please try again.");
    } finally {
      setBulkDeleteCandidateIds([]);
      setSelectedCandidateIds([]);
    }
  };

  return (
    <Page
      title="All Candidates"
      subtitle="Manage real-time candidate profiles, review qualifications, track interview stages, and import talent data."
      breadcrumbs={[{ label: "Candidates" }]}
      actions={
        <div className="flex items-center gap-2">
          {/* Global Search Bar */}
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search candidates by name, email, role, or skills..."
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

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={() => loadCandidates()}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium shrink-0 rounded-lg shadow-2xs"
            title="Refresh candidate table from API"
          >
            Refresh
          </Button>

          {/* Upload Multiple File Button */}
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs shrink-0 rounded-lg px-4"
            title="Upload Multiple Candidate Files"
          >
            Upload Multiple File
          </Button>
        </div>
      }
    >
      {/* Main Candidate Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <CandidateDetailTable
          candidates={filteredCandidates}
          selectedCandidateIds={selectedCandidateIds}
          onSelectionChange={setSelectedCandidateIds}
          onSelectCandidate={handleSelectCandidate}
          onEditCandidate={(candidate) => {
            setEditingCandidate(candidate);
            setIsFormModalOpen(true);
          }}
          onShareCandidate={handleShareCandidate}
          onDownloadResume={handleDownloadResume}
          onDeleteCandidate={handleDeleteCandidateRequest}
          onBulkDelete={handleBulkDeleteRequest}
          onStatusChange={handleStatusChange}
          onStageChange={handleStageChange}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Candidate Detail Slide-Over Modal */}
      <CandidateDetailModal
        isOpen={!!selectedCandidateDetail}
        onClose={() => setSelectedCandidateDetail(null)}
        candidate={selectedCandidateDetail}
        onEditCandidate={(c) => {
          setEditingCandidate(c);
          setIsFormModalOpen(true);
        }}
        onShareCandidate={handleShareCandidate}
        onDownloadResume={handleDownloadResume}
        onStatusChange={handleStatusChange}
        onStageChange={handleStageChange}
        onAddNote={handleAddNote}
      />

      {/* Create / Edit Candidate Form Modal */}
      <CandidateFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCandidate(null);
        }}
        onSaveCandidate={handleSaveCandidate}
        editingCandidate={editingCandidate}
      />

      {/* Multiple Candidate File Upload Modal */}
      <CandidateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportCandidates={handleImportCandidates}
      />

      {/* Single Candidate Delete Modal */}
      <CandidateDeleteModal
        isOpen={!!deletingCandidateTarget}
        onClose={() => setDeletingCandidateTarget(null)}
        candidateId={deletingCandidateTarget?.id || null}
        candidateName={deletingCandidateTarget?.name || null}
        onConfirmDelete={handleConfirmDeleteCandidate}
      />

      {/* Bulk Delete Modal */}
      <CandidateDeleteModal
        isOpen={bulkDeleteCandidateIds.length > 0}
        onClose={() => setBulkDeleteCandidateIds([])}
        selectedCount={bulkDeleteCandidateIds.length}
        onConfirmBulkDelete={handleConfirmBulkDelete}
      />
    </Page>
  );
};

export default AllCandidatesPage;
