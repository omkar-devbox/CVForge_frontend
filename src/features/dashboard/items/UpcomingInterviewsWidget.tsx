import React from "react";
import {
  CalendarClock,
  Video,
  Clock,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import type { TodayInterview } from "../types/dashboard.types";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/Badge";
import { toast } from "@/shared/ui/toast";
import { useNavigate } from "react-router-dom";

interface UpcomingInterviewsWidgetProps {
  interviews: TodayInterview[];
  onNavigateToInterviews?: () => void;
}

export const UpcomingInterviewsWidget: React.FC<UpcomingInterviewsWidgetProps> = ({
  interviews,
  onNavigateToInterviews,
}) => {
  const navigate = useNavigate();

  const handleJoinMeeting = (e: React.MouseEvent, link?: string, candidateName?: string) => {
    e.stopPropagation();
    if (link) {
      window.open(link, "_blank");
      toast.success(`Joining interview session for ${candidateName}`);
    } else {
      toast.info(`Meeting link being generated for ${candidateName}`);
    }
  };

  const handleCardClick = () => {
    if (onNavigateToInterviews) {
      onNavigateToInterviews();
    } else {
      navigate("/interviews/upcoming");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <CalendarClock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Today's Scheduled Interviews
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {interviews.length} sessions scheduled today
            </p>
          </div>
        </div>

        <button
          onClick={handleCardClick}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          View Calendar
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {interviews.map((int) => (
          <div
            key={int.id}
            onClick={handleCardClick}
            className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left Candidate info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {int.candidateName}
                  </h4>
                  <Badge
                    variant={
                      int.status === "In Progress"
                        ? "success"
                        : int.status === "Scheduled"
                        ? "info"
                        : "default"
                    }
                    className="text-[10px] px-2 py-0.5"
                  >
                    {int.status}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {int.jobTitle} • <span className="text-slate-500">{int.department}</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <Clock size={13} className="text-purple-500" />
                    {int.timeSlot}
                  </span>
                  <span>•</span>
                  <span>{int.interviewType}</span>
                </div>
              </div>

              {/* Right Interviewers & Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {int.meetLink && (
                  <Button
                    size="sm"
                    variant={int.status === "In Progress" ? "primary" : "outline"}
                    onClick={(e) => handleJoinMeeting(e, int.meetLink, int.candidateName)}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Video size={13} />
                    <span>{int.status === "In Progress" ? "Join Now" : "Meet Link"}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Interviewers list */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <UserCheck size={12} className="text-slate-400" />
                <span>Evaluators: </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {int.interviewers.map((i) => i.name).join(", ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

