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
import { JOB_FORM_JSON_SCHEMA } from "../data/jobFormSchema";
import type { JobPosting, JobStatus } from "../types/jobs.types";

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (jobData: Partial<JobPosting>) => void;
  editingJob?: JobPosting | null;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
  editingJob,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<"ui" | "json">("ui");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize form values when modal opens or editingJob changes
  useEffect(() => {
    if (editingJob) {
      const initialVals = {
        title: editingJob.title,
        department: editingJob.department,
        employmentType: editingJob.employmentType,
        location: editingJob.location,
        experienceLevel: editingJob.experienceLevel,
        salaryRange: editingJob.salaryRange,
        status: editingJob.status,
        hiringManagerName: editingJob.hiringManager?.name || "",
        hiringManagerEmail: editingJob.hiringManager?.email || "",
        description: editingJob.description,
        requirements: editingJob.requirements ? editingJob.requirements.join("\n") : "",
        benefits: editingJob.benefits ? editingJob.benefits.join("\n") : "",
      };
      setFormValues(initialVals);
      setJsonText(JSON.stringify(initialVals, null, 2));
    } else {
      const defaultVals = {
        title: "",
        department: "Engineering",
        employmentType: "Full-time",
        location: "Pune, India",
        experienceLevel: "Senior",
        salaryRange: "₹15,00,000 - ₹25,00,000 PA",
        status: "Open" as JobStatus,
        hiringManagerName: "Aniket Sharma",
        hiringManagerEmail: "aniket.sharma@systemmechatronics.com",
        description: "",
        requirements: "",
        benefits: "",
      };
      setFormValues(defaultVals);
      setJsonText(JSON.stringify(defaultVals, null, 2));
    }
    setJsonError(null);
  }, [editingJob, isOpen]);

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

    // Convert newline text back to arrays for requirements and benefits
    const reqArray = typeof formValues.requirements === "string"
      ? formValues.requirements.split("\n").map((s: string) => s.replace(/^-\s*/, "").trim()).filter(Boolean)
      : formValues.requirements || [];

    const benArray = typeof formValues.benefits === "string"
      ? formValues.benefits.split("\n").map((s: string) => s.replace(/^-\s*/, "").trim()).filter(Boolean)
      : formValues.benefits || [];

    const finalData: Partial<JobPosting> = {
      ...(editingJob ? { id: editingJob.id } : {}),
      title: formValues.title || "Untitled Job",
      department: formValues.department || "Engineering",
      location: formValues.location || "Remote",
      employmentType: formValues.employmentType || "Full-time",
      experienceLevel: formValues.experienceLevel || "Senior",
      salaryRange: formValues.salaryRange || "Competitive",
      status: formValues.status || "Open",
      hiringManager: {
        id: editingJob?.hiringManager?.id || `HM-${Date.now()}`,
        name: formValues.hiringManagerName || "Hiring Manager",
        email: formValues.hiringManagerEmail || "manager@company.com",
        role: "Hiring Manager",
      },
      description: formValues.description || "",
      requirements: reqArray,
      benefits: benArray,
    };

    onSaveJob(finalData);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={editingJob ? `Edit Job Opening: ${editingJob.title}` : "Create New Job Opening"}
        description="Form generated dynamically from JSON schema definition"
        onClose={onClose}
      />

      <ModalBody className="p-6 max-h-[75vh] overflow-y-auto">
        {/* Toggle UI Form / JSON Schema View */}
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

        <form onSubmit={handleSubmit} id="job-form">
          {viewMode === "ui" ? (
            /* Rendered via JsonFormRenderer */
            <JsonFormRenderer
              schema={JOB_FORM_JSON_SCHEMA}
              values={formValues}
              onChange={handleFieldChange}
              gridCols={2}
              gap="md"
            />
          ) : (
            /* Direct JSON Code Editor */
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly edit the JSON payload for this job opening. Changes sync live with the form UI.
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
          form="job-form"
          leftIcon={<FileCheck2 className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {editingJob ? "Save Changes" : "Post Job Opening"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
