import React from "react";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/button";
import {
  Calendar,
  Clock,
  Video,
  UserCheck,
  Eye,
  Edit3,
  MessageSquarePlus,
  ExternalLink,
  Sparkles,
  User,
  MapPin,
} from "lucide-react";
import type { UpcomingInterview } from "../types/upcoming.types";
import type { BadgeVariant } from "@/shared/ui/Badge/style/style";

interface UpcomingTimelineViewProps {
  interviews: UpcomingInterview[];
  onQuickView: (interview: UpcomingInterview) => void;
  onReschedule: (interview: UpcomingInterview) => void;
  onFeedback: (interview: UpcomingInterview) => void;
  onJoinMeeting: (meetingLink: string) => void;
}

const getStatusBadgeVariant = (status: string): BadgeVariant => {
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

export const UpcomingTimelineView: React.FC<UpcomingTimelineViewProps> = ({
  interviews,
  onQuickView,
  onReschedule,
  onFeedback,
  onJoinMeeting,
}) => {
  // Group interviews by date
  const groupedInterviews = React.useMemo(() => {
    const todayStr = "2026-08-19";
    const groups: { [key: string]: UpcomingInterview[] } = {};

    interviews.forEach((item) => {
      let groupKey = item.scheduledDate;
      if (item.scheduledDate === todayStr) {
        groupKey = "Today (Aug 19, 2026)";
      } else if (item.scheduledDate === "2026-08-20") {
        groupKey = "Tomorrow (Aug 20, 2026)";
      } else {
        groupKey = `Upcoming (${item.scheduledDate})`;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [interviews]);

  if (interviews.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
        <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No interviews scheduled
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust your filters or schedule a new candidate interview.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedInterviews).map(([dateGroup, items]) => (
        <div key={dateGroup} className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {dateGroup}
            </h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {items.length} interview{items.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Cards Stack */}
          <div className="grid grid-cols-1 gap-3">
            {items.map((interview) => {
              const initials = interview.candidateName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={interview.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Time & Candidate info */}
                  <div className="flex items-start gap-4">
                    {/* Time Slot Badge */}
                    <div className="w-24 shrink-0 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 rounded-lg p-2 text-center">
                      <span className="block text-xs font-bold text-blue-700 dark:text-blue-300">
                        {interview.startTime}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {interview.durationMinutes} mins
                      </span>
                    </div>

                    {/* Candidate Details */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800 cursor-pointer"
                          onClick={() => onQuickView(interview)}
                        >
                          {initials || <User className="w-4 h-4" />}
                        </div>
                        <h4
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          onClick={() => onQuickView(interview)}
                        >
                          {interview.candidateName}
                        </h4>

                        <Badge variant="default" size="sm" rounded className="font-semibold text-[11px]">
                          {interview.round}
                        </Badge>

                        <Badge variant={getStatusBadgeVariant(interview.status)} size="sm" rounded dot>
                          {interview.status}
                        </Badge>

                        {interview.aiMatchScore && (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {interview.aiMatchScore}% Match
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {interview.jobTitle}
                        </span>
                        <span>•</span>
                        <span>{interview.department}</span>
                        <span>•</span>
                        <span>{interview.candidateEmail}</span>
                      </div>

                      {/* Panelists */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Panel:
                        </span>
                        {interview.interviewers.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            <UserCheck className="w-3 h-3 text-blue-500" />
                            {p.name} ({p.role.split(" ")[0]})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 w-full md:w-auto justify-end">
                    {interview.meetingLink && (
                      <Button
                        size="sm"
                        onClick={() => onJoinMeeting(interview.meetingLink!)}
                        className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Room
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFeedback(interview)}
                      className="gap-1 text-xs font-semibold text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      Feedback
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReschedule(interview)}
                      className="gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-500" />
                      Reschedule
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickView(interview)}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
