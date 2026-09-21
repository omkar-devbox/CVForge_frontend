import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { JsonFormRenderer } from "@/shared/ui/formField/items/JsonFormRenderer";
import { masterWordFormSchema } from "../data/masterWordSchema";
import { X } from "lucide-react";
import type { MasterWordFormValues } from "../types/masterWord.types";

interface MasterWordFormProps {
  onClose: () => void;
  onSubmit: (data: MasterWordFormValues) => void;
}

export const MasterWordForm: React.FC<MasterWordFormProps> = ({ onClose, onSubmit }) => {
  const [formValues, setFormValues] = useState<Partial<MasterWordFormValues>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCreate = () => {
    const newErrors: Record<string, string> = {};
    if (!formValues.templateName) newErrors.templateName = "Template Name is required";
    if (!formValues.file) newErrors.file = "File is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    toast.success("Master Word template created successfully!");
    onSubmit(formValues as MasterWordFormValues);
    setFormValues({});
  };

  const handleCancel = () => {
    setFormValues({});
    setErrors({});
    onClose();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative w-full mb-6">
      <button 
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        title="Close form"
        onClick={handleCancel}
      >
        <X size={20} />
      </button>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">New Template</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the details and upload a .docx file.</p>
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
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleCreate}>Create Template</Button>
      </div>
    </div>
  );
};
