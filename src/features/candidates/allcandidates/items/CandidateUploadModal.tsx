import React, { useState, useRef } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import {
  Upload,
  AlertCircle,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { candidatesApi, formatNameFromFilename } from "../../services/candidatesApi";
import type { Candidate } from "../types/candidate.types";

export interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCandidates: (candidates: Candidate[]) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({
  isOpen,
  onClose,
  onImportCandidates,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => {
      // Filter out duplicate files by name and size
      const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const uniqueNew = newFiles.filter((f) => !existingNames.has(`${f.name}-${f.size}`));
      return [...prev, ...uniqueNew];
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleImportFiles = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg("Please select or drop at least one file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const createdCandidates = await candidatesApi.uploadFiles(selectedFiles);
      onImportCandidates(createdCandidates);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleModalClose = () => {
    if (!isUploading) {
      setErrorMsg(null);
      setSelectedFiles([]);
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={handleModalClose} size="lg">
      <ModalHeader
        title="Upload Multiple Files"
        description="Select or drag and drop multiple candidate resumes to upload files into FilePathUpload."
        onClose={handleModalClose}
      />

      <ModalBody className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 scale-[1.01]"
                : "border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.rtf"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Click to browse or drag & drop multiple files here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports PDF, DOCX, DOC (saved to FilePathUpload and auto-extracted)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Selected Files ({selectedFiles.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 hover:underline font-medium"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                        {file.name}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={handleModalClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleImportFiles}
          disabled={isUploading || selectedFiles.length === 0}
          leftIcon={
            isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {isUploading
            ? "Uploading Files..."
            : selectedFiles.length > 0
            ? `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}`
            : "Upload Files"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
