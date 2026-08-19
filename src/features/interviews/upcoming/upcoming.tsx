import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Calendar,
  List,
  Download,
  RefreshCw,
  Video,
  X,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Page } from "@/shared/pages/Page/Page";
import { toast } from "@/shared/ui/toast";
import { UpcomingStats } from "./items/UpcomingStats";
import { UpcomingTable } from "./items/UpcomingTable";
import { UpcomingTimelineView } from "./items/UpcomingTimelineView";
import { ScheduleInterviewModal } from "./items/ScheduleInterviewModal";
import { RescheduleInterviewModal } from "./items/RescheduleInterviewModal";
import { SubmitFeedbackModal } from "./items/SubmitFeedbackModal";
import { InterviewDetailModal } from "./items/InterviewDetailModal";

import { INITIAL_UPCOMING_INTERVIEWS } from "./data/mockUpcomingInterviews";
import type {
  UpcomingInterview,
  InterviewStatus,
  InterviewRound,
  InterviewMode,
  InterviewFilterState,
  InterviewFeedback,
} from "./types/upcoming.types";

export const UpcomingInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<UpcomingInterview[]>(INITIAL_UPCOMING_INTERVIEWS);
  const [viewMode, setViewMode] = useState<"table" | "timeline">("timeline");

  // Filters State
  const [filters, setFilters] = useState<InterviewFilterState>({
    search: "",
    status: "all",
    round: "all",
    mode: "all",
    dateFilter: "all",
  });

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [rescheduleInterview, setRescheduleInterview] = useState<UpcomingInterview | null>(null);
  const [feedbackInterview, setFeedbackInterview] = useState<UpcomingInterview | null>(null);
  const [detailInterview, setDetailInterview] = useState<UpcomingInterview | null>(null);

  // Compute metrics for stats header
  const totalCount = interviews.length;
  const todayCount = useMemo(
    () => interviews.filter((i) => i.scheduledDate === "2026-08-19").length,
    [interviews]
  );
  const rescheduledCount = useMemo(
    () => interviews.filter((i) => i.status === "Rescheduled").length,
    [interviews]
  );
  const pendingFeedbackCount = useMemo(
    () => interviews.filter((i) => i.status === "Pending Feedback").length,
    [interviews]
  );
  const avgAiScore = useMemo(() => {
    if (interviews.length === 0) return 0;
    const total = interviews.reduce((acc, curr) => acc + (curr.aiMatchScore || 90), 0);
    return Math.round(total / interviews.length);
  }, [interviews]);

  // Filter Logic
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      // Date Filter
      if (filters.dateFilter === "today" && item.scheduledDate !== "2026-08-19") {
        return false;
      }
      if (filters.dateFilter === "tomorrow" && item.scheduledDate !== "2026-08-20") {
        return false;
      }

      // Status Filter
      if (filters.status !== "all") {
        if (filters.status === "pending_feedback" && item.status !== "Pending Feedback") return false;
        if (filters.status === "rescheduled" && item.status !== "Rescheduled") return false;
        if (filters.status === "scheduled" && item.status !== "Scheduled") return false;
      }

      // Round Filter
      if (filters.round !== "all" && item.round !== filters.round) {
        return false;
      }

      // Mode Filter
      if (filters.mode !== "all" && item.mode !== filters.mode) {
        return false;
      }

      // Search Query
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesCandidate = item.candidateName.toLowerCase().includes(q);
        const matchesJob = item.jobTitle.toLowerCase().includes(q);
        const matchesDept = item.department.toLowerCase().includes(q);
        const matchesInterviewer = item.interviewers.some((int) =>
          int.name.toLowerCase().includes(q)
        );
        if (!matchesCandidate && !matchesJob && !matchesDept && !matchesInterviewer) {
          return false;
        }
      }

      return true;
    });
  }, [interviews, filters]);

  // Handlers
  const handleStatFilterClick = (filterType: string) => {
    if (filterType === "all") {
      setFilters((prev) => ({ ...prev, status: "all", dateFilter: "all" }));
    } else if (filterType === "today") {
      setFilters((prev) => ({ ...prev, dateFilter: "today" }));
    } else if (filterType === "pending_feedback") {
      setFilters((prev) => ({ ...prev, status: "pending_feedback" }));
    } else if (filterType === "rescheduled") {
      setFilters((prev) => ({ ...prev, status: "rescheduled" }));
    }
  };

  const handleScheduleNewInterview = (interviewData: Partial<UpcomingInterview>) => {
    const newInterview: UpcomingInterview = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      candidateId: `CND-${Date.now().toString().slice(-3)}`,
      candidateName: interviewData.candidateName || "New Candidate",
      candidateEmail: interviewData.candidateEmail || "candidate@example.com",
      candidateRole: interviewData.jobTitle || "Software Engineer",
      jobId: "JOB-101",
      jobTitle: interviewData.jobTitle || "Software Engineer",
      department: interviewData.department || "Engineering",
      round: interviewData.round || "Technical Round 1",
      status: "Scheduled",
      mode: interviewData.mode || "Google Meet",
      scheduledDate: interviewData.scheduledDate || "2026-08-20",
      startTime: interviewData.startTime || "10:00 AM",
      endTime: interviewData.endTime || "11:00 AM",
      durationMinutes: interviewData.durationMinutes || 60,
      meetingLink: interviewData.meetingLink,
      location: interviewData.location,
      interviewers: interviewData.interviewers || [],
      notes: interviewData.notes || "",
      aiMatchScore: interviewData.aiMatchScore || 92,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setInterviews((prev) => [newInterview, ...prev]);
    toast.success(`Interview scheduled successfully for ${newInterview.candidateName}!`);
  };

  const handleConfirmReschedule = (
    interviewId: string,
    newDate: string,
    newTime: string,
    mode: InterviewMode,
    reason: string
  ) => {
    setInterviews((prev) =>
      prev.map((item) =>
        item.id === interviewId
          ? {
              ...item,
              scheduledDate: newDate,
              startTime: newTime,
              mode,
              status: "Rescheduled",
              notes: reason ? `Rescheduled: ${reason}. ${item.notes || ""}` : item.notes,
            }
          : item
      )
    );
    toast.success("Interview rescheduled and calendar invitations updated!");
  };

  const handleSubmitFeedback = (
    interviewId: string,
    feedback: Partial<InterviewFeedback>
  ) => {
    setInterviews((prev) =>
      prev.map((item) =>
        item.id === interviewId
          ? {
              ...item,
              status: "Completed",
              feedbacks: [...(item.feedbacks || []), feedback as InterviewFeedback],
            }
          : item
      )
    );
    toast.success("Interview feedback submitted successfully!");
  };

  const handleCancelInterview = (interviewId: string, candidateName: string) => {
    setInterviews((prev) =>
      prev.map((item) => (item.id === interviewId ? { ...item, status: "Cancelled" } : item))
    );
    toast.info(`Interview with ${candidateName} has been cancelled.`);
  };

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, "_blank", "noopener,noreferrer");
    toast.info("Opening video interview room...");
  };

  const handleExportSchedule = () => {
    const exportData = filteredInterviews.map((item) => ({
      ID: item.id,
      Candidate: item.candidateName,
      Email: item.candidateEmail,
      Position: item.jobTitle,
      Department: item.department,
      Round: item.round,
      Status: item.status,
      Mode: item.mode,
      Date: item.scheduledDate,
      Time: `${item.startTime} - ${item.endTime}`,
      Panel: item.interviewers.map((i) => i.name).join("; "),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Upcoming_Interviews_Schedule_${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    toast.success(`Exported ${filteredInterviews.length} interview records!`);
  };

  return (
    <Page
      title="Upcoming Interviews"
      subtitle="Schedule, manage, and conduct candidate interview rounds with live feedback tracking."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSchedule}
            className="gap-1.5 text-xs font-semibold"
          >
            <Download size={14} />
            Export Schedule
          </Button>
          <Button
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={14} />
            Schedule Interview
          </Button>
        </div>
      }
    >
      {/* Top Stats Overview Header */}
      <UpcomingStats
        totalCount={totalCount}
        todayCount={todayCount}
        rescheduledCount={rescheduledCount}
        pendingFeedbackCount={pendingFeedbackCount}
        avgAiScore={avgAiScore}
        onFilterClick={handleStatFilterClick}
      />

      {/* Toolbar: Search, Filters & View Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, position, panelist..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <X
              size={14}
              className="absolute right-2.5 top-2.5 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            />
          )}
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Date Filter */}
          <select
            value={filters.dateFilter}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateFilter: e.target.value as any }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="tomorrow">Tomorrow Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending_feedback">Pending Feedback</option>
            <option value="rescheduled">Rescheduled</option>
          </select>

          {/* Round Filter */}
          <select
            value={filters.round}
            onChange={(e) => setFilters((prev) => ({ ...prev, round: e.target.value }))}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Rounds</option>
            <option value="Screening">Screening</option>
            <option value="Technical Round 1">Technical Round 1</option>
            <option value="Technical Round 2">Technical Round 2</option>
            <option value="System Design">System Design</option>
            <option value="Culture Fit">Culture Fit</option>
            <option value="Final HR">Final HR</option>
          </select>

          {/* Reset Filters Button */}
          {(filters.search || filters.status !== "all" || filters.round !== "all" || filters.dateFilter !== "all") && (
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "all",
                  round: "all",
                  mode: "all",
                  dateFilter: "all",
                })
              }
              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold px-2 py-1 hover:underline shrink-0"
            >
              <RefreshCw size={13} /> Reset
            </button>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 ml-auto md:ml-2 shrink-0">
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Agenda Timeline View"
            >
              <Calendar size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Data Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area: Agenda Timeline View vs Data Table View */}
      {viewMode === "timeline" ? (
        <UpcomingTimelineView
          interviews={filteredInterviews}
          onQuickView={(interview) => setDetailInterview(interview)}
          onReschedule={(interview) => setRescheduleInterview(interview)}
          onFeedback={(interview) => setFeedbackInterview(interview)}
          onJoinMeeting={handleJoinMeeting}
        />
      ) : (
        <UpcomingTable
          interviews={filteredInterviews}
          onQuickView={(interview) => setDetailInterview(interview)}
          onReschedule={(interview) => setRescheduleInterview(interview)}
          onFeedback={(interview) => setFeedbackInterview(interview)}
          onCancelInterview={handleCancelInterview}
          onJoinMeeting={handleJoinMeeting}
        />
      )}

      {/* Modals */}
      {/* 1. Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleNewInterview}
      />

      {/* 2. Reschedule Interview Modal */}
      <RescheduleInterviewModal
        isOpen={!!rescheduleInterview}
        onClose={() => setRescheduleInterview(null)}
        interview={rescheduleInterview}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* 3. Submit Feedback Scorecard Modal */}
      <SubmitFeedbackModal
        isOpen={!!feedbackInterview}
        onClose={() => setFeedbackInterview(null)}
        interview={feedbackInterview}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {/* 4. Interview Detail Quick Drawer */}
      <InterviewDetailModal
        isOpen={!!detailInterview}
        onClose={() => setDetailInterview(null)}
        interview={detailInterview}
        onReschedule={(interview) => setRescheduleInterview(interview)}
        onFeedback={(interview) => setFeedbackInterview(interview)}
        onJoinMeeting={handleJoinMeeting}
      />
    </Page>
  );
};

export default UpcomingInterviewsPage;
