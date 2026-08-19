import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import {
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Edit,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  Clock,
  Briefcase,
  X,
} from "lucide-react";
import type { User, UserRole, UserStatus, UsersFilterState } from "../types/users.types";

interface UsersTableProps {
  users: User[];
  selectedUserIds: string[];
  filters: UsersFilterState;
  onFilterChange: (updated: Partial<UsersFilterState>) => void;
  onSelectUser: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (user: User) => void;
  onEditUser: (user: User) => void;
  onResendInvite: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onBulkResendInvite: () => void;
  onBulkToggleStatus: (newStatus: UserStatus) => void;
  onBulkDelete: () => void;
}

const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case "Admin":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    case "Recruiter":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "Hiring Manager":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case "Interviewer":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "HR Specialist":
      return "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};

const getStatusBadge = (status: UserStatus) => {
  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    case "Pending Invite":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock size={11} />
          Pending Invite
        </span>
      );
    case "Inactive":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Inactive
        </span>
      );
    case "Suspended":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          Suspended
        </span>
      );
  }
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  selectedUserIds,
  filters,
  onFilterChange,
  onSelectUser,
  onSelectAll,
  onViewDetails,
  onEditUser,
  onResendInvite,
  onResetPassword,
  onToggleStatus,
  onDeleteUser,
  onBulkResendInvite,
  onBulkToggleStatus,
  onBulkDelete,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  const handleSelectionChange = useCallback(
    (newSelectedIds: (string | number)[]) => {
      const selectedStrIds = newSelectedIds.map(String);
      if (selectedStrIds.length === users.length && users.length > 0) onSelectAll(true);
      else if (selectedStrIds.length === 0) onSelectAll(false);
      else {
        users.forEach((u) => {
          const wasSelected = selectedUserIds.includes(u.id);
          const isNowSelected = selectedStrIds.includes(u.id);
          if (wasSelected !== isNowSelected) onSelectUser(u.id, isNowSelected);
        });
      }
    },
    [users, selectedUserIds, onSelectAll, onSelectUser]
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        label: "User Member",
        key: "name",
        sortable: true,
        render: (user) => {
          const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div className="flex items-center gap-3 py-1">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {initials}
                </div>
              )}
              <div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(user);
                  }}
                  className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "role",
        label: "Role",
        key: "role",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1.5 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Role
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Roles", value: "All" },
                { label: "Admin", value: "Admin" },
                { label: "Recruiter", value: "Recruiter" },
                { label: "Hiring Manager", value: "Hiring Manager" },
                { label: "Interviewer", value: "Interviewer" },
                { label: "HR Specialist", value: "HR Specialist" },
                { label: "Viewer", value: "Viewer" },
              ]}
              value={filters.role}
              onChange={(val: any) =>
                onFilterChange({ role: typeof val === "string" ? val : (val?.value ?? "All") })
              }
              fieldSize="sm"
            />
            {filters.role !== "All" && (
              <button
                type="button"
                onClick={() => onFilterChange({ role: "All" })}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (user) => (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getRoleBadgeStyle(
              user.role
            )}`}
          >
            {user.role}
          </span>
        ),
      },
      {
        id: "department",
        label: "Department",
        key: "department",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1.5 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Department
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Departments", value: "All" },
                { label: "Engineering", value: "Engineering" },
                { label: "Human Resources", value: "Human Resources" },
                { label: "Product & Design", value: "Product & Design" },
                { label: "Talent Acquisition", value: "Talent Acquisition" },
                { label: "Finance & Ops", value: "Finance & Ops" },
                { label: "Executive", value: "Executive" },
              ]}
              value={filters.department}
              onChange={(val: any) =>
                onFilterChange({ department: typeof val === "string" ? val : (val?.value ?? "All") })
              }
              fieldSize="sm"
            />
            {filters.department !== "All" && (
              <button
                type="button"
                onClick={() => onFilterChange({ department: "All" })}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (user) => (
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {user.department}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        key: "status",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1.5 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Status
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Statuses", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Pending Invite", value: "Pending Invite" },
                { label: "Inactive", value: "Inactive" },
              ]}
              value={filters.status}
              onChange={(val: any) =>
                onFilterChange({ status: typeof val === "string" ? val : (val?.value ?? "All") })
              }
              fieldSize="sm"
            />
            {filters.status !== "All" && (
              <button
                type="button"
                onClick={() => onFilterChange({ status: "All" })}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (user) => getStatusBadge(user.status),
      },
      {
        id: "twoFactorEnabled",
        label: "2FA Security",
        key: "twoFactorEnabled",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1.5 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by 2FA Status
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Security", value: "All" },
                { label: "2FA Enabled", value: "Enabled" },
                { label: "2FA Disabled", value: "Disabled" },
              ]}
              value={filters.twoFactor}
              onChange={(val: any) =>
                onFilterChange({ twoFactor: typeof val === "string" ? val : (val?.value ?? "All") })
              }
              fieldSize="sm"
            />
            {filters.twoFactor !== "All" && (
              <button
                type="button"
                onClick={() => onFilterChange({ twoFactor: "All" })}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (user) =>
          user.twoFactorEnabled ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} />
              Enabled
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <ShieldAlert size={14} className="text-amber-500" />
              Disabled
            </span>
          ),
      },
      {
        id: "actions",
        label: "Actions",
        key: "id",
        align: "right",
        headerAlign: "right",
        render: (user) => (
          <div
            className="flex items-center justify-end gap-1 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onViewDetails(user)}
              title="View Profile Details"
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => onEditUser(user)}
              title="Edit User"
              className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit size={15} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === user.id ? null : user.id);
                }}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical size={15} />
              </button>

              {activeMenuId === user.id && (
                <div className="absolute right-0 top-8 z-30 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 text-left divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onViewDetails(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Eye size={14} className="text-slate-400" />
                      View Full Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onEditUser(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <Edit size={14} className="text-slate-400" />
                      Edit Account & Role
                    </button>
                  </div>

                  <div className="py-1">
                    {user.status === "Pending Invite" && (
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          onResendInvite(user);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <Mail size={14} className="text-blue-500" />
                        Resend Invitation Email
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onResetPassword(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <KeyRound size={14} className="text-amber-500" />
                      Send Password Reset
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onToggleStatus(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      {user.status === "Active" ? (
                        <>
                          <UserX size={14} className="text-slate-400" />
                          Deactivate Account
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} className="text-emerald-500" />
                          Activate Account
                        </>
                      )}
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onDeleteUser(user);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                    >
                      <Trash2 size={14} />
                      Delete User Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [activeMenuId, filters, onFilterChange, onViewDetails, onEditUser, onResendInvite, onResetPassword, onToggleStatus, onDeleteUser]
  );

  const renderCard = useCallback(
    (user: User) => {
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
              )}
              <div>
                <h4
                  onClick={() => onViewDetails(user)}
                  className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-sm"
                >
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
            {getStatusBadge(user.status)}
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getRoleBadgeStyle(
                user.role
              )}`}
            >
              {user.role}
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">{user.department}</span>
          </div>
        </div>
      );
    },
    [onViewDetails]
  );

  return (
    <div className="space-y-4">
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl shadow-xs">
          <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="font-bold">{selectedUserIds.length}</span> user account
            {selectedUserIds.length > 1 ? "s" : ""} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBulkResendInvite}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Mail size={13} />
              <span>Resend Invites</span>
            </button>
            <button
              onClick={() => onBulkToggleStatus("Inactive")}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <UserX size={13} />
              <span>Deactivate</span>
            </button>
            <button
              onClick={onBulkDelete}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>

            <button
              onClick={() => onSelectAll(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-1"
              title="Clear selection"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <DataTable<User>
        data={users}
        columns={columns}
        getRowId={(user) => user.id}
        selectable={true}
        selection={selectedUserIds}
        onSelectionChange={handleSelectionChange}
        pageSize={10}
        hideToolbar={true}
        renderCard={renderCard}
      />
    </div>
  );
};
