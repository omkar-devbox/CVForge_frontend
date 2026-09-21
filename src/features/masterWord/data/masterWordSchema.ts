import type { JsonFormFieldSchema } from "@/shared/ui";

export const masterWordFormSchema: JsonFormFieldSchema[] = [
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
  }
];
