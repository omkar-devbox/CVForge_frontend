import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Upload, FileCode2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import type { JobPosting } from "../types/jobs.types";

interface JobUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportJobs: (jobs: JobPosting[]) => void;
}

export const JobUploadModal: React.FC<JobUploadModalProps> = ({
  isOpen,
  onClose,
  onImportJobs,
}) => {
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<JobPosting[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      parseFile(text);
    };

    reader.readAsText(file);
  };

  const parseFile = (text: string) => {
    try {
      const json = JSON.parse(text);
      const items = Array.isArray(json) ? json : [json];

      const validated: JobPosting[] = items.map((item, idx) => ({
        id: item.id || `JOB-IMP-${Date.now()}-${idx}`,
        title: item.title || "Imported Job Posting",
        department: item.department || "Engineering",
        location: item.location || "Remote",
        employmentType: item.employmentType || "Full-time",
        experienceLevel: item.experienceLevel || "Mid-Level",
        salaryRange: item.salaryRange || "Competitive",
        status: item.status || "Open",
        applicationsCount: item.applicationsCount || 0,
        postedDate: item.postedDate || new Date().toISOString().split("T")[0],
        daysOpen: item.daysOpen || 1,
        hiringManager: item.hiringManager || {
          id: `HM-${Date.now()}`,
          name: "Imported Manager",
          email: "manager@company.com",
          role: "Hiring Manager",
        },
        teamMembers: item.teamMembers || [],
        description: item.description || "Imported job description.",
        requirements: item.requirements || [],
        benefits: item.benefits || [],
        channels: item.channels || [
          { id: "c1", name: "LinkedIn", iconName: "Linkedin", status: "Published" },
          { id: "c2", name: "Company Career Page", iconName: "Globe", status: "Published" },
        ],
        pipelineStages: item.pipelineStages || [
          { id: "s1", name: "Sourced", count: 0, color: "bg-blue-500" },
          { id: "s2", name: "Screened", count: 0, color: "bg-indigo-500" },
          { id: "s3", name: "Interviewing", count: 0, color: "bg-purple-500" },
          { id: "s4", name: "Offered", count: 0, color: "bg-amber-500" },
          { id: "s5", name: "Hired", count: 0, color: "bg-emerald-500" },
        ],
      }));

      setParsedPreview(validated);
      setError(null);
    } catch (err: any) {
      setError("Invalid JSON format. Please upload a valid JSON array or object containing job definitions.");
      setParsedPreview([]);
    }
  };

  const handleImport = () => {
    if (parsedPreview.length > 0) {
      onImportJobs(parsedPreview);
      setFileContent("");
      setFileName(null);
      setParsedPreview([]);
      setError(null);
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title="Upload & Import Job Openings File"
        description="Upload a JSON or CSV file with job definitions to bulk create openings"
        onClose={onClose}
      />

      <ModalBody className="p-6 space-y-6">
        {/* Dropzone Upload Area */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 transition-all cursor-pointer relative">
          <input
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {fileName ? fileName : "Click to upload or drag & drop file here"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supported formats: .JSON, .CSV (Job schemas & batch definitions)
          </p>
        </div>

        {/* Status / Errors / Preview */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {parsedPreview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Parsed {parsedPreview.length} Job Opening(s) successfully
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {parsedPreview.map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.department} • {item.location} • {item.employmentType}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {item.salaryRange}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          disabled={parsedPreview.length === 0}
          leftIcon={<FileCode2 className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Import {parsedPreview.length > 0 ? `(${parsedPreview.length}) Jobs` : "File"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
