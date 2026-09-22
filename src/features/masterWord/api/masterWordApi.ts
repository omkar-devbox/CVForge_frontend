import { apiClient } from "@/app/api/client/api-client";
import type {
  MasterWordCreatePayload,
  MasterWordUpdatePayload,
  TemplateFilters,
  TemplateRecord,
} from "../types/masterWord.types";

/**
 * Returns the direct URL to download or preview a template's .docx file.
 */
export const getTemplateFileUrl = (id: string, fileUrl?: string | null): string => {
  if (fileUrl && fileUrl.startsWith("http")) {
    return fileUrl;
  }

  const baseUrl = (import.meta.env?.VITE_API_URL as string) || "http://localhost:8000/api/v1";
  const cleanBase = baseUrl.replace(/\/+$/, "");

  if (fileUrl) {
    if (fileUrl.startsWith("/")) {
      if (fileUrl.startsWith("/api/v1")) {
        const host = cleanBase.replace(/\/api\/v1\/?$/, "");
        return `${host}${fileUrl}`;
      }
      return `${cleanBase}${fileUrl}`;
    }
    return `${cleanBase}/${fileUrl}`;
  }

  return `${cleanBase}/master-word-templates/${id}/file`;
};

export const masterWordApi = {
  /**
   * List all master word templates with optional search, category, or status filters.
   */
  async getTemplates(filters?: TemplateFilters): Promise<TemplateRecord[]> {
    const params: Record<string, string> = {};
    if (filters?.search?.trim()) params.search = filters.search.trim();
    if (filters?.category?.trim()) params.category = filters.category.trim();
    if (filters?.status?.trim()) params.status = filters.status.trim();

    const response = await apiClient.get<TemplateRecord[]>("/master-word-templates", {
      params,
    });
    return response.data || [];
  },

  /**
   * Get a single master word template by its ID.
   */
  async getTemplate(id: string): Promise<TemplateRecord> {
    const response = await apiClient.get<TemplateRecord>(`/master-word-templates/${id}`);
    return response.data;
  },

  /**
   * Upload and create a new master word template (.docx file required).
   */
  async createTemplate(payload: MasterWordCreatePayload): Promise<TemplateRecord> {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("templateName", payload.templateName);
    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (payload.category) {
      formData.append("category", payload.category);
    }
    if (payload.author) {
      formData.append("author", payload.author);
    }
    if (payload.version) {
      formData.append("version", payload.version);
    }

    const response = await apiClient.post<TemplateRecord>("/master-word-templates", formData);
    return response.data;
  },

  /**
   * Update fields on an existing template (name, description, category, variables, etc.).
   */
  async updateTemplate(id: string, payload: MasterWordUpdatePayload): Promise<TemplateRecord> {
    const response = await apiClient.put<TemplateRecord>(`/master-word-templates/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a template and its stored document by ID.
   */
  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/master-word-templates/${id}`);
  },

  /**
   * Trigger browser file download of the template's .docx document.
   */
  async downloadTemplate(id: string, fileName?: string): Promise<void> {
    const url = getTemplateFileUrl(id);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download template file: ${response.statusText}`);
    }
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || `template_${id}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },

  /**
   * Re-extract {{variable}} placeholders from the template .docx file on the server.
   */
  async extractVariables(id: string): Promise<string[]> {
    const response = await apiClient.post<{ variables: string[] }>(
      `/master-word-templates/${id}/extract-variables`
    );
    return response.data?.variables || [];
  },

  /**
   * Resolve template document URL.
   */
  getTemplateFileUrl,
};

export * from "./dynamicFieldsApi";
export default masterWordApi;

