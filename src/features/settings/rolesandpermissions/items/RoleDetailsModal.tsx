import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Lock,
  Users,
  Clock,
  Edit,
  CheckCircle2,
  XCircle,
  Copy,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Role } from "../types/roles.types";
import { PERMISSION_CATEGORIES, ALL_PERMISSIONS_LIST } from "../data/mockRolesData";

interface RoleDetailsModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onAssignUsers: (role: Role) => void;
}

export const RoleDetailsModal: React.FC<RoleDetailsModalProps> = ({
  role,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onAssignUsers,
}) => {
  const [activeTab, setActiveTab] = useState<"permissions" | "users" | "audit">("permissions");

  if (!isOpen || !role) return null;

  const enabledKeys = Object.entries(role.permissions)
    .filter(([_, enabled]) => enabled)
    .map(([k]) => k);

  const totalPermsCount = ALL_PERMISSIONS_LIST.length;
  const percentage = Math.round((enabledKeys.length / totalPermsCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Drawer Banner Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 space-y-4 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg">
                    {role.name}
                  </h2>
                  <code className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {role.code}
                  </code>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {role.isSystemRole ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      <Lock size={11} /> System Role
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      <Sparkles size={11} /> Custom Role
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {role.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDuplicate(role)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Copy size={13} />
                Duplicate
              </button>
              <button
                onClick={() => onEdit(role)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Edit size={13} />
                Edit Matrix
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {role.description}
          </p>

          {/* Quick Metrics Header */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 block">Permissions Enabled</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {enabledKeys.length} <span className="text-xs font-normal text-slate-500">/ {totalPermsCount} ({percentage}%)</span>
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 block">Assigned Members</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                {role.userCount} Users
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 block">Last Modified</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
                {role.updatedAt}
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 -mb-6">
            <button
              onClick={() => setActiveTab("permissions")}
              className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "permissions"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Layers size={14} />
              Permissions Matrix ({enabledKeys.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Users size={14} />
              Assigned Members ({role.userCount})
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "audit"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Clock size={14} />
              Audit Log
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "permissions" && (
            <div className="space-y-6">
              {PERMISSION_CATEGORIES.map((catGroup) => {
                const groupPerms = catGroup.permissions;
                const activeInGroup = groupPerms.filter((p) => role.permissions[p.key]);

                return (
                  <div key={catGroup.category} className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        {catGroup.category}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {activeInGroup.length} of {groupPerms.length} enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {groupPerms.map((p) => {
                        const isEnabled = !!role.permissions[p.key];
                        return (
                          <div
                            key={p.key}
                            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                              isEnabled
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                                : "bg-slate-50/40 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-400 opacity-60"
                            }`}
                          >
                            {isEnabled ? (
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                              <code className="text-[10px] text-slate-400 font-mono">{p.key}</code>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Users assigned to <span className="font-bold text-slate-900 dark:text-white">{role.name}</span> role:
                </p>
                <button
                  onClick={() => onAssignUsers(role)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Users size={13} />
                  Manage Assigned Users
                </button>
              </div>

              {(!role.assignedUsers || role.assignedUsers.length === 0) ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No users are currently assigned to this role.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {role.assignedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3.5 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{u.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {u.department}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {u.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Security and permission modification log history for this role:
              </p>
              {(!role.auditLogs || role.auditLogs.length === 0) ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No permission audit log events recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {role.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Performed by <span className="font-semibold text-slate-700 dark:text-slate-200">{log.performedBy}</span>
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
