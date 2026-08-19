export type RoleType = "System" | "Custom";
export type RoleStatus = "Active" | "Inactive" | "Draft";

export type PermissionCategoryName =
  | "Candidate Management"
  | "Job Requisitions"
  | "Interview & Evaluation"
  | "Talent Pool & Sourcing"
  | "Reports & Analytics"
  | "System & Security"
  | "User & Access Control";

export interface PermissionItem {
  id: string;
  key: string;
  name: string;
  description: string;
  category: PermissionCategoryName;
  defaultEnabled?: boolean;
}

export interface PermissionCategoryGroup {
  category: PermissionCategoryName;
  description: string;
  permissions: PermissionItem[];
}

export interface RoleAuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface RoleUserSummary {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  status: "Active" | "Pending Invite" | "Inactive";
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string;
  type: RoleType;
  status: RoleStatus;
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Record<string, boolean>; // permission key -> enabled boolean
  assignedUsers?: RoleUserSummary[];
  auditLogs?: RoleAuditLog[];
}

export interface RolesFilterState {
  search: string;
  type: RoleType | "All";
  status: RoleStatus | "All";
}

export interface RoleMetrics {
  totalRoles: number;
  systemRolesCount: number;
  customRolesCount: number;
  activeMembersAssigned: number;
  totalPermissionsAvailable: number;
}

export interface CreateRoleParams {
  name: string;
  code: string;
  description: string;
  status: RoleStatus;
  cloneFromRoleId?: string;
  permissions: Record<string, boolean>;
}

export interface EditRoleParams {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  permissions: Record<string, boolean>;
}
