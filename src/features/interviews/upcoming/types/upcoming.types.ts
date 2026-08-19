export type InterviewStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Rescheduled"
  | "Cancelled"
  | "Pending Feedback";

export type InterviewRound =
  | "Screening"
  | "Technical Round 1"
  | "Technical Round 2"
  | "System Design"
  | "Culture Fit"
  | "Final HR";

export type InterviewMode =
  | "Google Meet"
  | "Zoom"
  | "Microsoft Teams"
  | "In-Person";

export interface Interviewer {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface InterviewFeedback {
  id: string;
  interviewerId: string;
  interviewerName: string;
  rating: number; // 1-5
  recommendation: "Strong Hire" | "Hire" | "Hold" | "Reject";
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  comments: string;
  createdAt: string;
}

export interface UpcomingInterview {
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
  status: InterviewStatus;
  mode: InterviewMode;
  meetingLink?: string;
  location?: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:00 AM"
  durationMinutes: number;
  interviewers: Interviewer[];
  notes?: string;
  aiMatchScore?: number;
  resumeFileName?: string;
  feedbacks?: InterviewFeedback[];
  createdAt: string;
}

export interface InterviewFilterState {
  search: string;
  status: string;
  round: string;
  mode: string;
  dateFilter: "all" | "today" | "tomorrow" | "this_week";
}
