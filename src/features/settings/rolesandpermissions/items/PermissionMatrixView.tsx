import React, { useState, useMemo } from "react";
import { Search, Check, X, Filter, ChevronDown, ChevronRight } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
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

  const filteredCategories = useMemo(() => {
    return PERMISSION_CATEGORIES.map((cat) => {
      if (selectedCategory !== "All" && cat.category !== selectedCategory) {
        return { ...cat, permissions: [] };
      }

      const matchingPerms = cat.permissions.filter((p) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      });

      return { ...cat, permissions: matchingPerms };
    }).filter((cat) => cat.permissions.length > 0);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Matrix Controls & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search permissions by key or title..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 pl-3 pr-8 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="All">All Categories ({PERMISSION_CATEGORIES.length})</option>
              {PERMISSION_CATEGORIES.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden lg:block">
            Showing <span className="font-bold text-slate-900 dark:text-white">{roles.length}</span> Roles across{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {filteredCategories.reduce((acc, curr) => acc + curr.permissions.length, 0)}
            </span>{" "}
            Permissions
          </div>
        </div>
      </div>

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
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={roles.length + 1} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  No permissions found matching search filter.
                </td>
              </tr>
            ) : (
              filteredCategories.map((catGroup) => {
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
