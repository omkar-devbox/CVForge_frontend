import React, { useState, useMemo } from "react";
import {
  Search,
  Grid,
  List,
  Download,
  RefreshCw,
  X,
  Award,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { toast } from "@/shared/ui/toast";
import { CompletedStats } from "./items/CompletedStats";
import { CompletedTable } from "./items/CompletedTable";
import { CompletedCardsView } from "./items/CompletedCardsView";
import { FeedbackScorecardModal } from "./items/FeedbackScorecardModal";
import { CompletedDetailModal } from "./items/CompletedDetailModal";

import { INITIAL_COMPLETED_INTERVIEWS } from "./data/mockCompletedInterviews";
import type {
  CompletedInterview,
  CompletedFilterState,
} from "./types/completed.types";

export const CompletedInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<CompletedInterview[]>(
    INITIAL_COMPLETED_INTERVIEWS
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters state
  const [filters, setFilters] = useState<CompletedFilterState>({
    search: "",
    recommendation: "all",
    round: "all",
    finalOutcome: "all",
  });

  // Modal states
  const [scorecardInterview, setScorecardInterview] = useState<CompletedInterview | null>(null);
  const [detailInterview, setDetailInterview] = useState<CompletedInterview | null>(null);

  // Compute metrics for stats header
  const totalCompleted = interviews.length;
  const strongHireCount = useMemo(
    () => interviews.filter((i) => i.recommendation === "Strong Hire").length,
    [interviews]
  );
  const hiredCount = useMemo(
    () => interviews.filter((i) => i.finalOutcome === "Hired").length,
    [interviews]
  );
  const underReviewCount = useMemo(
    () => interviews.filter((i) => i.finalOutcome === "Under Review").length,
    [interviews]
  );
  const avgRating = useMemo(() => {
    if (interviews.length === 0) return 0;
    const total = interviews.reduce((acc, curr) => acc + curr.overallRating, 0);
    return total / interviews.length;
  }, [interviews]);

  // Filter logic
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      // Recommendation Filter
      if (filters.recommendation !== "all") {
        if (filters.recommendation === "strong_hire" && item.recommendation !== "Strong Hire") return false;
        if (filters.recommendation === "hire" && item.recommendation !== "Hire") return false;
        if (filters.recommendation === "hold" && item.recommendation !== "Hold") return false;
        if (filters.recommendation === "reject" && item.recommendation !== "Reject") return false;
      }

      // Final Outcome Filter
      if (filters.finalOutcome !== "all") {
        if (filters.finalOutcome === "hired" && item.finalOutcome !== "Hired") return false;
        if (filters.finalOutcome === "under_review" && item.finalOutcome !== "Under Review") return false;
      }

      // Round Filter
      if (filters.round !== "all" && item.round !== filters.round) {
        return false;
      }

      // Search Query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesCandidate = item.candidateName.toLowerCase().includes(q);
        const matchesJob = item.jobTitle.toLowerCase().includes(q);
        const matchesDept = item.department.toLowerCase().includes(q);
        const matchesInterviewer = item.interviewers.some((int) =>
          int.name.toLowerCase().includes(q)
        );
        if (!matchesCandidate && !matchesJob && !matchesDept && !matchesInterviewer) {
          return false;
        }
      }

      return true;
    });
  }, [interviews, filters]);

  // Stat filter clicks
  const handleStatFilterClick = (filterType: string) => {
    if (filterType === "all") {
      setFilters((prev) => ({ ...prev, recommendation: "all", finalOutcome: "all" }));
    } else if (filterType === "strong_hire") {
      setFilters((prev) => ({ ...prev, recommendation: "strong_hire" }));
    } else if (filterType === "hired") {
      setFilters((prev) => ({ ...prev, finalOutcome: "hired" }));
    } else if (filterType === "under_review") {
      setFilters((prev) => ({ ...prev, finalOutcome: "under_review" }));
    }
  };

  const handleExportReport = () => {
    const exportData = filteredInterviews.map((item) => ({
      ID: item.id,
      Candidate: item.candidateName,
      Email: item.candidateEmail,
      Position: item.jobTitle,
      Round: item.round,
      CompletedDate: item.completedDate,
      Recommendation: item.recommendation,
      OverallRating: `${item.overallRating} / 5`,
      FinalOutcome: item.finalOutcome || "Under Review",
      Evaluators: item.interviewers.map((i) => i.name).join("; "),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Completed_Interviews_Report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    toast.success(`Exported ${filteredInterviews.length} completed interview records!`);
  };

  return (
    <Page
      title="Completed Interviews & Feedback Logs"
      subtitle="Review interview scorecards, candidate evaluations, panel ratings, and hiring recommendations."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download size={14} />
            Export Report
          </Button>
        </div>
      }
    >
      {/* Top Stats Overview Header */}
      <CompletedStats
        totalCompleted={totalCompleted}
        strongHireCount={strongHireCount}
        hiredCount={hiredCount}
        underReviewCount={underReviewCount}
        avgRating={avgRating}
        onFilterClick={handleStatFilterClick}
      />

      {/* Toolbar: Search, Filters & View Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, job position, panelist..."
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

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Recommendation Filter */}
          <select
            value={filters.recommendation}
            onChange={(e) => setFilters((prev) => ({ ...prev, recommendation: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Recommendations</option>
            <option value="strong_hire">Strong Hire</option>
            <option value="hire">Hire</option>
            <option value="hold">Hold</option>
            <option value="reject">Reject</option>
          </select>

          {/* Final Outcome Filter */}
          <select
            value={filters.finalOutcome}
            onChange={(e) => setFilters((prev) => ({ ...prev, finalOutcome: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="hired">Hired</option>
            <option value="under_review">Under Review</option>
          </select>

          {/* Reset Filters */}
          {(filters.search || filters.recommendation !== "all" || filters.finalOutcome !== "all") && (
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  recommendation: "all",
                  round: "all",
                  finalOutcome: "all",
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
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Data Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Scorecards Grid View"
            >
              <Grid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <CompletedTable
          interviews={filteredInterviews}
          onViewScorecard={(interview) => setScorecardInterview(interview)}
          onViewDetails={(interview) => setDetailInterview(interview)}
        />
      ) : (
        <CompletedCardsView
          interviews={filteredInterviews}
          onViewScorecard={(interview) => setScorecardInterview(interview)}
          onViewDetails={(interview) => setDetailInterview(interview)}
        />
      )}

      {/* Modals */}
      {/* 1. Scorecard Breakdown Modal */}
      <FeedbackScorecardModal
        isOpen={!!scorecardInterview}
        onClose={() => setScorecardInterview(null)}
        interview={scorecardInterview}
      />

      {/* 2. Candidate Detail Modal */}
      <CompletedDetailModal
        isOpen={!!detailInterview}
        onClose={() => setDetailInterview(null)}
        interview={detailInterview}
        onViewScorecard={(interview) => setScorecardInterview(interview)}
      />
    </Page>
  );
};

export default CompletedInterviewsPage;
