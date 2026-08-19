import type { Candidate, CandidateStatus, CandidateStage } from "../../allcandidates/types/candidate.types";

export type ReadinessStatus = "Ready to Move" | "Exploring" | "Passive" | "Not Available";

export interface TalentPoolCategory {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
  color: "blue" | "purple" | "emerald" | "amber" | "rose" | "cyan" | "indigo";
  candidateCount: number;
  tags: string[];
  targetRoles: string[];
  owner: string;
  updatedDate: string;
  isStarred?: boolean;
}

export interface PooledCandidate extends Candidate {
  poolIds: string[]; // List of TalentPoolCategory IDs this candidate belongs to
  addedToPoolDate: string;
  readinessStatus: ReadinessStatus;
  matchScore: number; // Percentage 0-100
  aiSummary?: string;
  lastContactedDate?: string;
}

export interface TalentPoolFilterState {
  search: string;
  selectedPoolId: string; // "all" or specific pool ID
  readiness: string; // "All" or specific readiness
  experience: string; // "All" | "0-2" | "3-5" | "5-8" | "8+"
  minRating: number; // 0 to 5
  skillQuery: string;
}

export interface ActiveJobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  openPositions: number;
}
