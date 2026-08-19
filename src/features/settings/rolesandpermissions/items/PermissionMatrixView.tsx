import React, { useState } from "react";
import { Check, X, ChevronDown, ChevronRight } from "lucide-react";
import type { Role } from "../types/roles.types";
import { PERMISSION_CATEGORIES } from "../data/mockRolesData";
import { toast } from "@/shared/ui/toast/hooks/useToast";

interface PermissionMatrixViewProps {
  roles: Role[];
  onTogglePermission: (roleId: string, permKey: string, newValue: boolean) => void;
}

export const PermissionMatrixView: React.FC<PermissionMatrixViewProps> = ({
  roles,
  onTogglePermission,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Candidate Management": true,
    "Job Requisitions": true,
    "Interview & Evaluation": true,
    "Talent Pool & Sourcing": true,
    "Reports & Analytics": true,
    "System & Security": true,
    "User & Access Control": true,
  });

  const toggleCategoryExpand = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Permission Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-xs">
              <th className="py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider min-w-[280px]">
                Permission Key & Description
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="py-3.5 px-3 text-center min-w-[120px] max-w-[150px] border-l border-slate-200/60 dark:border-slate-800/80"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate w-full px-1">
                      {role.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                        role.type === "System"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          : "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                      }`}
                    >
                      {role.type}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {PERMISSION_CATEGORIES.map((catGroup) => {
                const isExpanded = expandedCategories[catGroup.category] !== false;

                return (
                  <React.Fragment key={catGroup.category}>
                    {/* Category Header Row */}
                    <tr
                      onClick={() => toggleCategoryExpand(catGroup.category)}
                      className="bg-slate-100/70 dark:bg-slate-800/40 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 cursor-pointer select-none transition-colors"
                    >
                      <td
                        colSpan={roles.length + 1}
                        className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {catGroup.category}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            ({catGroup.permissions.length} items)
                          </span>
                          <span className="text-slate-400 text-xs font-normal ml-2 hidden md:inline">
                            — {catGroup.description}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Permissions Rows */}
                    {isExpanded &&
                      catGroup.permissions.map((perm) => (
                        <tr
                          key={perm.key}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{perm.name}</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              {perm.key}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {perm.description}
                            </div>
                          </td>

                          {roles.map((role) => {
                            const isEnabled = role.permissions[perm.key] ?? false;

                            return (
                              <td
                                key={role.id}
                                className="py-3 px-3 text-center border-l border-slate-100 dark:border-slate-800/60 vertical-middle"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    onTogglePermission(role.id, perm.key, !isEnabled);
                                    toast.success(
                                      `${!isEnabled ? "Granted" : "Revoked"} "${perm.name}" for ${
                                        role.name
                                      }`
                                    );
                                  }}
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                                    isEnabled
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
                                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                  }`}
                                  title={`Click to toggle ${perm.name} for ${role.name}`}
                                >
                                  {isEnabled ? (
                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                  ) : (
                                    <X className="w-3.5 h-3.5 opacity-60" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
