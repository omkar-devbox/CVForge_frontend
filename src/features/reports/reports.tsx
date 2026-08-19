import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Filter,
  DollarSign,
  Clock,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Page } from "@/shared/pages/Page/Page";
import { toast } from "@/shared/ui/toast";
import { ReportsHeaderStats } from "./items/ReportsHeaderStats";
import { ReportsFilters } from "./items/ReportsFilters";
import { AiReportsInsights } from "./items/AiReportsInsights";
import { RecruitmentFunnelChart } from "./items/RecruitmentFunnelChart";
import { SourcingChannelRoiTable } from "./items/SourcingChannelRoiTable";
import { TimeToHireChart } from "./items/TimeToHireChart";
import { ScheduledReportsTable } from "./items/ScheduledReportsTable";
import { GenerateCustomReportModal } from "./items/GenerateCustomReportModal";
import { ReportDetailsModal } from "./items/ReportDetailsModal";

import {
  INITIAL_KPI_METRICS,
  INITIAL_FUNNEL_STAGES,
  INITIAL_SOURCING_CHANNELS,
  INITIAL_DEPT_TIME_TO_HIRE,
  INITIAL_SCHEDULED_REPORTS,
  INITIAL_AI_INSIGHTS,
} from "./data/mockReportsData";

import type {
  ReportsFilterState,
  ScheduledReport,
  CreateCustomReportParams,
} from "./types/reports.types";

export const ReportsPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<"overview" | "velocity" | "scheduled">("overview");
  const [kpiMetrics] = useState(INITIAL_KPI_METRICS);
  const [funnelStages] = useState(INITIAL_FUNNEL_STAGES);
  const [sourcingChannels] = useState(INITIAL_SOURCING_CHANNELS);
  const [deptTimeToHire] = useState(INITIAL_DEPT_TIME_TO_HIRE);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(INITIAL_SCHEDULED_REPORTS);
  const [aiInsights] = useState(INITIAL_AI_INSIGHTS);

  // Filters State
  const [filters, setFilters] = useState<ReportsFilterState>({
    timeframe: "30d",
    department: "All",
    location: "All Locations",
    search: "",
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<ScheduledReport | null>(null);

  // Handle filter updates
  const handleFilterChange = (updated: Partial<ReportsFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // Filter scheduled reports
  const filteredReports = useMemo(() => {
    return scheduledReports.filter((report) => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesTitle = report.title.toLowerCase().includes(q);
        const matchesDesc = report.description.toLowerCase().includes(q);
        const matchesCat = report.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [scheduledReports, filters.search]);

  // Handlers
  const handleRefresh = () => {
    toast.success("Analytics data refreshed successfully!");
  };

  const handleExportData = (format: "CSV" | "PDF") => {
    toast.success(`Exporting recruitment analytics summary as ${format}...`);
  };

  const handleCreateReport = (params: CreateCustomReportParams) => {
    const newReport: ScheduledReport = {
      id: `rep-${Date.now()}`,
      title: params.title,
      category: params.category,
      frequency: params.frequency,
      format: params.format,
      lastGenerated: new Date().toISOString().split("T")[0],
      nextRunDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      recipientCount: params.recipients ? params.recipients.split(",").length : 1,
      status: "Active",
      downloadUrl: "#",
      fileSize: "1.5 MB",
      createdBy: {
        name: "Current User",
        email: "user@systemmechatronics.com",
      },
      description: params.description || `Custom ${params.category} report for ${params.department} scope.`,
    };

    setScheduledReports((prev) => [newReport, ...prev]);
    toast.success(`Custom report "${params.title}" created & scheduled successfully!`);
  };

  const handleRunNow = (report: ScheduledReport) => {
    toast.info(`Executing on-demand report run for "${report.title}"...`);
    setTimeout(() => {
      toast.success(`Report "${report.title}" generated successfully!`);
    }, 1200);
  };

  const handleDownload = (report: ScheduledReport) => {
    toast.success(`Downloading ${report.format} document: ${report.title}`);
  };

  const handleDeleteReport = (id: string) => {
    setScheduledReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Report schedule removed.");
  };

  return (
    <Page
      title="Reports & Hiring Analytics"
      subtitle="Comprehensive metrics, pipeline conversion funnels, sourcing channel ROI, and scheduled executive reports."
      breadcrumbs={[
        { label: "Management", path: "/reports" },
        { label: "Reports & Analytics", path: "/reports" },
      ]}
    >
      {/* Header KPI Metric Cards */}
      <ReportsHeaderStats metrics={kpiMetrics} />

      {/* Filter & Action Toolbar */}
      <ReportsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onExport={handleExportData}
      />

      {/* AI Hiring Insights Banner */}
      <AiReportsInsights insights={aiInsights} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Filter size={15} />
          <span>Pipeline & Sourcing ROI</span>
        </button>

        <button
          onClick={() => setActiveTab("velocity")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === "velocity"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Clock size={15} />
          <span>Time-to-Hire Velocity</span>
        </button>

        <button
          onClick={() => setActiveTab("scheduled")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === "scheduled"
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FileText size={15} />
          <span>Scheduled & Downloadable Reports ({scheduledReports.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <RecruitmentFunnelChart stages={funnelStages} />
          <SourcingChannelRoiTable channels={sourcingChannels} />
        </div>
      )}

      {activeTab === "velocity" && (
        <div className="space-y-6">
          <TimeToHireChart departments={deptTimeToHire} />
          <RecruitmentFunnelChart stages={funnelStages} />
        </div>
      )}

      {activeTab === "scheduled" && (
        <ScheduledReportsTable
          reports={filteredReports}
          onViewDetails={(report) => setSelectedReportDetail(report)}
          onRunNow={handleRunNow}
          onDownload={handleDownload}
          onDelete={handleDeleteReport}
        />
      )}

      {/* Custom Report Creation Modal */}
      <GenerateCustomReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
      />

      {/* Report Preview Modal */}
      <ReportDetailsModal
        report={selectedReportDetail}
        isOpen={!!selectedReportDetail}
        onClose={() => setSelectedReportDetail(null)}
        onDownload={handleDownload}
      />
    </Page>
  );
};

export default ReportsPage;
