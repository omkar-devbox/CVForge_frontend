export type ApplicationStage =
  | "Sourced"
  | "Screened"
  | "Interviewing"
  | "Offered"
  | "Hired"
  | "Rejected";

export type ApplicationStatus =
  | "Active"
  | "In Review"
  | "Shortlisted"
  | "On Hold"
  | "Hired"
  | "Rejected";

export type EligibilityStatus =
  | "Highly Qualified"
  | "Eligible"
  | "Partially Eligible"
  | "Under Review"
  | "Not Eligible";

export interface CandidateNote {
  id: string;
  author: string;
  date: string;
  content: string;
  rating?: number;
}

export interface EligibilityCriterion {
  criterion: string;
  status: "met" | "partially_met" | "unmet";
  details: string;
}

export interface ResumeMatchBreakdown {
  overallMatch: number; // 0 - 100
  skillsMatch: number; // 0 - 100
  experienceMatch: number; // 0 - 100
  educationMatch: number; // 0 - 100
  matchedSkills: string[];
  missingSkills?: string[];
  eligibilityCriteria?: EligibilityCriterion[];
  aiRecommendation?: string;
}

export interface CandidateApplication {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateAvatar?: string;
  jobId: string;
  jobTitle: string;
  department: string;
  location: string;
  stage: ApplicationStage;
  status: ApplicationStatus;
  appliedDate: string;
  experienceYears: number;
  education?: string;
  matchScore: number; // e.g. 92 for 92%
  eligibilityStatus?: EligibilityStatus;
  briefInfo?: string;
  matchBreakdown?: ResumeMatchBreakdown;
  currentCompany: string;
  currentRole: string;
  expectedSalary: string;
  noticePeriod: string;
  rating: number; // 1-5 scale
  resumeFileName?: string;
  summary?: string;
  skills: string[];
  tags: string[];
  notes: CandidateNote[];
}

export interface ApplicationFilterState {
  search: string;
  status: string;
  stage: string;
  jobTitle: string;
  department: string;
  matchTier?: string;
}

