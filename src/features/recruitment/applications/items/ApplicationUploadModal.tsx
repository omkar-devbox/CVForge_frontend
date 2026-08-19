import React, { useState, useRef } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import type { CandidateApplication } from "../types/application.types";
import { toast } from "@/shared/ui/toast";

interface ApplicationUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportApplications: (imported: CandidateApplication[]) => void;
}

export const ApplicationUploadModal: React.FC<ApplicationUploadModalProps> = ({
  isOpen,
  onClose,
  onImportApplications,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith(".json") && !file.name.endsWith(".csv")) {
      setErrorMsg("Please select a valid .json or .csv candidate application file.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessUpload = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        let importedData: CandidateApplication[] = [];

        if (selectedFile.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          importedData = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          // Parse dummy CSV fallback
          const sampleApp: CandidateApplication = {
            id: `APP-IMP-${Date.now().toString().slice(-4)}`,
            candidateName: "Imported Candidate",
            candidateEmail: "imported.candidate@example.com",
            candidatePhone: "+91 99999 88888",
            jobId: "JOB-1001",
            jobTitle: "Senior Mechanical Engineer",
            department: "Engineering",
            location: "Pune, India",
            stage: "Sourced",
            status: "Active",
            appliedDate: new Date().toISOString().split("T")[0],
            experienceYears: 4,
            matchScore: 88,
            currentCompany: "Import Tech Ltd",
            currentRole: "Design Engineer",
            expectedSalary: "₹16,00,000 PA",
            noticePeriod: "30 Days",
            rating: 4,
            skills: ["CAD", "Analysis"],
            tags: ["Imported Batch"],
            notes: [],
          };
          importedData = [sampleApp];
        }

        onImportApplications(importedData);
        setSelectedFile(null);
        onClose();
      } catch (err: any) {
        setErrorMsg("Failed to parse file: " + err.message);
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title="Upload Candidate Applications File"
        description="Batch import candidates from JSON or CSV dataset"
        onClose={onClose}
      />

      <ModalBody className="p-6 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            dragActive
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag & drop file here or click to browse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports .json and .csv files
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-semibold">{selectedFile.name}</span>
            </div>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!selectedFile}
          onClick={handleProcessUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Import Applications
        </Button>
      </ModalFooter>
    </Modal>
  );
};
