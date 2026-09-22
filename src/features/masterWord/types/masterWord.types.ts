export type TemplateStatus =
  | "Active Production"
  | "Published"
  | "Draft"
  | "Restricted Access";

export interface MasterWordFormValues {
  templateName: string;
  description?: string;
  file?: File;
  category?: string;
  author?: string;
  version?: string;
}

export interface TemplateRecord {
  id: string;
  templateName: string;
  description: string;
  fileName: string;
  fileUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  category: string;
  version: string;
  status: TemplateStatus;
  size: string;
  variables: string[];
  author: string;
  authorAvatar: string;
  isJsonSchemaValid: boolean;
}

export interface TemplateFilters {
  search?: string;
  category?: string;
  status?: string;
}

export interface MasterWordCreatePayload {
  templateName: string;
  description?: string;
  file: File;
  category?: string;
  author?: string;
  version?: string;
}

export interface MasterWordUpdatePayload {
  templateName?: string;
  description?: string;
  category?: string;
  version?: string;
  status?: TemplateStatus;
  variables?: string[];
  isJsonSchemaValid?: boolean;
}
