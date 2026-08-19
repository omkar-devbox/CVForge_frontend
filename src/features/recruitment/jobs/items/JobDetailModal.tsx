import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/Badge";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  Share2,
  Edit3,
  Globe,
  ExternalLink,
  Layers,
  UserCheck,
  Building2,
  Calendar,
} from "lucide-react";
import type { JobPosting, JobStatus } from "../types/jobs.types";

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPosting | null;
  onEditJob: (job: JobPosting) => void;
  onShareJob: (job: JobPosting) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}

const getStatusBadgeVariant = (status: JobStatus): "success" | "warning" | "danger" | "info" => {
  switch (status) {
    case "Open":
      return "success";
    case "On Hold":
      return "warning";
    case "Closed":
      return "danger";
    case "Draft":
    default:
      return "info";
  }
};

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  isOpen,
  onClose,
  job,
  onEditJob,
  onShareJob,
  onStatusChange,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "team" | "channels">("overview");

  if (!job) return null;

  const totalCandidates = job.pipelineStages.reduce((sum, s) => sum + s.count, 0);

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={job.title}
        description={`${job.department} • ${job.location} • ${job.employmentType}`}
        onClose={onClose}
      />

      <ModalBody className="p-6 max-h-[75vh] overflow-y-auto">
        {/* Header Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <Badge variant={getStatusBadgeVariant(job.status)} rounded dot>
                {job.status}
              </Badge>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {job.employmentType} ({job.experienceLevel})
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              {job.salaryRange}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <strong className="text-slate-900 dark:text-slate-100">{job.applicationsCount}</strong> applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Posted {job.postedDate} ({job.daysOpen} days ago)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
              onClick={() => onShareJob(job)}
            >
              Share Link
            </Button>
            <Button
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onEditJob(job);
              }}
            >
              Edit Job
            </Button>
          </div>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Overview & Requirements
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "pipeline"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Candidate Pipeline (Funnel)
            <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px]">
              {totalCandidates}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === "team"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Team Members ({job.teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab("channels")}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === "channels"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Posting Channels ({job.channels.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Job Description
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Key Requirements & Qualifications
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  Perks & Benefits
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {job.benefits.map((ben, index) => (
                    <li key={index} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pipeline View (Mini Funnel) */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Recruitment Pipeline Funnel
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total Active Candidates: <strong>{totalCandidates}</strong>
                </span>
              </div>

              {/* Funnel Progress Visual Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-3 flex overflow-hidden mb-6">
                {job.pipelineStages.map((stage) => {
                  const pct = totalCandidates > 0 ? (stage.count / totalCandidates) * 100 : 0;
                  return (
                    <div
                      key={stage.id}
                      style={{ width: `${pct}%` }}
                      className={`${stage.color || "bg-blue-500"} h-full transition-all`}
                      title={`${stage.name}: ${stage.count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Stage Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {job.pipelineStages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between"
                  >
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      Stage {idx + 1}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 mb-2">
                      {stage.name}
                    </div>
                    <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                      {stage.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Team Members */}
        {activeTab === "team" && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Assigned Hiring Team
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {member.role}
                    </p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Posting Channels */}
        {activeTab === "channels" && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-purple-500" />
              Job Posting Channels Status
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {job.channels.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {ch.name}
                      </p>
                      {ch.publishedDate && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Published: {ch.publishedDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        ch.status === "Published"
                          ? "success"
                          : ch.status === "Pending"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                    >
                      {ch.status}
                    </Badge>

                    {ch.url && (
                      <a
                        href={ch.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="View Live Posting"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Change Status:</span>
          {(["Open", "On Hold", "Closed", "Draft"] as JobStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(job.id, st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                job.status === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
