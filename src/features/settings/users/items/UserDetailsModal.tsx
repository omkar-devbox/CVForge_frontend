import React from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  UserCheck,
  KeyRound,
  Edit,
  Clock,
  Activity,
} from "lucide-react";
import type { User } from "../types/users.types";

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onResendInvite: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onResendInvite,
  onResetPassword,
}) => {
  if (!isOpen || !user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl border-2 border-white/20 shadow-md">
                {initials}
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-xs text-blue-200/90">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/30 border border-blue-400/40 text-blue-100">
                  {user.role}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  {user.department}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center justify-around p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onEdit(user)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-all"
          >
            <Edit size={14} className="text-blue-500" />
            <span>Edit Account</span>
          </button>

          {user.status === "Pending Invite" && (
            <button
              onClick={() => onResendInvite(user)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-all"
            >
              <Mail size={14} />
              <span>Resend Invite</span>
            </button>
          )}

          <button
            onClick={() => onResetPassword(user)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-all"
          >
            <KeyRound size={14} />
            <span>Reset Password</span>
          </button>
        </div>

        {/* Body Details */}
        <div className="p-6 space-y-6 flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Briefcase size={14} />
                <span>Assigned Jobs</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {user.assignedJobsCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <UserCheck size={14} />
                <span>Interviews Done</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {user.interviewsConducted}
              </div>
            </div>
          </div>

          {/* Account Details List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Account Metadata
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock size={14} />
                  Status:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {user.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={14} />
                  Two-Factor Security:
                </span>
                <span
                  className={`font-bold ${
                    user.twoFactorEnabled
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-500"
                  }`}
                >
                  {user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar size={14} />
                  Account Created:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user.dateAdded}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Activity size={14} />
                  Last Active:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user.lastActive}
                </span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Phone size={14} />
                    Phone:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {user.phone}
                  </span>
                </div>
              )}

              {user.location && (
                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin size={14} />
                    Location:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {user.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recent Activity Audit Trail
            </h4>

            {user.activityLogs && user.activityLogs.length > 0 ? (
              <div className="space-y-2">
                {user.activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{log.timestamp}</span>
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No recent activity logs recorded.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
