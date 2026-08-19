export type UserRole =
  | "Admin"
  | "Recruiter"
  | "Hiring Manager"
  | "Interviewer"
  | "HR Specialist"
  | "Viewer";

export type UserStatus = "Active" | "Pending Invite" | "Inactive" | "Suspended";

export type Department =
  | "Engineering"
  | "Human Resources"
  | "Product & Design"
  | "Talent Acquisition"
  | "Finance & Ops"
  | "Executive";

export interface UserPermission {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
}

export interface UserActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  device?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: Department;
  status: UserStatus;
  lastActive: string;
  dateAdded: string;
  phone?: string;
  location?: string;
  twoFactorEnabled: boolean;
  assignedJobsCount: number;
  interviewsConducted: number;
  permissionsCount: number;
  activityLogs?: UserActivityLog[];
}

export interface UsersFilterState {
  search: string;
  role: UserRole | "All";
  status: UserStatus | "All";
  department: Department | "All";
  twoFactor: "All" | "Enabled" | "Disabled";
}

export interface UserHeaderMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingInvites: number;
  twoFactorRate: number;
  adminCount: number;
}

export interface CreateUserParams {
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  phone?: string;
  sendInviteEmail: boolean;
  notes?: string;
}

export interface EditUserParams {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  status: UserStatus;
  phone?: string;
  twoFactorEnabled: boolean;
}
