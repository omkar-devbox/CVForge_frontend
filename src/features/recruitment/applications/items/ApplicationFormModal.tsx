import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/button";
import { JsonFormRenderer } from "@/shared/ui/formField";
import { Code, FormInput, FileCheck2, AlertCircle } from "lucide-react";
import { APPLICATION_FORM_JSON_SCHEMA } from "../data/applicationFormSchema";
import type { CandidateApplication, ApplicationStage, ApplicationStatus } from "../types/application.types";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApplication: (appData: Partial<CandidateApplication>) => void;
  editingApplication?: CandidateApplication | null;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  onSaveApplication,
  editingApplication,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<"ui" | "json">("ui");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (editingApplication) {
      const initialVals = {
        candidateName: editingApplication.candidateName,
        candidateEmail: editingApplication.candidateEmail,
        candidatePhone: editingApplication.candidatePhone,
        jobTitle: editingApplication.jobTitle,
        department: editingApplication.department,
        location: editingApplication.location,
        experienceYears: editingApplication.experienceYears,
        matchScore: editingApplication.matchScore,
        stage: editingApplication.stage,
        status: editingApplication.status,
        currentCompany: editingApplication.currentCompany,
        currentRole: editingApplication.currentRole,
        expectedSalary: editingApplication.expectedSalary,
        noticePeriod: editingApplication.noticePeriod,
        summary: editingApplication.summary || "",
      };
      setFormValues(initialVals);
      setJsonText(JSON.stringify(initialVals, null, 2));
    } else {
      const defaultVals = {
        candidateName: "",
        candidateEmail: "",
        candidatePhone: "",
        jobTitle: "Senior Mechanical Engineer",
        department: "Engineering",
        location: "Pune, India",
        experienceYears: 4,
        matchScore: 85,
        stage: "Sourced" as ApplicationStage,
        status: "Active" as ApplicationStatus,
        currentCompany: "",
        currentRole: "",
        expectedSalary: "₹15,00,000 PA",
        noticePeriod: "30 Days",
        summary: "",
      };
      setFormValues(defaultVals);
      setJsonText(JSON.stringify(defaultVals, null, 2));
    }
    setJsonError(null);
  }, [editingApplication, isOpen]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const updated = { ...formValues, [fieldName]: value };
    setFormValues(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setFormValues(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (viewMode === "json" && jsonError) {
      return;
    }

    const finalData: Partial<CandidateApplication> = {
      ...(editingApplication ? { id: editingApplication.id } : {}),
      candidateName: formValues.candidateName || "New Candidate",
      candidateEmail: formValues.candidateEmail || "candidate@example.com",
      candidatePhone: formValues.candidatePhone || "+91 90000 00000",
      jobTitle: formValues.jobTitle || "Senior Mechanical Engineer",
      department: formValues.department || "Engineering",
      location: formValues.location || "Pune, India",
      experienceYears: Number(formValues.experienceYears) || 0,
      matchScore: Number(formValues.matchScore) || 80,
      stage: formValues.stage || "Sourced",
      status: formValues.status || "Active",
      currentCompany: formValues.currentCompany || "N/A",
      currentRole: formValues.currentRole || "Engineer",
      expectedSalary: formValues.expectedSalary || "Competitive",
      noticePeriod: formValues.noticePeriod || "30 Days",
      summary: formValues.summary || "",
      rating: editingApplication?.rating || 4,
      skills: editingApplication?.skills || ["Engineering", "Communication"],
      tags: editingApplication?.tags || ["New Candidate"],
      notes: editingApplication?.notes || [],
    };

    onSaveApplication(finalData);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={editingApplication ? `Edit Application: ${editingApplication.candidateName}` : "Add New Candidate Application"}
        description="Form generated dynamically from JSON schema definition"
        onClose={onClose}
      />

      <ModalBody className="p-6 max-h-[75vh] overflow-y-auto">
        {/* View Switcher */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 mb-6">
          <div className="flex items-center gap-2">
            <FormInput className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Form Mode: {viewMode === "ui" ? "JSON Schema UI Renderer" : "Raw JSON Data Editor"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("ui")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "ui"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FormInput className="w-3.5 h-3.5" />
              UI Form
            </button>
            <button
              type="button"
              onClick={() => setViewMode("json")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === "json"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              JSON Code
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} id="application-form">
          {viewMode === "ui" ? (
            <JsonFormRenderer
              schema={APPLICATION_FORM_JSON_SCHEMA}
              values={formValues}
              onChange={handleFieldChange}
              gridCols={2}
              gap="md"
            />
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly edit the candidate JSON object.
              </p>
              <textarea
                value={jsonText}
                onChange={handleJsonTextChange}
                rows={16}
                className="w-full font-mono text-xs p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              {jsonError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
          )}
        </form>
      </ModalBody>

      <ModalFooter className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="application-form"
          leftIcon={<FileCheck2 className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {editingApplication ? "Save Changes" : "Submit Application"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
