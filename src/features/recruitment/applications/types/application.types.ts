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

export interface CandidateNote {
  id: string;
  author: string;
  date: string;
  content: string;
  rating?: number;
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
  matchScore: number; // e.g. 92 for 92%
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
}
