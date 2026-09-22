import { apiClient } from "@/app/api/client/api-client";
import type { DynamicField, DynamicTableColumn } from "../items/DynamicFieldModal";

export interface DynamicFieldCreatePayload {
  name: string;
  key?: string;
  type: string;
  description?: string;
  templateId?: string;
  versionId?: number;
  status?: string;
  value?: string;
  columns?: Array<{
    name: string;
    key?: string;
    type?: string;
    status?: string;
  }>;
}

export interface DynamicFieldUpdatePayload {
  name?: string;
  key?: string;
  type?: string;
  description?: string;
  status?: string;
  value?: string;
  columns?: Array<{
    name: string;
    key?: string;
    type?: string;
    status?: string;
  }>;
}

export interface DynamicFieldResponse {
  id: string;
  templateId?: string;
  versionId: number;
  name: string;
  key: string;
  type: string;
  description: string;
  status: string;
  value?: string;
  columns: Array<{
    id: string;
    dynamicFieldId: string;
    name: string;
    key: string;
    type: string;
    status: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Normalizes backend response to frontend DynamicField interface.
 */
export function mapResponseToDynamicField(item: DynamicFieldResponse): DynamicField {
  const normType = (item.type || "text").toLowerCase();
  const fieldType = normType === "column" ? "table" : (normType as any);

  const mappedCols: DynamicTableColumn[] = (item.columns || []).map((c) => ({
    id: String(c.id),
    name: c.name,
    key: c.key,
    type: (c.type || "text").toLowerCase() as any,
  }));

  return {
    id: String(item.id),
    name: item.name,
    key: item.key,
    type: fieldType,
    description: item.description || "",
    value: item.value || undefined,
    columns: mappedCols.length > 0 ? mappedCols : undefined,
    color:
      fieldType === "image"
        ? "emerald"
        : fieldType === "date"
          ? "orange"
          : fieldType === "number"
            ? "blue"
            : fieldType === "table"
              ? "indigo"
              : "purple",
  };
}

export const dynamicFieldsApi = {
  /**
   * List dynamic fields with optional templateId or search filter.
   */
  async getDynamicFields(templateId?: string, search?: string): Promise<DynamicField[]> {
    const params: Record<string, string> = {};
    if (templateId) params.templateId = templateId;
    if (search?.trim()) params.search = search.trim();

    const response = await apiClient.get<DynamicFieldResponse[]>("/dynamic-fields", { params });
    const list = response.data || [];
    return list.map(mapResponseToDynamicField);
  },

  /**
   * List dynamic fields specifically linked to a master word template.
   */
  async getFieldsByTemplate(templateId: string): Promise<DynamicField[]> {
    const response = await apiClient.get<DynamicFieldResponse[]>(
      `/master-word-templates/${templateId}/dynamic-fields`
    );
    const list = response.data || [];
    return list.map(mapResponseToDynamicField);
  },

  /**
   * Get a single dynamic field by ID.
   */
  async getDynamicField(fieldId: string): Promise<DynamicField> {
    const response = await apiClient.get<DynamicFieldResponse>(`/dynamic-fields/${fieldId}`);
    return mapResponseToDynamicField(response.data);
  },

  /**
   * Create a new dynamic field.
   */
  async createDynamicField(payload: DynamicFieldCreatePayload): Promise<DynamicField> {
    const response = await apiClient.post<DynamicFieldResponse>("/dynamic-fields", payload);
    return mapResponseToDynamicField(response.data);
  },

  /**
   * Update an existing dynamic field by ID.
   */
  async updateDynamicField(
    fieldId: string,
    payload: DynamicFieldUpdatePayload
  ): Promise<DynamicField> {
    const response = await apiClient.put<DynamicFieldResponse>(
      `/dynamic-fields/${fieldId}`,
      payload
    );
    return mapResponseToDynamicField(response.data);
  },

  /**
   * Soft-delete a dynamic field and its child columns by ID.
   */
  async deleteDynamicField(fieldId: string): Promise<void> {
    await apiClient.delete(`/dynamic-fields/${fieldId}`);
  },

  /**
   * Bulk create or sync dynamic fields for a template.
   */
  async bulkSync(templateId: string, fields: DynamicField[]): Promise<DynamicField[]> {
    const payloadFields: DynamicFieldCreatePayload[] = fields.map((f) => ({
      name: f.name,
      key: f.key,
      type: f.type === "table" ? "COLUMN" : f.type.toUpperCase(),
      description: f.description,
      templateId,
      value: f.value,
      columns: f.columns?.map((c) => ({
        name: c.name,
        key: c.key,
        type: (c.type || "text").toUpperCase(),
      })),
    }));

    const response = await apiClient.post<DynamicFieldResponse[]>("/dynamic-fields/bulk-sync", {
      templateId,
      fields: payloadFields,
    });
    const list = response.data || [];
    return list.map(mapResponseToDynamicField);
  },
};

export default dynamicFieldsApi;
