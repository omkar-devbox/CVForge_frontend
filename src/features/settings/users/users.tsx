import React, { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";
import { Page } from "@/shared/pages/Page/Page";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast/hooks/useToast";

import { UsersTable } from "./items/UsersTable";
import { AddUserModal } from "./items/AddUserModal";
import { EditUserModal } from "./items/EditUserModal";
import { UserDetailsModal } from "./items/UserDetailsModal";

import { INITIAL_USERS } from "./data/mockUsersData";

import type {
  User,
  UsersFilterState,
  CreateUserParams,
  EditUserParams,
  UserStatus,
} from "./types/users.types";

export const UsersPage: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Filters State
  const [filters, setFilters] = useState<UsersFilterState>({
    search: "",
    role: "All",
    status: "All",
    department: "All",
    twoFactor: "All",
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesDept = u.department.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept) return false;
      }

      // Role filter
      if (filters.role !== "All" && u.role !== filters.role) return false;

      // Status dropdown filter
      if (filters.status !== "All" && u.status !== filters.status) return false;

      // Department filter
      if (filters.department !== "All" && u.department !== filters.department) return false;

      // 2FA Filter
      if (filters.twoFactor === "Enabled" && !u.twoFactorEnabled) return false;
      if (filters.twoFactor === "Disabled" && u.twoFactorEnabled) return false;

      return true;
    });
  }, [users, filters]);

  // Selection Handlers
  const handleSelectUser = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedUserIds((prev) => [...prev, id]);
    } else {
      setSelectedUserIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  // Filter state update
  const handleFilterChange = (updated: Partial<UsersFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // User Actions
  const handleAddUser = (params: CreateUserParams) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: params.name,
      email: params.email,
      role: params.role,
      department: params.department,
      phone: params.phone,
      status: params.sendInviteEmail ? "Pending Invite" : "Active",
      lastActive: params.sendInviteEmail ? "Never" : "Just now",
      dateAdded: new Date().toISOString().split("T")[0],
      twoFactorEnabled: false,
      assignedJobsCount: 0,
      interviewsConducted: 0,
      permissionsCount: 12,
    };

    setUsers((prev) => [newUser, ...prev]);

    if (params.sendInviteEmail) {
      toast.success(`Invitation email sent to ${params.email} with role ${params.role}!`);
    } else {
      toast.success(`User account "${params.name}" created successfully.`);
    }
  };

  const handleEditUserSubmit = (params: EditUserParams) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === params.id ? { ...u, ...params } : u))
    );
    toast.success(`Account details for "${params.name}" updated successfully.`);
  };

  const handleResendInvite = (user: User) => {
    toast.success(`Re-sent invitation email to ${user.email}. Link valid for 48 hours.`);
  };

  const handleResetPassword = (user: User) => {
    toast.info(`Password reset link sent to ${user.email}.`);
  };

  const handleToggleStatus = (user: User) => {
    const newStatus: UserStatus = user.status === "Active" ? "Inactive" : "Active";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    toast.success(`User "${user.name}" status changed to ${newStatus}.`);
  };

  const handleDeleteUser = (user: User) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
    toast.success(`User account "${user.name}" removed from organization.`);
  };

  // Bulk Operations
  const handleBulkResendInvite = () => {
    const pendingCount = users
      .filter((u) => selectedUserIds.includes(u.id) && u.status === "Pending Invite")
      .length;
    toast.success(`Re-sent invitation emails to ${pendingCount || selectedUserIds.length} users.`);
    setSelectedUserIds([]);
  };

  const handleBulkToggleStatus = (newStatus: UserStatus) => {
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: newStatus } : u))
    );
    toast.success(`Updated status of ${selectedUserIds.length} user accounts to ${newStatus}.`);
    setSelectedUserIds([]);
  };

  const handleBulkDelete = () => {
    setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
    toast.success(`Deleted ${selectedUserIds.length} user accounts.`);
    setSelectedUserIds([]);
  };

  return (
    <Page
      title="User Management & Accounts"
      subtitle="Manage organization team members, assign role-based access permissions, invite users, and monitor security health."
      breadcrumbs={[
        { label: "Settings", path: "/settings/users" },
        { label: "User Management", path: "/settings/users" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Search users..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-2xs"
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
          <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs shrink-0 rounded-lg px-4"
          >
            Add / Invite User
          </Button>
        </div>
      }
    >
      {/* Interactive Datatable */}
      <UsersTable
        users={filteredUsers}
        selectedUserIds={selectedUserIds}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onViewDetails={(u) => setViewingUser(u)}
        onEditUser={(u) => setEditingUser(u)}
        onResendInvite={handleResendInvite}
        onResetPassword={handleResetPassword}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        onBulkResendInvite={handleBulkResendInvite}
        onBulkToggleStatus={handleBulkToggleStatus}
        onBulkDelete={handleBulkDelete}
      />

      {/* Add / Invite User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditUserSubmit}
      />

      {/* View User Details Drawer */}
      <UserDetailsModal
        user={viewingUser}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={(u) => {
          setViewingUser(null);
          setEditingUser(u);
        }}
        onResendInvite={handleResendInvite}
        onResetPassword={handleResetPassword}
      />
    </Page>
  );
};

export default UsersPage;
