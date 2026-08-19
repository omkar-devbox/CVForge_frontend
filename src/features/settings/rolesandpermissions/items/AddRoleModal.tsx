import React, { useState } from "react";
import { X, ShieldPlus, Copy, Check, Layers } from "lucide-react";
import type { Role, CreateRoleParams, RoleStatus } from "../types/roles.types";
import { PERMISSION_CATEGORIES, ALL_PERMISSIONS_LIST } from "../data/mockRolesData";

interface AddRoleModalProps {
  isOpen: boolean;
  existingRoles: Role[];
  onClose: () => void;
  onSubmit: (params: CreateRoleParams) => void;
}

export const AddRoleModal: React.FC<AddRoleModalProps> = ({
  isOpen,
  existingRoles,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RoleStatus>("Active");
  const [cloneFromRoleId, setCloneFromRoleId] = useState<string>("none");

  // State for permissions map
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    ALL_PERMISSIONS_LIST.forEach((p) => {
      map[p.key] = p.defaultEnabled ?? false;
    });
    return map;
  });

  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  if (!isOpen) return null;

  // Handle preset clone selection
  const handleCloneChange = (roleId: string) => {
    setCloneFromRoleId(roleId);
    if (roleId === "none") {
      const map: Record<string, boolean> = {};
      ALL_PERMISSIONS_LIST.forEach((p) => {
        map[p.key] = false;
      });
      setPermissions(map);
      return;
    }

    const targetRole = existingRoles.find((r) => r.id === roleId);
    if (targetRole) {
      setPermissions({ ...targetRole.permissions });
    }
  };

  // Auto-generate code slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    setCode(slug);
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCategoryAll = (categoryName: string, enable: boolean) => {
    const group = PERMISSION_CATEGORIES.find((c) => c.category === categoryName);
    if (!group) return;
    setPermissions((prev) => {
      const updated = { ...prev };
      group.permissions.forEach((p) => {
        updated[p.key] = enable;
      });
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; code?: string } = {};

    if (!name.trim()) newErrors.name = "Role title is required";
    if (!code.trim()) newErrors.code = "Unique role code is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      status,
      permissions,
      cloneFromRoleId: cloneFromRoleId !== "none" ? cloneFromRoleId : undefined,
    });

    // Reset form
    setName("");
    setCode("");
    setDescription("");
    setStatus("Active");
    setCloneFromRoleId("none");
    setErrors({});
    onClose();
  };

  const activePermsCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShieldPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                Create Custom Access Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define a new role and configure its granular permission matrix
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Template Selector */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Copy size={14} className="text-blue-600" />
              Quick Template / Clone Permissions
            </div>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Select an existing role to prepopulate permissions matrix as a baseline starting point:
            </p>
            <select
              value={cloneFromRoleId}
              onChange={(e) => handleCloneChange(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="none">-- Start from Scratch (Default Permissions) --</option>
              {existingRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  Copy from: {r.name} ({r.type} Role - {Object.values(r.permissions).filter(Boolean).length} permissions)
                </option>
              ))}
            </select>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Role Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Talent Acquisition Coordinator"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Role System Identifier (Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ta_coordinator"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.code && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Description & Access Scope
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the responsibility and access scope granted by this role..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Permissions Matrix Checklist Header */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  Permission Matrix Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently <span className="font-bold text-blue-600 dark:text-blue-400">{activePermsCount}</span> of{" "}
                  {ALL_PERMISSIONS_LIST.length} permissions enabled
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const map: Record<string, boolean> = {};
                    ALL_PERMISSIONS_LIST.forEach((p) => (map[p.key] = true));
                    setPermissions(map);
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Enable All
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const map: Record<string, boolean> = {};
                    ALL_PERMISSIONS_LIST.forEach((p) => (map[p.key] = false));
                    setPermissions(map);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:underline"
                >
                  Disable All
                </button>
              </div>
            </div>

            {/* Categorized Permissions Checklist */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {PERMISSION_CATEGORIES.map((catGroup) => {
                const groupPerms = catGroup.permissions;
                const groupActiveCount = groupPerms.filter((p) => permissions[p.key]).length;
                const allGroupEnabled = groupActiveCount === groupPerms.length;

                return (
                  <div
                    key={catGroup.category}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-800/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {catGroup.category}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          ({groupActiveCount}/{groupPerms.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCategoryAll(catGroup.category, !allGroupEnabled)}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {allGroupEnabled ? "Deselect Group" : "Select Group"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {groupPerms.map((p) => {
                        const isChecked = !!permissions[p.key];
                        return (
                          <label
                            key={p.key}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-800 text-slate-900 dark:text-slate-100 shadow-2xs"
                                : "bg-transparent border-slate-200/80 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(p.key)}
                              className="mt-0.5 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500/20"
                            />
                            <div>
                              <div className="font-bold">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.2">
                                {p.key}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              Create Custom Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
