export type CandidateStatus =
  | "Active"
  | "In Pipeline"
  | "Interviewing"
  | "Hired"
  | "Archived"
  | "Blacklisted";

export type CandidateStage =
  | "New"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export interface CandidateNote {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  date: string;
}

export interface CandidateApplicationHistory {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  appliedDate: string;
  stage: CandidateStage;
  status: CandidateStatus;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  currentRole: string;
  company: string;
  experienceYears: number;
  location: string;
  skills: string[];
  primarySkill: string;
  overallProfile?: string;
  highestDegree: string;
  status: CandidateStatus;
  stage: CandidateStage;
  source: string;
  appliedJobTitle?: string;
  rating: number; // 1 to 5
  noticePeriod: string; // e.g. "Immediate", "15 Days", "30 Days", "60 Days"
  currentSalary?: string;
  expectedSalary?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  downloadUrl?: string;
  tags: string[];
  createdAt: string;
  lastActivity: string;
  notes: CandidateNote[];
  note?: string;
  applicationHistory: CandidateApplicationHistory[];
}

export interface CandidateFilterState {
  search: string;
  status: string;
  stage: string;
  experience: string;
  noticePeriod: string;
  source: string;
}
