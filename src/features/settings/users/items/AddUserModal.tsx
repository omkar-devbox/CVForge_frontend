import React, { useState } from "react";
import { X, UserPlus, Mail, Shield, Check, Info } from "lucide-react";
import type {
  CreateUserParams,
  UserRole,
  Department,
} from "../types/users.types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: CreateUserParams) => void;
}

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Admin: "Full system administration access to all modules, security settings, user management, and billing.",
  Recruiter: "Can create jobs, manage candidate pipelines, schedule interviews, and issue offers.",
  "Hiring Manager": "Access to candidate profiles for assigned job openings, interview evaluations, and decision approvals.",
  Interviewer: "Restricted access to scheduled candidate interviews, scorecards, and candidate feedback forms.",
  "HR Specialist": "Can manage candidate onboarding, compliance records, employee details, and recruitment reports.",
  Viewer: "Read-only access across recruitment pipelines and candidate reports.",
};

const ROLES: UserRole[] = [
  "Recruiter",
  "Hiring Manager",
  "Interviewer",
  "Admin",
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

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("Recruiter");
  const [department, setDepartment] = useState<Department>("Talent Acquisition");
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim() || !email.includes("@"))
      newErrors.email = "Valid corporate email is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      department,
      sendInviteEmail,
      notes: notes.trim(),
    });

    // Reset & close
    setName("");
    setEmail("");
    setPhone("");
    setRole("Recruiter");
    setDepartment("Talent Acquisition");
    setSendInviteEmail(true);
    setNotes("");
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add & Invite Team Member
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant workspace access and assign role permissions
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
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="jane.doe@company.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>
              )}
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
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Access Role
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

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Role Privileges Callout Box */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
              <Shield size={14} />
              <span>Role Permissions: {role}</span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-400 leading-relaxed">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>

          {/* Invite Toggle & Message */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendInviteEmail}
                onChange={(e) => setSendInviteEmail(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Send instant invitation email with password setup link
              </span>
            </label>

            {sendInviteEmail && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Custom Welcome Message (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Welcome to the System Mechatronics hiring portal! Please click the setup link to get started..."
                  rows={2}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}
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
              <Mail size={14} />
              <span>Send Invite & Save Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
