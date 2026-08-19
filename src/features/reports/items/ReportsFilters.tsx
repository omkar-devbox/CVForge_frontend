import React from "react";
import {
  Calendar,
  Building2,
  MapPin,
  Search,
  RefreshCw,
  Plus,
  Download,
  Filter,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import type {
  ReportsFilterState,
  ReportTimeframe,
  ReportDepartment,
} from "../types/reports.types";

interface ReportsFiltersProps {
  filters: ReportsFilterState;
  onFilterChange: (updated: Partial<ReportsFilterState>) => void;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onExport: (format: "CSV" | "PDF") => void;
}

const TIMEFRAMES: { value: ReportTimeframe; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last Quarter" },
  { value: "ytd", label: "Year to Date" },
];

const DEPARTMENTS: ReportDepartment[] = [
  "All",
  "Engineering",
  "Product",
  "Sales",
  "Marketing",
  "Design",
  "HR & Ops",
];

const LOCATIONS = ["All Locations", "Remote", "San Francisco, CA", "New York, NY", "London, UK", "Berlin, DE"];

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  onOpenCreateModal,
  onExport,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left side: Timeframe pills & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onFilterChange({ timeframe: tf.value })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filters.timeframe === tf.value
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Department Select */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
            <Building2 size={15} className="text-slate-400" />
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ department: e.target.value as ReportDepartment })}
              className="bg-transparent border-none outline-hidden cursor-pointer font-medium text-slate-900 dark:text-slate-100 pr-1"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Location Select */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
            <MapPin size={15} className="text-slate-400" />
            <select
              value={filters.location}
              onChange={(e) => onFilterChange({ location: e.target.value })}
              className="bg-transparent border-none outline-hidden cursor-pointer font-medium text-slate-900 dark:text-slate-100 pr-1"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            title="Refresh analytics data"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={14} className="text-slate-500" />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport("CSV")}
            title="Export CSV"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Plus size={15} />
            <span>Create Custom Report</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
