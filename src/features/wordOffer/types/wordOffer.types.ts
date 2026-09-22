export type WordOfferStatus =
  | "Draft"
  | "Under Review"
  | "Sent"
  | "Accepted"
  | "Rejected"
  | "Expired"
  | "Active"
  | "ACTIVE";

export interface BOQItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface OfferClause {
  id: string;
  title: string;
  content: string;
  isMandatory: boolean;
}

export interface WordOfferDynamicColumnResponse {
  id: string;
  dynamicFieldId: string;
  name: string;
  key: string;
  type: string;
  status: string;
}

export interface WordOfferDynamicFieldResponse {
  id: string;
  templateId?: string;
  versionId: number;
  name: string;
  key: string;
  type: string;
  description?: string;
  status: string;
  value?: string | null;
  columns?: WordOfferDynamicColumnResponse[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WordOfferTemplateResponse {
  id: string;
  templateName: string;
  description: string;
  fileName: string;
  filePath?: string | null;
  category: string;
  version: string;
  versionId?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  dynamicFields: WordOfferDynamicFieldResponse[];
  totalFieldsCount: number;
}

export interface WordOfferTemplateListResponse {
  templates: WordOfferTemplateResponse[];
  totalCount: number;
}

export interface WordOfferRecord {
  id: string;
  offerNumber: string;
  title: string;
  clientName: string;
  clientContact?: string;
  clientEmail?: string;
  project: string;
  templateId?: string;
  templateName?: string;
  status: WordOfferStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  validUntil: string;
  version: string;
  notes?: string;
  preparedBy: string;
  variables: Record<string, string>;
  boqItems: BOQItem[];
  clauses: OfferClause[];
  fileName?: string;
  filePath?: string | null;
  dynamicFieldsCount?: number;
  dynamicFields?: WordOfferDynamicFieldResponse[];
}

export interface WordOfferFilters {
  search?: string;
  status?: string;
  category?: string;
  sortBy?: "date" | "amount" | "offerNumber";
  sortOrder?: "asc" | "desc";
}

export type WordOfferNavView = "all" | "create" | "templates" | "clauses";

