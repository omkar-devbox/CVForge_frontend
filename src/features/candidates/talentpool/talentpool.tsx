import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Grid,
  List,
  Sparkles,
  UserPlus,
  Send,
  Download,
  Filter,
  RefreshCw,
  Mail,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { toast } from "@/shared/ui/toast";
import { TalentPoolStats } from "./items/TalentPoolStats";
import { TalentPoolCategoryCards } from "./items/TalentPoolCategoryCards";
import { TalentPoolCardGrid } from "./items/TalentPoolCardGrid";
import { TalentPoolTable } from "./items/TalentPoolTable";
import { TalentPoolModal } from "./items/TalentPoolModal";
import { AssignToJobModal } from "./items/AssignToJobModal";
import { CandidateQuickViewModal } from "./items/CandidateQuickViewModal";
import { AddCandidateModal } from "./items/AddCandidateModal";

import {
  INITIAL_TALENT_POOLS,
  INITIAL_POOLED_CANDIDATES,
  MOCK_ACTIVE_JOBS,
} from "./data/mockTalentPoolData";
import type {
  TalentPoolCategory,
  PooledCandidate,
  ReadinessStatus,
  TalentPoolFilterState,
} from "./types/talentpool.types";

export const TalentPoolPage: React.FC = () => {
  const [pools, setPools] = useState<TalentPoolCategory[]>(INITIAL_TALENT_POOLS);
  const [candidates, setCandidates] = useState<PooledCandidate[]>(INITIAL_POOLED_CANDIDATES);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filters State
  const [filters, setFilters] = useState<TalentPoolFilterState>({
    search: "",
    selectedPoolId: "all",
    readiness: "All",
    experience: "All",
    minRating: 0,
    skillQuery: "",
  });

  // Selected candidates for bulk operations
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<(string | number)[]>([]);

  // Modals state
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<TalentPoolCategory | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTargetCandidates, setAssignTargetCandidates] = useState<PooledCandidate[]>([]);

  const [quickViewCandidate, setQuickViewCandidate] = useState<PooledCandidate | null>(null);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);

  // Compute metrics for stats header
  const totalCandidatesCount = candidates.length;
  const totalPoolsCount = pools.length;
  const topMatchCount = useMemo(
    () => candidates.filter((c) => c.matchScore >= 90).length,
    [candidates]
  );
  const readyToMoveCount = useMemo(
    () => candidates.filter((c) => c.readinessStatus === "Ready to Move").length,
    [candidates]
  );

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // Filter by Pool
      if (filters.selectedPoolId !== "all") {
        if (!candidate.poolIds?.includes(filters.selectedPoolId)) {
          return false;
        }
      }

      // Filter by Readiness
      if (filters.readiness !== "All" && candidate.readinessStatus !== filters.readiness) {
        return false;
      }

      // Filter by Experience
      if (filters.experience !== "All") {
        if (filters.experience === "0-2" && (candidate.experienceYears < 0 || candidate.experienceYears > 2)) return false;
        if (filters.experience === "3-5" && (candidate.experienceYears < 3 || candidate.experienceYears > 5)) return false;
        if (filters.experience === "5-8" && (candidate.experienceYears < 5 || candidate.experienceYears > 8)) return false;
        if (filters.experience === "8+" && candidate.experienceYears < 8) return false;
      }

      // Filter by Search text
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesName = candidate.fullName.toLowerCase().includes(q);
        const matchesRole = candidate.currentRole.toLowerCase().includes(q);
        const matchesCompany = candidate.company.toLowerCase().includes(q);
        const matchesSkills = candidate.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesRole && !matchesCompany && !matchesSkills) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, filters]);

  // Handlers
  const handleToggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    }
  };

  const handleSelectPoolCategory = (poolId: string) => {
    setFilters((prev) => ({ ...prev, selectedPoolId: poolId }));
    setSelectedCandidateIds([]);
  };

  const handleStatFilterClick = (statType: string) => {
    if (statType === "all") {
      setFilters((prev) => ({ ...prev, selectedPoolId: "all", readiness: "All" }));
    } else if (statType === "ready") {
      setFilters((prev) => ({ ...prev, readiness: "Ready to Move" }));
    } else if (statType === "topMatch") {
      // Filter top matches
      toast.info("Showing candidates with match score 90%+");
    }
  };

  // Pool CRUD Handlers
  const handleSavePool = (poolData: Partial<TalentPoolCategory>) => {
    if (poolData.id) {
      // Update
      setPools((prev) =>
        prev.map((p) => (p.id === poolData.id ? ({ ...p, ...poolData } as TalentPoolCategory) : p))
      );
      toast.success(`Talent Pool "${poolData.name}" updated successfully!`);
    } else {
      // Create
      const newPool: TalentPoolCategory = {
        id: `pool-${Date.now()}`,
        name: poolData.name || "New Talent Pool",
        description: poolData.description || "",
        iconName: poolData.iconName || "Code2",
        color: poolData.color || "blue",
        candidateCount: 0,
        tags: poolData.tags || [],
        targetRoles: poolData.targetRoles || [],
        owner: poolData.owner || "Aniket Sharma",
        updatedDate: new Date().toISOString().split("T")[0],
        isStarred: false,
      };
      setPools((prev) => [newPool, ...prev]);
      toast.success(`New Talent Pool "${newPool.name}" created successfully!`);
    }
  };

  const handleDeletePool = (poolId: string) => {
    const poolToDelete = pools.find((p) => p.id === poolId);
    setPools((prev) => prev.filter((p) => p.id !== poolId));
    if (filters.selectedPoolId === poolId) {
      setFilters((prev) => ({ ...prev, selectedPoolId: "all" }));
    }
    toast.success(`Talent Pool "${poolToDelete?.name || poolId}" deleted.`);
  };

  const handleToggleStarPool = (poolId: string) => {
    setPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, isStarred: !p.isStarred } : p))
    );
  };

  // Candidate Actions Handlers
  const handleOpenAssignModalForOne = (candidate: PooledCandidate) => {
    setAssignTargetCandidates([candidate]);
    setIsAssignModalOpen(true);
  };

  const handleOpenAssignModalForSelected = () => {
    const selectedList = candidates.filter((c) => selectedCandidateIds.includes(c.id));
    if (selectedList.length === 0) return;
    setAssignTargetCandidates(selectedList);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignToJob = (jobId: string, stage: string) => {
    const job = MOCK_ACTIVE_JOBS.find((j) => j.id === jobId);
    toast.success(
      `Assigned ${assignTargetCandidates.length} candidate(s) to "${job?.title || jobId}" (${stage} stage)!`
    );
    setSelectedCandidateIds([]);
  };

  const handleRemoveCandidateFromPool = (candidate: PooledCandidate) => {
    if (filters.selectedPoolId !== "all") {
      // Remove from selected pool
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id
            ? { ...c, poolIds: c.poolIds.filter((pId) => pId !== filters.selectedPoolId) }
            : c
        )
      );
      toast.info(`Removed "${candidate.fullName}" from the current talent pool.`);
    } else {
      // Remove candidate completely
      setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      toast.info(`Removed "${candidate.fullName}" from talent pool database.`);
    }
  };

  const handleUpdateReadiness = (candidateId: string, readinessStatus: ReadinessStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, readinessStatus } : c))
    );
    if (quickViewCandidate?.id === candidateId) {
      setQuickViewCandidate((prev) => (prev ? { ...prev, readinessStatus } : null));
    }
    toast.success(`Updated readiness status to "${readinessStatus}"`);
  };

  const handleTogglePoolMembership = (candidateId: string, poolId: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const exists = c.poolIds?.includes(poolId);
          const newPoolIds = exists
            ? c.poolIds.filter((p) => p !== poolId)
            : [...(c.poolIds || []), poolId];
          return { ...c, poolIds: newPoolIds };
        }
        return c;
      })
    );

    // Update pool counts
    setPools((prev) =>
      prev.map((p) => {
        if (p.id === poolId) {
          const candidateWasInPool = candidates
            .find((c) => c.id === candidateId)
            ?.poolIds?.includes(poolId);
          return {
            ...p,
            candidateCount: candidateWasInPool ? Math.max(0, p.candidateCount - 1) : p.candidateCount + 1,
          };
        }
        return p;
      })
    );

    if (quickViewCandidate?.id === candidateId) {
      setQuickViewCandidate((prev) => {
        if (!prev) return null;
        const exists = prev.poolIds?.includes(poolId);
        const newPoolIds = exists
          ? prev.poolIds.filter((p) => p !== poolId)
          : [...(prev.poolIds || []), poolId];
        return { ...prev, poolIds: newPoolIds };
      });
    }

    toast.success("Talent Pool membership updated!");
  };

  const handleAddCandidateToPool = (candidateData: Partial<PooledCandidate>) => {
    const newPooledCandidate: PooledCandidate = {
      id: `CND-${Date.now().toString().slice(-4)}`,
      fullName: candidateData.fullName || "New Candidate",
      email: candidateData.email || "candidate@example.com",
      phone: candidateData.phone || "+91 90000 00000",
      currentRole: candidateData.currentRole || "Software Engineer",
      company: candidateData.company || "Tech Inc.",
      experienceYears: candidateData.experienceYears || 3,
      location: candidateData.location || "Bengaluru, India",
      skills: candidateData.skills || ["React"],
      primarySkill: candidateData.primarySkill || "React",
      highestDegree: "B.Tech in Computer Science",
      status: "Active",
      stage: "New",
      source: "Direct Entry",
      rating: candidateData.rating || 4,
      noticePeriod: candidateData.noticePeriod || "15 Days",
      currentSalary: "₹18,00,000 / yr",
      expectedSalary: "₹24,00,000 / yr",
      tags: ["Pooled Talent"],
      createdAt: new Date().toISOString().split("T")[0],
      lastActivity: new Date().toISOString().split("T")[0],
      notes: [],
      applicationHistory: [],
      poolIds: candidateData.poolIds || [],
      addedToPoolDate: new Date().toISOString().split("T")[0],
      readinessStatus: candidateData.readinessStatus || "Ready to Move",
      matchScore: candidateData.matchScore || 90,
      aiSummary: candidateData.aiSummary || "Pre-vetted talent pool addition.",
      lastContactedDate: new Date().toISOString().split("T")[0],
    };

    setCandidates((prev) => [newPooledCandidate, ...prev]);

    // Update candidate counts in assigned pools
    if (candidateData.poolIds && candidateData.poolIds.length > 0) {
      setPools((prev) =>
        prev.map((p) =>
          candidateData.poolIds?.includes(p.id)
            ? { ...p, candidateCount: p.candidateCount + 1 }
            : p
        )
      );
    }

    toast.success(`Candidate "${newPooledCandidate.fullName}" added to talent pool!`);
  };

  const handleAddNote = (candidateId: string, noteText: string) => {
    const newNote = {
      id: `n-${Date.now()}`,
      author: "Recruiter Admin",
      text: noteText,
      date: new Date().toISOString().split("T")[0],
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, notes: [newNote, ...c.notes] } : c))
    );

    if (quickViewCandidate?.id === candidateId) {
      setQuickViewCandidate((prev) =>
        prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
      );
    }

    toast.success("Note added successfully!");
  };

  const handleExportShortlist = () => {
    const exportData = filteredCandidates.map((c) => ({
      ID: c.id,
      Name: c.fullName,
      Role: c.currentRole,
      Company: c.company,
      Readiness: c.readinessStatus,
      "Match Score": `${c.matchScore}%`,
      "Notice Period": c.noticePeriod,
      Skills: c.skills.join(", "),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Talent_Pool_Shortlist_${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    toast.success(`Exported ${filteredCandidates.length} candidate record(s)!`);
  };

  return (
    <Page
      title="Talent Pool Management"
      subtitle="Curate, organize, and fast-track high-potential pre-vetted candidates into hiring requisitions."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportShortlist}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download size={14} />
            Export Shortlist
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingPool(null);
              setIsPoolModalOpen(true);
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus size={14} />
            Create Pool
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddCandidateModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus size={14} />
            Add Candidate
          </Button>
        </div>
      }
    >
      {/* Top Stats Overview */}
      <TalentPoolStats
        totalCandidates={totalCandidatesCount}
        totalPools={totalPoolsCount}
        topMatchCount={topMatchCount}
        readyToMoveCount={readyToMoveCount}
        onSelectStatFilter={handleStatFilterClick}
      />

      {/* Talent Pool Category Collection Cards */}
      <TalentPoolCategoryCards
        pools={pools}
        selectedPoolId={filters.selectedPoolId}
        onSelectPool={handleSelectPoolCategory}
        onCreatePool={() => {
          setEditingPool(null);
          setIsPoolModalOpen(true);
        }}
        onEditPool={(pool) => {
          setEditingPool(pool);
          setIsPoolModalOpen(true);
        }}
        onDeletePool={handleDeletePool}
        onToggleStarPool={handleToggleStarPool}
      />

      {/* Filter Toolbar & View Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name, skills, role..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <X
              size={14}
              className="absolute right-2.5 top-2.5 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            />
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Readiness Filter */}
          <select
            value={filters.readiness}
            onChange={(e) => setFilters((prev) => ({ ...prev, readiness: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="All">All Readiness</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Exploring">Exploring</option>
            <option value="Passive">Passive</option>
            <option value="Not Available">Not Available</option>
          </select>

          {/* Experience Filter */}
          <select
            value={filters.experience}
            onChange={(e) => setFilters((prev) => ({ ...prev, experience: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="All">All Experience</option>
            <option value="0-2">0 - 2 Years</option>
            <option value="3-5">3 - 5 Years</option>
            <option value="5-8">5 - 8 Years</option>
            <option value="8+">8+ Years</option>
          </select>

          {/* Reset Filters */}
          {(filters.search || filters.readiness !== "All" || filters.experience !== "All") && (
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  selectedPoolId: filters.selectedPoolId,
                  readiness: "All",
                  experience: "All",
                  minRating: 0,
                  skillQuery: "",
                })
              }
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold px-2 py-1 hover:underline shrink-0"
            >
              <RefreshCw size={13} /> Reset
            </button>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 ml-auto md:ml-2 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Grid Card View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Table List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when candidates are selected) */}
      {selectedCandidateIds.length > 0 && (
        <div className="bg-blue-900 text-white rounded-xl p-3.5 mb-5 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {selectedCandidateIds.length}
            </span>
            <span className="text-xs font-bold">
              {selectedCandidateIds.length} Candidate(s) Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenAssignModalForSelected}
              className="gap-1.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs"
            >
              <Send size={13} />
              Assign to Job Requisition
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`Outreach message sent to ${selectedCandidateIds.length} candidates!`)}
              className="gap-1.5 text-xs text-white border-blue-700 hover:bg-blue-800"
            >
              <Mail size={13} />
              Outreach Email
            </Button>

            <button
              onClick={() => setSelectedCandidateIds([])}
              className="p-1 text-blue-200 hover:text-white rounded-md hover:bg-blue-800"
              title="Clear Selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area: Card Grid or Table View */}
      {viewMode === "grid" ? (
        <TalentPoolCardGrid
          candidates={filteredCandidates}
          pools={pools}
          selectedCandidateIds={selectedCandidateIds}
          onToggleSelectCandidate={handleToggleSelectCandidate}
          onQuickView={(cand) => setQuickViewCandidate(cand)}
          onAssignToJob={handleOpenAssignModalForOne}
          onRemoveFromPool={handleRemoveCandidateFromPool}
        />
      ) : (
        <TalentPoolTable
          candidates={filteredCandidates}
          pools={pools}
          selectedCandidateIds={selectedCandidateIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectCandidate={handleToggleSelectCandidate}
          onQuickView={(cand) => setQuickViewCandidate(cand)}
          onAssignToJob={handleOpenAssignModalForOne}
          onRemoveFromPool={handleRemoveCandidateFromPool}
        />
      )}

      {/* Modals */}
      {/* Create / Edit Talent Pool Modal */}
      <TalentPoolModal
        isOpen={isPoolModalOpen}
        onClose={() => {
          setIsPoolModalOpen(false);
          setEditingPool(null);
        }}
        onSave={handleSavePool}
        editingPool={editingPool}
      />

      {/* Assign to Job Requisition Modal */}
      <AssignToJobModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        candidates={assignTargetCandidates}
        activeJobs={MOCK_ACTIVE_JOBS}
        onConfirmAssign={handleConfirmAssignToJob}
      />

      {/* Candidate Profile Quick View Drawer / Modal */}
      <CandidateQuickViewModal
        isOpen={!!quickViewCandidate}
        onClose={() => setQuickViewCandidate(null)}
        candidate={quickViewCandidate}
        pools={pools}
        onAssignToJob={handleOpenAssignModalForOne}
        onUpdateReadiness={handleUpdateReadiness}
        onTogglePoolMembership={handleTogglePoolMembership}
        onAddNote={handleAddNote}
      />

      {/* Add Candidate to Pool Modal */}
      <AddCandidateModal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        pools={pools}
        onAddCandidate={handleAddCandidateToPool}
      />
    </Page>
  );
};

export default TalentPoolPage;
