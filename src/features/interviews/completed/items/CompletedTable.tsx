import React, { useState, useMemo, useCallback } from "react";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip/Tooltip";
import {
  Calendar,
  Clock,
  UserCheck,
  Eye,
  FileText,
  Star,
  Download,
  User,
  CheckCircle2,
  Award,
} from "lucide-react";
import type { CompletedInterview, RecommendationType } from "../types/completed.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

export interface CompletedTableProps {
  interviews: CompletedInterview[];
  onViewScorecard: (interview: CompletedInterview) => void;
  onViewDetails: (interview: CompletedInterview) => void;
  onDownloadResume?: (interview: CompletedInterview) => void;
  isLoading?: boolean;
}

const getRecommendationBadgeVariant = (rec: RecommendationType): BadgeVariant => {
  switch (rec) {
    case "Strong Hire":
      return "success";
    case "Hire":
      return "info";
    case "Hold":
      return "warning";
    case "Reject":
      return "danger";
    default:
      return "default";
  }
};

const getOutcomeBadgeVariant = (outcome?: string): BadgeVariant => {
  switch (outcome) {
    case "Hired":
      return "success";
    case "Advanced to Next Round":
      return "info";
    case "Under Review":
      return "warning";
    case "Rejected":
      return "danger";
    default:
      return "default";
  }
};

export const CompletedTable: React.FC<CompletedTableProps> = ({
  interviews,
  onViewScorecard,
  onViewDetails,
  onDownloadResume,
  isLoading = false,
}) => {
  const [columnFilters, setColumnFilters] = useState({
    candidateName: "",
    jobTitle: "",
    round: "",
    recommendation: "",
  });

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [columnId]: value }));
  }, []);

  const handleClearColumnFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => ({ ...prev, [columnId]: "" }));
  }, []);

  const columns = useMemo<ColumnDef<CompletedInterview>[]>(
    () => [
      {
        id: "candidateName",
        label: "Candidate",
        key: "candidateName",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter Candidate Name
            </label>
            <FormField
              type="text"
              placeholder="Search candidate..."
              value={columnFilters.candidateName || ""}
              onChange={(e: any) => handleColumnFilterChange("candidateName", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.candidateName && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("candidateName")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 240,
        render: (item: CompletedInterview) => {
          const initials = item.candidateName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("");

          return (
            <div
              className="flex items-center gap-3 py-1 cursor-pointer group"
              onClick={() => onViewDetails(item)}
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800 shadow-2xs group-hover:border-emerald-400 transition-colors">
                {initials || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm truncate">
                  {item.candidateName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-normal">
                  {item.candidateEmail}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "jobTitle",
        label: "Job Position",
        key: "jobTitle",
        sortable: true,
        width: 210,
        render: (item: CompletedInterview) => (
          <div className="py-1">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {item.jobTitle}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {item.department}
            </div>
          </div>
        ),
      },
      {
        id: "round",
        label: "Round Completed",
        key: "round",
        sortable: true,
        width: 170,
        render: (item: CompletedInterview) => (
          <Badge variant="default" size="sm" rounded className="font-semibold text-xs">
            {item.round}
          </Badge>
        ),
      },
      {
        id: "completedDate",
        label: "Completed Date",
        key: "completedDate",
        sortable: true,
        width: 160,
        render: (item: CompletedInterview) => (
          <div className="py-1 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>{item.completedDate}</span>
          </div>
        ),
      },
      {
        id: "overallRating",
        label: "Score",
        key: "overallRating",
        sortable: true,
        width: 130,
        render: (item: CompletedInterview) => (
          <div className="flex items-center gap-1 py-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`w-3.5 h-3.5 ${
                  idx < item.overallRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 dark:text-slate-700"
                }`}
              />
            ))}
          </div>
        ),
      },
      {
        id: "recommendation",
        label: "Recommendation",
        key: "recommendation",
        sortable: true,
        width: 160,
        render: (item: CompletedInterview) => (
          <Badge variant={getRecommendationBadgeVariant(item.recommendation)} size="sm" rounded dot>
            {item.recommendation}
          </Badge>
        ),
      },
      {
        id: "finalOutcome",
        label: "Outcome",
        width: 170,
        render: (item: CompletedInterview) => (
          <Badge variant={getOutcomeBadgeVariant(item.finalOutcome)} size="sm" rounded>
            {item.finalOutcome || "Under Review"}
          </Badge>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        width: 150,
        render: (item: CompletedInterview) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip content="View Scorecard & Feedback">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewScorecard(item)}
                className="h-8 px-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg gap-1"
              >
                <FileText className="w-3.5 h-3.5" /> Scorecard
              </Button>
            </Tooltip>

            <Tooltip content="Candidate Detail Drawer">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(item)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [onViewScorecard, onViewDetails, columnFilters, handleColumnFilterChange, handleClearColumnFilter]
  );

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      if (
        columnFilters.candidateName &&
        !item.candidateName.toLowerCase().includes(columnFilters.candidateName.toLowerCase()) &&
        !item.candidateEmail.toLowerCase().includes(columnFilters.candidateName.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [interviews, columnFilters]);

  return (
    <div className="w-full">
      <DataTable<CompletedInterview>
        data={filteredInterviews}
        columns={columns}
        isLoading={isLoading}
        enableSearch
        getRowId={(row) => row.id}
      />
    </div>
  );
};
