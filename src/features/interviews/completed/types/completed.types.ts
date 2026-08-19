import type { InterviewRound, Interviewer } from "../../upcoming/types/upcoming.types";

export type RecommendationType = "Strong Hire" | "Hire" | "Hold" | "Reject";

export interface InterviewerScorecard {
  id: string;
  interviewerId: string;
  interviewerName: string;
  interviewerRole: string;
  rating: number; // 1-5
  recommendation: RecommendationType;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  comments: string;
  submittedAt: string;
}

export interface CompletedInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateAvatar?: string;
  candidateRole: string;
  jobId: string;
  jobTitle: string;
  department: string;
  round: InterviewRound;
  completedDate: string; // YYYY-MM-DD
  durationMinutes: number;
  overallRating: number; // 1-5 avg
  recommendation: RecommendationType;
  interviewers: Interviewer[];
  scorecards: InterviewerScorecard[];
  aiSummary?: string;
  resumeFileName?: string;
  finalOutcome?: "Hired" | "Rejected" | "Advanced to Next Round" | "Under Review";
  createdAt: string;
}

export interface CompletedFilterState {
  search: string;
  recommendation: string;
  round: string;
  finalOutcome: string;
}
