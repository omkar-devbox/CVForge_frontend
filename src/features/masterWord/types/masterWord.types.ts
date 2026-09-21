export interface MasterWordFormValues {
  templateName: string;
  description?: string;
  file?: File;
}

export interface TemplateRecord {
  id: string;
  templateName: string;
  description: string;
  fileName: string;
  createdAt: string;
  category: string;
  version: string;
  status: "Active Production" | "Published" | "Draft" | "Restricted Access";
  size: string;
  variables: string[];
  author: string;
  authorAvatar: string;
  isJsonSchemaValid: boolean;
}
