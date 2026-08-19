import React, { useRef } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { AlertOctagon, Trash2, Briefcase, ShieldAlert } from "lucide-react";

export interface JobDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string | null;
  jobTitle?: string | null;
  selectedCount?: number;
  onConfirmDelete?: (jobId: string, title: string) => void;
  onConfirmBulkDelete?: () => void;
}

export const JobDeleteModal: React.FC<JobDeleteModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  selectedCount = 1,
  onConfirmDelete,
  onConfirmBulkDelete,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  const isBulk = selectedCount > 1 || jobId === "BULK";

  const handleDelete = () => {
    if (isBulk && onConfirmBulkDelete) {
      onConfirmBulkDelete();
    } else if (jobId && jobTitle && onConfirmDelete) {
      onConfirmDelete(jobId, jobTitle);
    }
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      initialFocusRef={cancelButtonRef}
    >
      <ModalHeader
        title={isBulk ? `Bulk Delete Jobs (${selectedCount})` : "Delete Job Opening"}
        onClose={onClose}
      />

      <ModalBody className="space-y-4 pt-2 pb-4">
        {/* Warning Badge & Icon Header */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 text-red-600 dark:text-red-400">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-700 dark:text-red-300">
              Permanent Action Warning
            </h4>
            <p className="text-[11px] text-red-600/90 dark:text-red-400/90 mt-0.5">
              This process cannot be reversed once confirmed.
            </p>
          </div>
        </div>

        {/* Job Details Card Preview */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{isBulk ? "Target Job Openings" : "Target Job Opening"}</span>
          </div>
          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 break-words">
            {isBulk ? `${selectedCount} Job Openings Selected` : jobTitle}
          </div>
          {!isBulk && jobId && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              ID: {jobId}
            </div>
          )}
        </div>

        {/* Informational warning message */}
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-1">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {isBulk
              ? `Deleting these ${selectedCount} job openings will permanently remove all attached candidate applications, pipeline stages, and notes.`
              : "Deleting this position will also permanently erase all attached applicant records, interview feedback, and active pipeline progress."}
          </span>
        </div>
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          ref={cancelButtonRef}
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          {isBulk ? `Delete ${selectedCount} Jobs` : "Delete Job"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
