import React, { useState, useMemo } from "react";
import { Plus, Upload, Search, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { CandidateDetailTable } from "./items/CandidateDetailTable";
import { CandidateDetailModal } from "./items/CandidateDetailModal";
import { CandidateFormModal } from "./items/CandidateFormModal";
import { CandidateUploadModal } from "./items/CandidateUploadModal";
import { CandidateDeleteModal } from "./items/CandidateDeleteModal";
import { INITIAL_CANDIDATES } from "./data/mockCandidatesData";
import { toast } from "@/shared/ui/toast";
import type { Candidate, CandidateFilterState, CandidateStatus, CandidateStage } from "./types/candidate.types";

export const AllCandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
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

  // Filtered candidates list
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
        if (!matchesName && !matchesEmail && !matchesRole && !matchesCompany && !matchesSkills) {
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

  // CRUD Handlers
  const handleSaveCandidate = (candidateData: Partial<Candidate>) => {
    if (candidateData.id) {
      // Update existing candidate
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateData.id ? ({ ...c, ...candidateData } as Candidate) : c))
      );
      if (selectedCandidateDetail?.id === candidateData.id) {
        setSelectedCandidateDetail((prev) => (prev ? ({ ...prev, ...candidateData } as Candidate) : null));
      }
      toast.success(`Candidate profile "${candidateData.fullName}" updated successfully!`);
    } else {
      // Create new candidate
      const newCandidate: Candidate = {
        id: `CND-${Date.now().toString().slice(-4)}`,
        fullName: candidateData.fullName || "New Candidate",
        email: candidateData.email || "candidate@example.com",
        phone: candidateData.phone || "+91 90000 00000",
        currentRole: candidateData.currentRole || "Software Engineer",
        company: candidateData.company || "Tech Inc.",
        experienceYears: candidateData.experienceYears || 3,
        location: candidateData.location || "Bengaluru, India",
        skills: candidateData.skills || ["React", "TypeScript"],
        primarySkill: candidateData.primarySkill || "React",
        highestDegree: candidateData.highestDegree || "B.Tech in Computer Science",
        status: candidateData.status || "Active",
        stage: candidateData.stage || "New",
        source: candidateData.source || "Direct Entry",
        appliedJobTitle: candidateData.appliedJobTitle || "General Pool",
        rating: candidateData.rating || 4,
        noticePeriod: candidateData.noticePeriod || "30 Days",
        currentSalary: candidateData.currentSalary || "N/A",
        expectedSalary: candidateData.expectedSalary || "N/A",
        resumeFileName: `${(candidateData.fullName || "Candidate").replace(/\s+/g, "_")}_CV.pdf`,
        tags: candidateData.tags || ["New Entry"],
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
    setCandidates((prev) => [...importedCandidates, ...prev]);
    toast.success(`Successfully imported ${importedCandidates.length} candidate profile(s)!`);
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

  const handleDownloadResume = (candidate: Candidate) => {
    toast.success(`Downloading resume file: ${candidate.resumeFileName || `${candidate.fullName}_Resume.pdf`}`);
  };

  const handleStatusChange = (candidateId: string, newStatus: CandidateStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Candidate status updated to "${newStatus}"`);
  };

  const handleStageChange = (candidateId: string, newStage: CandidateStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail((prev) => (prev ? { ...prev, stage: newStage } : null));
    }
    toast.success(`Candidate stage updated to "${newStage}"`);
  };

  const handleAddNote = (candidateId: string, text: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      author: "Hiring Manager",
      text,
      date: new Date().toISOString().split("T")[0],
    };

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, notes: [newNote, ...c.notes] } : c
      )
    );

    if (selectedCandidateDetail?.id === candidateId) {
      setSelectedCandidateDetail((prev) =>
        prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
      );
    }
    toast.success("Added new note to candidate profile.");
  };

  const handleDeleteCandidateRequest = (candidateId: string, name: string) => {
    setDeletingCandidateTarget({ id: candidateId, name });
  };

  const handleConfirmDeleteCandidate = (candidateId: string, name: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    setSelectedCandidateIds((prev) => prev.filter((id) => String(id) !== String(candidateId)));
    toast.info(`Deleted candidate profile "${name}".`);
    setDeletingCandidateTarget(null);
  };

  const handleBulkDeleteRequest = (candidateIds: (string | number)[]) => {
    setBulkDeleteCandidateIds(candidateIds);
  };

  const handleConfirmBulkDelete = () => {
    if (bulkDeleteCandidateIds.length === 0) return;
    const idsSet = new Set(bulkDeleteCandidateIds.map(String));
    setCandidates((prev) => prev.filter((c) => !idsSet.has(String(c.id))));
    toast.info(`Successfully deleted ${bulkDeleteCandidateIds.length} selected candidate profile(s).`);
    setBulkDeleteCandidateIds([]);
    setSelectedCandidateIds([]);
  };

  return (
    <Page
      title="All Candidates"
      subtitle="Manage candidate profiles, review qualifications, track interview stages, and import talent data."
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

          {/* Add Candidate Button */}
          <Button
            onClick={() => {
              setEditingCandidate(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs shrink-0 rounded-lg px-4"
          >
            Add Candidate
          </Button>

          {/* Bulk Upload Button */}
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            leftIcon={<Upload className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium shrink-0 rounded-lg shadow-2xs"
            title="Import Candidates (JSON / Payload)"
          >
            Upload File
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
          onSelectCandidate={setSelectedCandidateDetail}
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

      {/* Bulk Upload Candidate Payload Modal */}
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
