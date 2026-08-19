import React, { useState, useMemo, useCallback } from "react";
import { DataTable, ColumnDef, FormField } from "@/shared/ui";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip/Tooltip";
import {
  Video,
  Calendar,
  Clock,
  UserCheck,
  Eye,
  Edit3,
  MessageSquarePlus,
  XCircle,
  ExternalLink,
  Sparkles,
  User,
} from "lucide-react";
import type {
  UpcomingInterview,
  InterviewStatus,
  InterviewRound,
  InterviewMode,
} from "../types/upcoming.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

export interface UpcomingTableProps {
  interviews: UpcomingInterview[];
  onQuickView: (interview: UpcomingInterview) => void;
  onReschedule: (interview: UpcomingInterview) => void;
  onFeedback: (interview: UpcomingInterview) => void;
  onCancelInterview: (interviewId: string, candidateName: string) => void;
  onJoinMeeting: (meetingLink: string) => void;
  isLoading?: boolean;
}

/* =========================================================
   🔹 HELPER BADGE FUNCTIONS
========================================================= */

const getStatusBadgeVariant = (status: InterviewStatus): BadgeVariant => {
  switch (status) {
    case "Scheduled":
      return "info";
    case "In Progress":
      return "warning";
    case "Pending Feedback":
      return "info";
    case "Rescheduled":
      return "default";
    case "Completed":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "default";
  }
};

const getModeBadgeVariant = (mode: InterviewMode): BadgeVariant => {
  switch (mode) {
    case "Google Meet":
      return "success";
    case "Zoom":
      return "info";
    case "Microsoft Teams":
      return "info";
    case "In-Person":
      return "warning";
    default:
      return "default";
  }
};

export const UpcomingTable: React.FC<UpcomingTableProps> = ({
  interviews,
  onQuickView,
  onReschedule,
  onFeedback,
  onCancelInterview,
  onJoinMeeting,
  isLoading = false,
}) => {
  // Column search / select filters state
  const [columnFilters, setColumnFilters] = useState({
    candidateName: "",
    jobTitle: "",
    round: "",
    status: "",
    mode: "",
  });

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  }, []);

  const handleClearColumnFilter = useCallback((columnId: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: "",
    }));
  }, []);

  // Define Table Columns
  const columns = useMemo<ColumnDef<UpcomingInterview>[]>(
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
        render: (interview: UpcomingInterview) => {
          const initials = interview.candidateName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("");

          return (
            <div
              className="flex items-center gap-3 py-1 cursor-pointer group"
              onClick={() => onQuickView(interview)}
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800 shadow-2xs group-hover:border-blue-400 transition-colors">
                {initials || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm truncate">
                  {interview.candidateName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                  <span>{interview.candidateEmail}</span>
                  {interview.aiMatchScore && (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                      {interview.aiMatchScore}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "jobTitle",
        label: "Job & Department",
        key: "jobTitle",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Job Title
            </label>
            <FormField
              type="text"
              placeholder="Search job or department..."
              value={columnFilters.jobTitle || ""}
              onChange={(e: any) => handleColumnFilterChange("jobTitle", e.target?.value ?? e)}
              fieldSize="sm"
              autoFocus
            />
            {columnFilters.jobTitle && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("jobTitle")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 210,
        render: (interview: UpcomingInterview) => (
          <div className="py-1">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {interview.jobTitle}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {interview.department}
            </div>
          </div>
        ),
      },
      {
        id: "round",
        label: "Round / Stage",
        key: "round",
        sortable: true,
        isFilter: true,
        filterSectionRender: () => (
          <div className="flex flex-col gap-2 p-1 min-w-[210px]" onClick={(e) => e.stopPropagation()}>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Filter by Round
            </label>
            <FormField
              type="select"
              options={[
                { label: "All Rounds", value: "" },
                { label: "Screening", value: "Screening" },
                { label: "Technical Round 1", value: "Technical Round 1" },
                { label: "Technical Round 2", value: "Technical Round 2" },
                { label: "System Design", value: "System Design" },
                { label: "Culture Fit", value: "Culture Fit" },
                { label: "Final HR", value: "Final HR" },
              ]}
              value={columnFilters.round || ""}
              onChange={(val: any) => handleColumnFilterChange("round", typeof val === "string" ? val : (val?.value ?? ""))}
              fieldSize="sm"
            />
            {columnFilters.round && (
              <button
                type="button"
                onClick={() => handleClearColumnFilter("round")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium self-end"
              >
                Clear Filter
              </button>
            )}
          </div>
        ),
        width: 170,
        render: (interview: UpcomingInterview) => (
          <Badge variant="default" size="sm" rounded className="font-semibold text-xs">
            {interview.round}
          </Badge>
        ),
      },
      {
        id: "scheduledDate",
        label: "Date & Time",
        key: "scheduledDate",
        sortable: true,
        width: 180,
        render: (interview: UpcomingInterview) => (
          <div className="py-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{interview.scheduledDate}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>
                {interview.startTime} - {interview.endTime} ({interview.durationMinutes}m)
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "mode",
        label: "Mode & Meeting",
        key: "mode",
        sortable: true,
        width: 170,
        render: (interview: UpcomingInterview) => (
          <div className="py-1 flex flex-col gap-1 items-start">
            <Badge variant={getModeBadgeVariant(interview.mode)} size="sm" rounded dot>
              {interview.mode}
            </Badge>
            {interview.meetingLink ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinMeeting(interview.meetingLink!);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Video className="w-3 h-3 text-blue-500" /> Join Room <ExternalLink className="w-2.5 h-2.5" />
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                {interview.location || "Location pending"}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "interviewers",
        label: "Interview Panel",
        width: 190,
        render: (interview: UpcomingInterview) => (
          <div className="py-1 flex flex-wrap gap-1">
            {interview.interviewers.map((panelist) => (
              <Tooltip key={panelist.id} content={`${panelist.name} (${panelist.role})`}>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  {panelist.name.split(" ")[0]}
                </span>
              </Tooltip>
            ))}
          </div>
        ),
      },
      {
        id: "status",
        label: "Status",
        key: "status",
        sortable: true,
        width: 150,
        render: (interview: UpcomingInterview) => (
          <Badge variant={getStatusBadgeVariant(interview.status)} size="sm" rounded dot pulse={interview.status === "In Progress"}>
            {interview.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        label: "Actions",
        width: 170,
        render: (interview: UpcomingInterview) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {interview.meetingLink && interview.status !== "Cancelled" && (
              <Tooltip content="Join Video Interview">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onJoinMeeting(interview.meetingLink!)}
                  className="h-8 px-2 text-xs font-semibold text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Join
                </Button>
              </Tooltip>
            )}

            <Tooltip content="View Interview Details">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onQuickView(interview)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Reschedule Interview">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReschedule(interview)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4 text-purple-500" />
              </Button>
            </Tooltip>

            <Tooltip content="Submit Interview Feedback">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFeedback(interview)}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4 text-amber-500" />
              </Button>
            </Tooltip>

            {interview.status !== "Cancelled" && (
              <Tooltip content="Cancel Interview">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCancelInterview(interview.id, interview.candidateName)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    [
      onQuickView,
      onReschedule,
      onFeedback,
      onCancelInterview,
      onJoinMeeting,
      columnFilters,
      handleColumnFilterChange,
      handleClearColumnFilter,
    ]
  );

  // Filtered interview list
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      if (
        columnFilters.candidateName &&
        !item.candidateName.toLowerCase().includes(columnFilters.candidateName.toLowerCase()) &&
        !item.candidateEmail.toLowerCase().includes(columnFilters.candidateName.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.jobTitle &&
        !item.jobTitle.toLowerCase().includes(columnFilters.jobTitle.toLowerCase()) &&
        !item.department.toLowerCase().includes(columnFilters.jobTitle.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.round &&
        columnFilters.round !== "All" &&
        !item.round.toLowerCase().includes(columnFilters.round.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [interviews, columnFilters]);

  return (
    <div className="w-full">
      <DataTable<UpcomingInterview>
        data={filteredInterviews}
        columns={columns}
        isLoading={isLoading}
        enableSearch
        getRowId={(row) => row.id}
      />
    </div>
  );
};
