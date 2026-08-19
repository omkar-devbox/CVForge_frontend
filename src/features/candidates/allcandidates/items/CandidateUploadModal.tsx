import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { Upload, Copy, AlertCircle } from "lucide-react";
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
        description="Paste JSON candidate records below to import multiple profiles into the database."
        onClose={onClose}
      />

      <ModalBody className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
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
