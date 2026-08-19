export type TimeframePeriod = "today" | "7d" | "30d" | "quarter";

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  subtitle: string;
  iconName: string;
  colorTheme: "blue" | "emerald" | "purple" | "amber" | "indigo";
}

export interface FunnelStageData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TodayInterview {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  department: string;
  timeSlot: string;
  interviewType: "Technical" | "Behavioral" | "System Design" | "HR Round" | "Executive";
  interviewers: { name: string; avatar?: string }[];
  status: "Scheduled" | "In Progress" | "Completed" | "Rescheduled";
  meetLink?: string;
}

export interface RecentApplication {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  jobTitle: string;
  department: string;
  appliedDate: string;
  matchScore: number; // 0-100 AI ATS match percentage
  stage: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected";
  experienceYears: number;
  skills: string[];
}

export interface TopActiveJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Contract" | "Remote";
  applicantsCount: number;
  interviewsCount: number;
  daysActive: number;
  status: "Active" | "Urgent" | "Draft" | "Closed";
}

export interface AiInsightItem {
  id: string;
  type: "action" | "trend" | "warning" | "success";
  title: string;
  description: string;
  actionText?: string;
  targetPath?: string;
  badgeText: string;
}

export interface DashboardFilterState {
  timeframe: TimeframePeriod;
  department: string;
  searchQuery: string;
}

export interface QuickAddCandidateForm {
  name: string;
  email: string;
  phone: string;
  jobRole: string;
  experienceYears: number;
  source: string;
}

export interface QuickAddJobForm {
  title: string;
  department: string;
  location: string;
  type: string;
  salaryRange: string;
}
