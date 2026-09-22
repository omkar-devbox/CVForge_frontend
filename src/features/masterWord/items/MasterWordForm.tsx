import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { JsonFormRenderer } from "@/shared/ui/formField/items/JsonFormRenderer";
import { X, Loader2 } from "lucide-react";
import type { MasterWordFormValues } from "../types/masterWord.types";
import type { JsonFormFieldSchema } from "@/shared/ui/formField/types/types";

const masterWordFormSchema: JsonFormFieldSchema[] = [
  {
    name: "templateName",
    label: "Template Name",
    type: "text",
    required: true,
    placeholder: "e.g. Master Document A",
    colSpan: "full",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    required: false,
    placeholder: "Enter template description...",
    colSpan: "full",
  },
  {
    name: "file",
    label: "Upload File (.docx)",
    type: "file",
    required: true,
    colSpan: "full",
    accept: ".docx",
  },
];

interface MasterWordFormProps {
  onClose: () => void;
  onSubmit: (data: MasterWordFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const MasterWordForm: React.FC<MasterWordFormProps> = ({
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formValues, setFormValues] = useState<Partial<MasterWordFormValues>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!formValues.templateName?.trim()) {
      newErrors.templateName = "Template Name is required";
    }
    if (!formValues.file) {
      newErrors.file = "A .docx file is required";
    } else if (!formValues.file.name.toLowerCase().endsWith(".docx")) {
      newErrors.file = "Uploaded file must be in .docx format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    try {
      await onSubmit(formValues as MasterWordFormValues);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create template. Please try again.");
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setFormValues({});
    setErrors({});
    onClose();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative w-full mb-6">
      <button
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
        title="Close form"
        disabled={isSubmitting}
        onClick={handleCancel}
      >
        <X size={20} />
      </button>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          New Master Word Template
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fill in the details and upload a .docx document to automatically extract variables and initialize the template.
        </p>
      </div>

      <JsonFormRenderer
        schema={masterWordFormSchema}
        values={formValues}
        errors={errors}
        onChange={handleChange}
        gridCols={1}
        gap="md"
      />

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={isSubmitting}
          className="gap-2 min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            "Create Template"
          )}
        </Button>
      </div>
    </div>
  );
};
