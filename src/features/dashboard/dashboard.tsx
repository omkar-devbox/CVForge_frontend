import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  Download,
  Search,
} from "lucide-react";
import { Page } from "@/shared/pages/Page/Page";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { useNavigate } from "react-router-dom";

import { DashboardHeaderStats } from "./items/DashboardHeaderStats";
import { DashboardFunnelOverview } from "./items/DashboardFunnelOverview";
import { UpcomingInterviewsWidget } from "./items/UpcomingInterviewsWidget";
import { RecentApplicationsTable } from "./items/RecentApplicationsTable";
import { TopJobsWidget } from "./items/TopJobsWidget";

import {
  MOCK_KPI_METRICS,
  MOCK_FUNNEL_STAGES,
  MOCK_TODAYS_INTERVIEWS,
  MOCK_RECENT_APPLICATIONS,
  MOCK_TOP_JOBS,
} from "./data/mockDashboardData";

import type { TimeframePeriod } from "./types/dashboard.types";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [timeframe, setTimeframe] = useState<TimeframePeriod>("30d");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle data filtering based on search query
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_RECENT_APPLICATIONS;
    const q = searchQuery.toLowerCase();
    return MOCK_RECENT_APPLICATIONS.filter(
      (app) =>
        app.candidateName.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.department.toLowerCase().includes(q) ||
        app.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleRefresh = () => {
    toast.success("Dashboard metrics refreshed with live recruitment data.");
  };

  const handleExportSummary = () => {
    toast.success("Exporting Dashboard Executive Summary (PDF)...");
  };

  return (
    <Page
      title="Executive Overview Dashboard"
      subtitle="Real-time recruitment performance, candidate pipeline velocity, upcoming interviews & AI ATS insights."
      breadcrumbs={[
        { label: "Overview", path: "/" },
        { label: "Dashboard", path: "/" },
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/80">
            {(["today", "7d", "30d", "quarter"] as TimeframePeriod[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all uppercase ${
                  timeframe === tf
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5 h-8 text-xs">
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportSummary} className="gap-1.5 h-8 text-xs">
            <Download size={13} />
            <span className="hidden sm:inline">Export Summary</span>
          </Button>
        </div>
      }
    >
      {/* 1. KPI Header Metric Cards */}
      <DashboardHeaderStats metrics={MOCK_KPI_METRICS} />

      {/* 3. Main Grid: Funnel Overview & Today's Scheduled Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardFunnelOverview funnelData={MOCK_FUNNEL_STAGES} />
        <UpcomingInterviewsWidget
          interviews={MOCK_TODAYS_INTERVIEWS}
          onNavigateToInterviews={() => navigate("/interviews/upcoming")}
        />
      </div>

      {/* 4. Filter Toolbar for Applications Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search candidate, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Showing {filteredApplications.length} recent applications</span>
        </div>
      </div>

      {/* 5. Second Grid: Recent Applications & Top Active Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentApplicationsTable
            applications={filteredApplications}
            onViewCandidate={() => navigate("/candidates/all")}
            onNavigateToApplications={() => navigate("/recruitment/applications")}
          />
        </div>
        <div className="lg:col-span-1">
          <TopJobsWidget jobs={MOCK_TOP_JOBS} />
        </div>
      </div>
    </Page>
  );
};

export default DashboardPage;

