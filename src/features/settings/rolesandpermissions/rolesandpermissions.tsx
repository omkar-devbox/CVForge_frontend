import React, { useState, useMemo } from "react";
import { Plus, Search, X, Shield, Lock, Sparkles, Users, SlidersHorizontal } from "lucide-react";
import { Page } from "@/shared/pages/Page/Page";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast/hooks/useToast";

import { RolesTable } from "./items/RolesTable";
import { PermissionMatrixView } from "./items/PermissionMatrixView";
import { AddRoleModal } from "./items/AddRoleModal";
import { EditRoleModal } from "./items/EditRoleModal";
import { RoleDetailsModal } from "./items/RoleDetailsModal";
import { AssignUsersModal } from "./items/AssignUsersModal";

import { INITIAL_ROLES } from "./data/mockRolesData";
import type {
  Role,
  RolesFilterState,
  CreateRoleParams,
  EditRoleParams,
  RoleStatus,
  RoleUserSummary,
} from "./types/roles.types";

export const RolesAndPermissionsPage: React.FC = () => {
  // State
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"directory" | "matrix">("directory");

  // Filters State
  const [filters, setFilters] = useState<RolesFilterState>({
    search: "",
    type: "All",
    status: "All",
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [assigningUsersRole, setAssigningUsersRole] = useState<Role | null>(null);

  // Metrics summary
  const metrics = useMemo(() => {
    const totalRoles = roles.length;
    const systemRolesCount = roles.filter((r) => r.isSystemRole).length;
    const customRolesCount = roles.filter((r) => !r.isSystemRole).length;
    const activeMembersAssigned = roles.reduce((acc, r) => acc + r.userCount, 0);

    return {
      totalRoles,
      systemRolesCount,
      customRolesCount,
      activeMembersAssigned,
    };
  }, [roles]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      // Search query filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCode = r.code.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }

      // Type filter
      if (filters.type !== "All" && r.type !== filters.type) return false;

      // Status filter
      if (filters.status !== "All" && r.status !== filters.status) return false;

      return true;
    });
  }, [roles, filters]);

  // Selection Handlers
  const handleSelectRole = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRoleIds((prev) => [...prev, id]);
    } else {
      setSelectedRoleIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRoleIds(filteredRoles.map((r) => r.id));
    } else {
      setSelectedRoleIds([]);
    }
  };

  // Filter Updates
  const handleFilterChange = (updated: Partial<RolesFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // Add Custom Role Handler
  const handleAddRole = (params: CreateRoleParams) => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      code: params.code,
      name: params.name,
      description: params.description,
      type: "Custom",
      status: params.status,
      userCount: 0,
      isSystemRole: false,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      permissions: params.permissions,
      assignedUsers: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: "Role created",
          performedBy: "Current Administrator",
          timestamp: new Date().toLocaleString(),
          details: `Created custom role with ${Object.values(params.permissions).filter(Boolean).length} permissions.`,
        },
      ],
    };

    setRoles((prev) => [newRole, ...prev]);
    toast.success(`Custom role "${params.name}" created successfully.`);
  };

  // Edit Role Handler
  const handleEditRoleSubmit = (params: EditRoleParams) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === params.id
          ? {
              ...r,
              name: params.name,
              description: params.description,
              status: params.status,
              permissions: params.permissions,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
    toast.success(`Role matrix for "${params.name}" updated successfully.`);
  };

  // Duplicate Role
  const handleDuplicateRole = (targetRole: Role) => {
    const duplicatedRole: Role = {
      ...targetRole,
      id: `role-${Date.now()}`,
      code: `${targetRole.code}_copy`,
      name: `${targetRole.name} (Copy)`,
      type: "Custom",
      isSystemRole: false,
      userCount: 0,
      assignedUsers: [],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setRoles((prev) => [duplicatedRole, ...prev]);
    toast.success(`Duplicated "${targetRole.name}" into a new custom role.`);
  };

  // Toggle single permission directly in matrix or table
  const handleTogglePermission = (roleId: string, permKey: string, newValue: boolean) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [permKey]: newValue,
              },
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
  };

  // Update Users assigned to role
  const handleUpdateRoleUsers = (roleId: string, updatedUsers: RoleUserSummary[]) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? {
              ...r,
              assignedUsers: updatedUsers,
              userCount: updatedUsers.length,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );
    if (viewingRole?.id === roleId) {
      setViewingRole((prev) => (prev ? { ...prev, assignedUsers: updatedUsers, userCount: updatedUsers.length } : null));
    }
  };

  // Delete Custom Role
  const handleDeleteRole = (roleToDelete: Role) => {
    if (roleToDelete.isSystemRole) {
      toast.error("System roles cannot be deleted.");
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
    setSelectedRoleIds((prev) => prev.filter((id) => id !== roleToDelete.id));
    toast.success(`Custom role "${roleToDelete.name}" deleted.`);
  };

  // Bulk Operations
  const handleBulkToggleStatus = (newStatus: RoleStatus) => {
    setRoles((prev) =>
      prev.map((r) => (selectedRoleIds.includes(r.id) ? { ...r, status: newStatus } : r))
    );
    toast.success(`Updated status of ${selectedRoleIds.length} roles to ${newStatus}.`);
    setSelectedRoleIds([]);
  };

  const handleBulkDelete = () => {
    const systemRoleSelected = roles.some((r) => selectedRoleIds.includes(r.id) && r.isSystemRole);
    if (systemRoleSelected) {
      toast.error("Selection includes System Roles. Only Custom Roles will be deleted.");
    }
    setRoles((prev) => prev.filter((r) => !selectedRoleIds.includes(r.id) || r.isSystemRole));
    toast.success("Deleted selected custom roles.");
    setSelectedRoleIds([]);
  };

  return (
    <Page
      title="Roles & Permissions"
      subtitle="Manage role-based access control (RBAC), permission matrices, and security privileges across organization accounts."
      breadcrumbs={[
        { label: "Settings", path: "/settings/users" },
        { label: "Roles & Permissions", path: "/settings/roles-permissions" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative w-48 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Search roles..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange({ search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Custom Role Button */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs shrink-0 rounded-lg px-4"
          >
            Add Custom Role
          </Button>
        </div>
      }
    >
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Total Configured Roles
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics.totalRoles}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Lock size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Built-in System Roles
            </span>
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.systemRolesCount}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Custom Created Roles
            </span>
            <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
              {metrics.customRolesCount}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
              Protected Organization Members
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.activeMembersAssigned}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Sub-Navigation */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "directory"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          Roles Directory
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "matrix"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Permission Matrix
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "directory" ? (
        <RolesTable
          roles={filteredRoles}
          selectedRoleIds={selectedRoleIds}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSelectRole={handleSelectRole}
          onSelectAll={handleSelectAll}
          onViewDetails={(role) => setViewingRole(role)}
          onEditRole={(role) => setEditingRole(role)}
          onDuplicateRole={handleDuplicateRole}
          onAssignUsers={(role) => setAssigningUsersRole(role)}
          onDeleteRole={handleDeleteRole}
          onBulkToggleStatus={handleBulkToggleStatus}
          onBulkDelete={handleBulkDelete}
        />
      ) : (
        <PermissionMatrixView
          roles={filteredRoles}
          onTogglePermission={handleTogglePermission}
        />
      )}

      {/* Modals & Drawers */}
      <AddRoleModal
        isOpen={isAddModalOpen}
        existingRoles={roles}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRole}
      />

      <EditRoleModal
        role={editingRole}
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        onSubmit={handleEditRoleSubmit}
      />

      <RoleDetailsModal
        role={viewingRole}
        isOpen={!!viewingRole}
        onClose={() => setViewingRole(null)}
        onEdit={(role) => {
          setViewingRole(null);
          setEditingRole(role);
        }}
        onDuplicate={handleDuplicateRole}
        onAssignUsers={(role) => {
          setViewingRole(null);
          setAssigningUsersRole(role);
        }}
      />

      <AssignUsersModal
        role={assigningUsersRole}
        isOpen={!!assigningUsersRole}
        onClose={() => setAssigningUsersRole(null)}
        onUpdateRoleUsers={handleUpdateRoleUsers}
      />
    </Page>
  );
};

export default RolesAndPermissionsPage;
