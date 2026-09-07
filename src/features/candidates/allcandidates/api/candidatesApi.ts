import { apiClient } from "@/app/api/client/api-client";
import type { Candidate } from "../types/candidate.types";
import { candidatesApi as serviceCandidatesApi } from "../../services/candidatesApi";

export interface CandidateListApiResponse {
  total: number;
  limit: number;
  offset: number;
  items: Array<{
    document_id?: number;
    file_name: string;
    file_size?: number;
    status?: string;
    project_name?: string;
    extraction_id?: number;
    overall_confidence?: number;
    created_at?: string;
    full_name?: string;
    email?: string[] | string;
    skills: string[];
    ats_overall_score?: number;
    overall_profile?: string;
  }>;
}

export interface CandidateDetailApiResponse {
  document_id?: number;
  project_id?: number;
  project_name?: string;
  file_name: string;
  status?: string;
  created_at?: string;
  extraction_id?: number;
  overall_confidence?: number;
  extracted_at?: string;
  full_name?: string;
  email: string[];
  contact_no: string[];
  summary?: string;
  skills: string[];
  experience: any[];
  education: any[];
  certifications: any[];
  languages: string[];
  links?: Record<string, any>;
  ats_score?: Record<string, any>;
  overall_profile?: string;
  metadata?: Record<string, any>;
  _traceability?: Record<string, any>;
}

export interface CandidateStatsApiResponse {
  project_name: string;
  total_documents: number;
  processed_count: number;
  failed_count: number;
  processing_count: number;
  avg_confidence?: number;
  top_skills: Array<{ skill: string; count: number }>;
}

export const candidatesApi = {
  ...serviceCandidatesApi,

  /**
   * List candidates from GET /api/v1/candidates with filters & pagination
   */
  async listCandidates(params?: {
    project_name?: string;
    status?: string;
    overall_profile?: string;
    min_ats_score?: number;
    limit?: number;
    offset?: number;
  }): Promise<CandidateListApiResponse> {
    const response = await apiClient.get<any>("/candidates", { params });
    return response.data?.data || response.data;
  },

  /**
   * Search candidates across keyword query and skills: GET /api/v1/candidates/search
   */
  async searchCandidates(params: {
    q?: string;
    skills?: string;
    project_name?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await apiClient.get<any>("/candidates/search", { params });
    return response.data?.data || response.data;
  },

  /**
   * Get candidate statistics: GET /api/v1/candidates/stats
   */
  async getStatistics(projectName?: string): Promise<CandidateStatsApiResponse> {
    const response = await apiClient.get<any>("/candidates/stats", {
      params: projectName ? { project_name: projectName } : undefined,
    });
    return response.data?.data || response.data;
  },

  /**
   * Get full candidate resume details: GET /api/v1/candidates/:id
   */
  async getCandidateById(documentId: number | string): Promise<CandidateDetailApiResponse> {
    const response = await apiClient.get<any>(`/candidates/${documentId}`);
    return response.data?.data || response.data;
  },

  /**
   * Get candidate profile classification: GET /api/v1/candidates/:id/profile
   */
  async getCandidateProfile(documentId: number | string) {
    const response = await apiClient.get<any>(`/candidates/${documentId}/profile`);
    return response.data?.data || response.data;
  },

  /**
   * Get candidate page layout & bounding boxes: GET /api/v1/candidates/:id/layout
   */
  async getCandidateLayout(documentId: number | string, pageNumber?: number) {
    const response = await apiClient.get<any>(`/candidates/${documentId}/layout`, {
      params: pageNumber ? { page_number: pageNumber } : undefined,
    });
    return response.data?.data || response.data;
  },

  /**
   * Edit candidate profile: PATCH /api/v1/candidates/:id/profile
   */
  async editCandidateProfile(documentId: number | string, payload: any) {
    const response = await apiClient.patch<any>(`/candidates/${documentId}/profile`, payload);
    return response.data?.data || response.data;
  },

  /**
   * Update candidate field value (human review): PATCH /api/v1/candidates/:id/field
   */
  async updateCandidateField(
    documentId: number | string,
    fieldName: string,
    newValue: any
  ) {
    const response = await apiClient.patch<any>(`/candidates/${documentId}/field`, {
      field_name: fieldName,
      new_value: newValue,
    });
    return response.data?.data || response.data;
  },

  /**
   * Explicitly marks candidate document as soft-deleted: POST /api/v1/candidates/:id/soft-delete
   */
  async softDeleteCandidate(documentId: number | string) {
    const response = await apiClient.post<any>(
      `/candidates/${documentId}/soft-delete`,
      null,
      { headers: { Accept: "application/json" } }
    );
    return response.data?.data || response.data;
  },

  /**
   * Restores a soft-deleted candidate document: POST /api/v1/candidates/:id/restore
   */
  async restoreCandidate(documentId: number | string) {
    const response = await apiClient.post<any>(
      `/candidates/${documentId}/restore`,
      null,
      { headers: { Accept: "application/json" } }
    );
    return response.data?.data || response.data;
  },

  /**
   * Delete candidate document: POST /api/v1/candidates/:id/soft-delete or DELETE /api/v1/candidates/:id
   */
  async deleteCandidate(documentId: number | string, softDelete: boolean = true) {
    if (softDelete) {
      return this.softDeleteCandidate(documentId);
    }
    const response = await apiClient.delete<any>(`/candidates/${documentId}`, {
      params: { soft_delete: false },
    });
    return response.data?.data || response.data;
  },
};

export default candidatesApi;
