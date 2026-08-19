import React, { useMemo, useCallback } from "react";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import {
  Users,
  Edit,
  Trash2,
  Eye,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import type {
  Role,
  RoleType,
  RoleStatus,
  RolesFilterState,
} from "../types/roles.types";

interface RolesTableProps {
  roles: Role[];
  selectedRoleIds: string[];
  filters: RolesFilterState;
  onFilterChange: (updated: Partial<RolesFilterState>) => void;
  onSelectRole: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (role: Role) => void;
  onEditRole: (role: Role) => void;
  onDuplicateRole: (role: Role) => void;
  onAssignUsers: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onBulkToggleStatus: (newStatus: RoleStatus) => void;
  onBulkDelete: () => void;
}

const getRoleTypeBadge = (type: RoleType) => {
  if (type === "System") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
        <Lock size={11} className="shrink-0" />
        System Role
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
      <Sparkles size={11} className="shrink-0" />
      Custom Role
    </span>
  );
};

const getStatusBadge = (status: RoleStatus) => {
  if (status === "Active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
      Inactive
    </span>
  );
};

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  selectedRoleIds,
  filters,
  onFilterChange,
  onSelectRole,
  onSelectAll,
  onViewDetails,
  onEditRole,
  onDuplicateRole,
  onAssignUsers,
  onDeleteRole,
  onBulkToggleStatus,
  onBulkDelete,
}) => {
  const handleSelectionChange = useCallback(
    (newSelectedIds: (string | number)[]) => {
      const selectedStrIds = newSelectedIds.map(String);
      if (selectedStrIds.length === roles.length && roles.length > 0) onSelectAll(true);
      else if (selectedStrIds.length === 0) onSelectAll(false);
      else {
        roles.forEach((r) => {
          const wasSelected = selectedRoleIds.includes(r.id);
          const isNowSelected = selectedStrIds.includes(r.id);
          if (wasSelected !== isNowSelected) onSelectRole(r.id, isNowSelected);
        });
      }
    },
    [roles, selectedRoleIds, onSelectAll, onSelectRole]
  );

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        id: "name",
        label: "Role Name & Code",
        key: "name",
        sortable: true,
        render: (role) => (
          <div className="py-1">
            <div className="flex items-center gap-2">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(role);
                }}
                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              >
                {role.name}
              </span>
              <code className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                {role.code}
              </code>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">
              {role.description}
            </p>
          </div>
        ),
      },
      {
        id: "type",
        label: "Role Type",
        key: "type",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1.5 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Role Type
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Types", value: "All" },
                { label: "System Role", value: "System" },
                { label: "Custom Role", value: "Custom" },
              ]}
              value={filters.type}
              onChange={(val: any) =>
                onFilterChange({ type: typeof val === "string" ? val : (val?.value ?? "All") })
              }
              fieldSize="sm"
            />
            {filters.type !== "All" && (
              <button
                type="button"
                onClick={() => onFilterChange({ type: "All" })}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        render: (role) => getRoleTypeBadge(role.type),
      },
      {
        id: "userCount",
        label: "Assigned Users",
        key: "userCount",
        sortable: true,
        render: (role) => {
          const usersList = role.assignedUsers || [];
          return (
            <div className="flex items-center gap-2 py-1">
              <div className="flex -space-x-1.5 overflow-hidden">
                {usersList.slice(0, 3).map((u, idx) => (
                  u.avatar ? (
                    <img
                      key={u.id || idx}
                      src={u.avatar}
                      alt={u.name}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                    />
                  ) : (
                    <div
                      key={u.id || idx}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900 text-[9px] font-bold text-slate-700 dark:text-slate-200"
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                  )
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignUsers(role);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Users size={12} />
                <span>{role.userCount} Member{role.userCount !== 1 ? "s" : ""}</span>
              </button>
            </div>
          );
        },
      },
      {
        id: "status",
        label: "Status",
        key: "status",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1.5 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Status
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Statuses", value: "All" },
                { label: "Active", value: "Active" },
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
        render: (role) => getStatusBadge(role.status),
      },
      {
        id: "actions",
        label: "Actions",
        key: "id",
        sortable: false,
        render: (role) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {/* View Role & Permissions Screen */}
            <button
              onClick={() => onViewDetails(role)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              title="View Role & Permissions Details"
            >
              <Eye size={16} />
            </button>

            {/* Edit / Update Role */}
            <button
              onClick={() => onEditRole(role)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              title="Edit / Update Role Permissions"
            >
              <Edit size={16} />
            </button>

            {/* Delete Custom Role */}
            {!role.isSystemRole ? (
              <button
                onClick={() => onDeleteRole(role)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Delete Custom Role"
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <span
                className="p-1.5 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                title="System role cannot be deleted"
              >
                <Trash2 size={16} />
              </span>
            )}
          </div>
        ),
      },
    ],
    [
      filters,
      onFilterChange,
      onViewDetails,
      onEditRole,
      onDeleteRole,
    ]
  );

  return (
    <div className="space-y-4">
      {/* Bulk Action Toolbar */}
      {selectedRoleIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium text-blue-900 dark:text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>{selectedRoleIds.length} role{selectedRoleIds.length > 1 ? "s" : ""} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkToggleStatus("Active")}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 size={13} />
              Set Active
            </button>
            <button
              onClick={() => onBulkToggleStatus("Inactive")}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <XCircle size={13} />
              Set Inactive
            </button>
            <button
              onClick={onBulkDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 size={13} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Main DataTable */}
      <DataTable<Role>
        data={roles}
        columns={columns}
        getRowId={(role) => role.id}
        selectable={true}
        selection={selectedRoleIds}
        onSelectionChange={handleSelectionChange}
        pageSize={10}
        hideToolbar={true}
      />
    </div>
  );
};
