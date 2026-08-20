import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { JsonFormRenderer } from "@/shared/ui/formField";
import {
  FileCheck2,
  ArrowLeft,
  Briefcase,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { JOB_FORM_JSON_SCHEMA } from "../data/jobFormSchema";
import type { JobPosting, JobStatus } from "../types/jobs.types";

interface JobFormProps {
  onCancel: () => void;
  onSaveJob: (jobData: Partial<JobPosting>) => void;
  editingJob?: JobPosting | null;
}

export const JobForm: React.FC<JobFormProps> = ({
  onCancel,
  onSaveJob,
  editingJob,
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Initialize form values
  useEffect(() => {
    if (editingJob) {
      const initialVals = {
        title: editingJob.title || "",
        department: editingJob.department || "Engineering",
        employmentType: editingJob.employmentType || "Full-time",
        location: editingJob.location || "Pune, India",
        experienceLevel: editingJob.experienceLevel || "Senior",
        salaryRange: editingJob.salaryRange || "₹15,00,000 - ₹25,00,000 PA",
        status: editingJob.status || ("Open" as JobStatus),
        hiringManagerName: editingJob.hiringManager?.name || "",
        hiringManagerEmail: editingJob.hiringManager?.email || "",
        description: editingJob.description || "",
        requirements: editingJob.requirements ? editingJob.requirements.join("\n") : "",
        benefits: editingJob.benefits ? editingJob.benefits.join("\n") : "",
      };
      setFormValues(initialVals);
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
    }
  }, [editingJob]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleResetForm = () => {
    if (editingJob) {
      const initialVals = {
        title: editingJob.title || "",
        department: editingJob.department || "Engineering",
        employmentType: editingJob.employmentType || "Full-time",
        location: editingJob.location || "Pune, India",
        experienceLevel: editingJob.experienceLevel || "Senior",
        salaryRange: editingJob.salaryRange || "₹15,00,000 - ₹25,00,000 PA",
        status: editingJob.status || ("Open" as JobStatus),
        hiringManagerName: editingJob.hiringManager?.name || "",
        hiringManagerEmail: editingJob.hiringManager?.email || "",
        description: editingJob.description || "",
        requirements: editingJob.requirements ? editingJob.requirements.join("\n") : "",
        benefits: editingJob.benefits ? editingJob.benefits.join("\n") : "",
      };
      setFormValues(initialVals);
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert newline text back to arrays for requirements and benefits
    const reqArray =
      typeof formValues.requirements === "string"
        ? formValues.requirements
            .split("\n")
            .map((s: string) => s.replace(/^-\s*/, "").trim())
            .filter(Boolean)
        : formValues.requirements || [];

    const benArray =
      typeof formValues.benefits === "string"
        ? formValues.benefits
            .split("\n")
            .map((s: string) => s.replace(/^-\s*/, "").trim())
            .filter(Boolean)
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
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onCancel}
              className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Back to Job List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingJob ? `Edit Job Opening: ${editingJob.title}` : "Create New Job Opening"}
                </h2>
                {editingJob && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/80">
                    ID: {editingJob.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {editingJob
                  ? "Update posting details, hiring team, role requirements, and compensation."
                  : "Fill out the job parameters below to publish a new job opening to recruitment channels."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="job-page-form"
              leftIcon={<FileCheck2 className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-xs"
            >
              {editingJob ? "Save Changes" : "Post Job Opening"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Form Content Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} id="job-page-form" className="p-6 md:p-8">
          <div className="space-y-8">
            {/* Form Section Header / Notice */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs">
                All fields marked with <span className="text-red-500 font-bold">*</span> are required for publishing across connected channels.
              </span>
            </div>

            {/* Dynamic JSON Schema Form Renderer */}
            <div className="grid grid-cols-1 gap-6">
              <JsonFormRenderer
                schema={JOB_FORM_JSON_SCHEMA}
                values={formValues}
                onChange={handleFieldChange}
                gridCols={2}
                gap="lg"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/90 dark:border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Reset Values
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-5 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<FileCheck2 className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 shadow-xs"
              >
                {editingJob ? "Save Changes" : "Post Job Opening"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
