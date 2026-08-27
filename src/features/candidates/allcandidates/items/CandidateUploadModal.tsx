import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Upload, Copy, AlertCircle, FileJson } from "lucide-react";
import type { Candidate } from "../types/candidate.types";

export interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCandidates: (candidates: Candidate[]) => void;
}

const SAMPLE_CANDIDATE_JSON: Partial<Candidate>[] = [
  {
    fullName: "Arjun Mehta",
    email: "arjun.m@cloudtech.com",
    phone: "+91 91234 56789",
    currentRole: "Cloud Solutions Architect",
    company: "CloudScale Systems",
    experienceYears: 8,
    location: "Bengaluru, India",
    skills: ["AWS", "Terraform", "Kubernetes", "Python"],
    status: "Active",
    stage: "New",
    source: "LinkedIn",
    noticePeriod: "30 Days",
    rating: 5,
  },
];

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({
  isOpen,
  onClose,
  onImportCandidates,
}) => {
  const [jsonText, setJsonText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const readFileAsText = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = () => reject(new Error(file.name));
      reader.readAsText(file);
    });

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    setErrorMsg(null);
    const mergedCandidates: any[] = [];
    const skippedFiles: string[] = [];

    for (const file of files) {
      try {
        const parsed = JSON.parse(await readFileAsText(file));
        mergedCandidates.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch {
        skippedFiles.push(file.name);
      }
    }

    setFileNames(files.map((f) => f.name));
    setJsonText(mergedCandidates.length ? JSON.stringify(mergedCandidates, null, 2) : "");
    if (skippedFiles.length) {
      setErrorMsg(`Skipped file(s) with invalid JSON: ${skippedFiles.join(", ")}`);
    }

    // Reset so re-selecting the same file(s) still fires onChange
    input.value = "";
  };

  const handleImport = () => {
    try {
      setErrorMsg(null);
      if (!jsonText.trim()) {
        setErrorMsg("Please paste JSON candidate data before importing.");
        return;
      }
      const parsed = JSON.parse(jsonText);
      const candidatesArray = Array.isArray(parsed) ? parsed : [parsed];

      const formattedCandidates: Candidate[] = candidatesArray.map((c: any, index: number) => ({
        id: c.id || `CND-${Date.now() + index}`,
        fullName: c.fullName || "Imported Candidate",
        email: c.email || `candidate_${index + 1}@example.com`,
        phone: c.phone || "+91 90000 00000",
        currentRole: c.currentRole || "Software Engineer",
        company: c.company || "Tech Inc.",
        experienceYears: c.experienceYears || 3,
        location: c.location || "Remote",
        skills: c.skills || ["Engineering"],
        primarySkill: c.primarySkill || (c.skills && c.skills[0]) || "Engineering",
        highestDegree: c.highestDegree || "B.Tech",
        status: c.status || "Active",
        stage: c.stage || "New",
        source: c.source || "Bulk Import",
        appliedJobTitle: c.appliedJobTitle || "General Application",
        rating: c.rating || 4,
        noticePeriod: c.noticePeriod || "30 Days",
        currentSalary: c.currentSalary || "N/A",
        expectedSalary: c.expectedSalary || "N/A",
        resumeFileName: c.resumeFileName || "Resume_Imported.pdf",
        tags: c.tags || ["Imported"],
        createdAt: new Date().toISOString().split("T")[0],
        lastActivity: new Date().toISOString().split("T")[0],
        notes: [],
        applicationHistory: [],
      }));

      onImportCandidates(formattedCandidates);
      setJsonText("");
      setFileNames([]);
      onClose();
    } catch (err: any) {
      setErrorMsg("Invalid JSON format. Please verify syntax.");
    }
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_CANDIDATE_JSON, null, 2));
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title="Bulk Import Candidates"
        description="Upload one or more JSON files, or paste candidate records below, to import multiple profiles into the database."
        onClose={onClose}
      />

      <ModalBody className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Multi-file Dropzone Upload Area */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 transition-all cursor-pointer relative">
          <input
            type="file"
            multiple
            accept=".json,.txt"
            onChange={handleFilesUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {fileNames.length
              ? `${fileNames.length} file(s) loaded`
              : "Click to upload or drag & drop one or more files"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supported formats: .JSON, .TXT (candidate records are merged into one batch)
          </p>
        </div>

        {fileNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {fileNames.map((name) => (
              <span
                key={name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-[11px] font-medium text-blue-700 dark:text-blue-300"
              >
                <FileJson className="w-3.5 h-3.5 shrink-0" />
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "fullName": "Arjun Mehta",\n    "email": "arjun@example.com",\n    "currentRole": "Cloud Architect"\n  }\n]`}
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={handleCopySample}
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Copy className="w-3.5 h-3.5" />
            {copiedSample ? "Copied Sample JSON!" : "Copy Sample JSON Payload"}
          </button>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          leftIcon={<Upload className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Import Candidate Records
        </Button>
      </ModalFooter>
    </Modal>
  );
};
