export type ReportTimeframe = "7d" | "30d" | "90d" | "ytd" | "custom";
export type ReportDepartment = "All" | "Engineering" | "Product" | "Sales" | "Marketing" | "Design" | "HR & Ops";
export type ReportFormat = "PDF" | "CSV" | "XLSX";
export type ReportFrequency = "One-time" | "Daily" | "Weekly" | "Monthly" | "Quarterly";
export type ReportStatus = "Active" | "Scheduled" | "Completed" | "Processing";

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  unit?: string;
  change: string;
  isPositive: boolean;
  trendPeriod: string;
  description: string;
  iconName: "Users" | "TrendingUp" | "Clock" | "CheckCircle" | "Briefcase" | "DollarSign";
}

export interface FunnelStage {
  id: string;
  stageName: string;
  count: number;
  conversionRate: number; // percentage from previous stage
  overallConversion: number; // percentage from initial sourced
  avgDaysInStage: number;
  color: string;
}

export interface SourcingChannel {
  id: string;
  channelName: string;
  applicantsCount: number;
  hiredCount: number;
  yieldRate: number; // percentage hired / applicants
  avgCostPerHire: number;
  avgTimeDays: number;
  rating: number; // 1-5 scale score
}

export interface DepartmentTimeToHire {
  id: string;
  department: string;
  avgDaysToHire: number;
  benchmarkDays: number;
  openPositionsCount: number;
  hiredThisQuarter: number;
}

export interface ScheduledReport {
  id: string;
  title: string;
  category: "Pipeline & Funnel" | "Sourcing & ROI" | "Time to Hire" | "Interviews & Scorecards" | "Diversity & EEO";
  frequency: ReportFrequency;
  format: ReportFormat;
  lastGenerated: string;
  nextRunDate: string;
  recipientCount: number;
  status: ReportStatus;
  downloadUrl?: string;
  fileSize?: string;
  createdBy: {
    name: string;
    avatar?: string;
    email: string;
  };
  description: string;
}

export interface AiInsightItem {
  id: string;
  type: "positive" | "warning" | "opportunity" | "info";
  title: string;
  summary: string;
  actionableSuggestion?: string;
  metricImpact?: string;
}

export interface ReportsFilterState {
  timeframe: ReportTimeframe;
  department: ReportDepartment;
  location: string;
  search: string;
}

export interface CreateCustomReportParams {
  title: string;
  category: ScheduledReport["category"];
  frequency: ReportFrequency;
  format: ReportFormat;
  department: ReportDepartment;
  timeframe: ReportTimeframe;
  recipients: string;
  description: string;
  includeAiSummary: boolean;
  includeFunnelData: boolean;
  includeSourcingRoi: boolean;
  includeTimeToHire: boolean;
}
