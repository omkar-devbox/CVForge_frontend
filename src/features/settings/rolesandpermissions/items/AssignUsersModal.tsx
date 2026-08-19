import React, { useState } from "react";
import { X, UserPlus, Search, Check } from "lucide-react";
import type { Role, RoleUserSummary } from "../types/roles.types";
import { INITIAL_USERS } from "@/features/settings/users/data/mockUsersData";
import { toast } from "@/shared/ui/toast/hooks/useToast";

interface AssignUsersModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRoleUsers: (roleId: string, updatedUsers: RoleUserSummary[]) => void;
}

export const AssignUsersModal: React.FC<AssignUsersModalProps> = ({
  role,
  isOpen,
  onClose,
  onUpdateRoleUsers,
}) => {
  const [search, setSearch] = useState("");

  if (!isOpen || !role) return null;

  const currentAssignedIds = (role.assignedUsers || []).map((u) => u.id);

  const filteredAllUsers = INITIAL_USERS.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
  });

  const handleToggleUser = (user: typeof INITIAL_USERS[0]) => {
    const isAssigned = currentAssignedIds.includes(user.id);
    let updated: RoleUserSummary[];

    if (isAssigned) {
      updated = (role.assignedUsers || []).filter((u) => u.id !== user.id);
      toast.info(`Removed ${user.name} from ${role.name} role.`);
    } else {
      const newUser: RoleUserSummary = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        department: user.department,
        status: user.status as any,
      };
      updated = [...(role.assignedUsers || []), newUser];
      toast.success(`Assigned ${user.name} to ${role.name} role.`);
    }

    onUpdateRoleUsers(role.id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Assign Members to {role.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select organization team members to grant this role's permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members by name or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredAllUsers.map((user) => {
            const isAssigned = currentAssignedIds.includes(user.id);
            return (
              <div
                key={user.id}
                onClick={() => handleToggleUser(user)}
                className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isAssigned
                    ? "bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {user.email} • <span className="font-medium">{user.department}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isAssigned
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {isAssigned && <Check size={14} className="stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Total assigned: <span className="font-bold text-slate-900 dark:text-white">{role.userCount}</span> members
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
