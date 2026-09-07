import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { AlertTriangle } from "lucide-react";

export interface CandidateDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: string | null;
  candidateName?: string | null;
  selectedCount?: number;
  onConfirmDelete?: (candidateId: string, candidateName: string) => void;
  onConfirmBulkDelete?: () => void;
}

export const CandidateDeleteModal: React.FC<CandidateDeleteModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  selectedCount,
  onConfirmDelete,
  onConfirmBulkDelete,
}) => {
  const isBulk = typeof selectedCount === "number" && selectedCount > 0;

  const handleConfirm = () => {
    if (isBulk && onConfirmBulkDelete) {
      onConfirmBulkDelete();
    } else if (candidateId && candidateName && onConfirmDelete) {
      onConfirmDelete(candidateId, candidateName);
    }
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <ModalHeader
        title={isBulk ? `Delete ${selectedCount} Candidate Profiles?` : `Delete Candidate Profile?`}
        onClose={onClose}
      />

      <ModalBody className="p-6">
        <div className="flex items-start gap-4 text-slate-900 dark:text-slate-100">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isBulk ? `Delete ${selectedCount} Candidate Profiles?` : `Delete Candidate "${candidateName}"?`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {isBulk
                ? `Are you sure you want to delete the selected ${selectedCount} candidate profile(s)? The profiles will be soft-deleted without permanent data loss.`
                : `Are you sure you want to delete the candidate profile for "${candidateName}"? The profile will be soft-deleted without permanent data loss.`}
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold"
        >
          Confirm Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};
