import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ApplicationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId?: string | null;
  candidateName?: string | null;
  selectedCount?: number;
  onConfirmDelete?: (appId: string, candidateName: string) => void;
  onConfirmBulkDelete?: () => void;
}

export const ApplicationDeleteModal: React.FC<ApplicationDeleteModalProps> = ({
  isOpen,
  onClose,
  appId,
  candidateName,
  selectedCount = 0,
  onConfirmDelete,
  onConfirmBulkDelete,
}) => {
  const isBulk = selectedCount > 0;

  const handleConfirm = () => {
    if (isBulk && onConfirmBulkDelete) {
      onConfirmBulkDelete();
    } else if (appId && candidateName && onConfirmDelete) {
      onConfirmDelete(appId, candidateName);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="sm">
      <ModalHeader
        title={isBulk ? `Delete ${selectedCount} Applications` : `Delete Application`}
        onClose={onClose}
      />

      <ModalBody className="p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
          {isBulk
            ? `Are you sure you want to delete ${selectedCount} selected candidate applications?`
            : `Are you sure you want to delete application for "${candidateName}"?`}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This action will permanently delete candidate records and interview notes from the recruitment database.
        </p>
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          leftIcon={<Trash2 className="w-4 h-4" />}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
        >
          {isBulk ? `Delete (${selectedCount})` : "Delete Application"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
