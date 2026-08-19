import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Briefcase, Send } from "lucide-react";
import type { PooledCandidate, ActiveJobOpening } from "../types/talentpool.types";

interface AssignToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: PooledCandidate[];
  activeJobs: ActiveJobOpening[];
  onConfirmAssign: (jobId: string, stage: string) => void;
}

export const AssignToJobModal: React.FC<AssignToJobModalProps> = ({
  isOpen,
  onClose,
  candidates,
  activeJobs,
  onConfirmAssign,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobs[0]?.id || "");
  const [targetStage, setTargetStage] = useState<string>("Screening");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJobId) return;
    onConfirmAssign(selectedJobId, targetStage);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Assign Candidate(s) to Active Job Opening"
          description={`Inject ${candidates.length} selected candidate(s) directly into a live recruitment pipeline.`}
          onClose={onClose}
        />
        <ModalBody className="space-y-4">
          {/* Candidates List Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Selected Talent ({candidates.length})
            </span>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {candidates.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                    {c.fullName[0]}
                  </div>
                  {c.fullName}
                </span>
              ))}
            </div>
          </div>

          {/* Select Job Opening */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Target Requisition / Job Opening
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeJobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{job.department}</span> &bull; <span>{job.location}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {job.openPositions} Openings
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline Stage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Pipeline Stage
            </label>
            <select
              value={targetStage}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetStage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="New">New Applicant</option>
              <option value="Screening">Recruiter Screening</option>
              <option value="Interview">Technical Interview</option>
              <option value="Offer">Offer Stage</option>
            </select>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="gap-1.5">
            <Send size={14} />
            Assign {candidates.length} Candidate(s)
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
