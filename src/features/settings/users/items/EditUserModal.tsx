import React, { useState, useEffect } from "react";
import { X, Edit, Shield, Save } from "lucide-react";
import type {
  User,
  EditUserParams,
  UserRole,
  UserStatus,
  Department,
} from "../types/users.types";

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: EditUserParams) => void;
}

const ROLES: UserRole[] = [
  "Admin",
  "Recruiter",
  "Hiring Manager",
  "Interviewer",
  "HR Specialist",
  "Viewer",
];

const DEPARTMENTS: Department[] = [
  "Engineering",
  "Talent Acquisition",
  "Human Resources",
  "Product & Design",
  "Finance & Ops",
  "Executive",
];

const STATUSES: UserStatus[] = ["Active", "Pending Invite", "Inactive", "Suspended"];

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Recruiter");
  const [department, setDepartment] = useState<Department>("Talent Acquisition");
  const [status, setStatus] = useState<UserStatus>("Active");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setRole(user.role);
      setDepartment(user.department);
      setStatus(user.status);
      setTwoFactorEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSubmit({
      id: user.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      department,
      status,
      twoFactorEnabled,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Edit size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit User Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update user role, department, and security preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Department & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Security & 2FA */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield size={14} className="text-purple-600 dark:text-purple-400" />
                  Require 2-Factor Authentication (2FA)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enforces authenticator app verification on subsequent logins
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition-all"
            >
              <Save size={14} />
              <span>Save Account Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
