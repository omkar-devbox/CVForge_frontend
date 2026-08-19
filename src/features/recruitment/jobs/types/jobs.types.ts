export type JobStatus = "Open" | "On Hold" | "Closed" | "Draft";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type ExperienceLevel = "Entry-Level" | "Mid-Level" | "Senior" | "Lead / Manager" | "Executive";

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  color?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface PostingChannel {
  id: string;
  name: string;
  iconName: string;
  status: "Published" | "Pending" | "Unpublished";
  publishedDate?: string;
  url?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryRange: string;
  status: JobStatus;
  applicationsCount: number;
  postedDate: string;
  daysOpen: number;
  hiringManager: TeamMember;
  teamMembers: TeamMember[];
  description: string;
  requirements: string[];
  benefits: string[];
  channels: PostingChannel[];
  pipelineStages: PipelineStage[];
}

export interface JobFilterState {
  search: string;
  status: string; // "All" | JobStatus
  department: string; // "All" | specific department
  location: string; // "All" | specific location
  employmentType: string; // "All" | specific type
}
