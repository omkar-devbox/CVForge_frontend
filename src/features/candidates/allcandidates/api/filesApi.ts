import { apiClient } from "@/app/api/client/api-client";
import type { Candidate } from "../types/candidate.types";

export interface UploadMultipleResponse {
  message?: string;
  total_files?: number;
  successful_files?: number;
  failed_files?: number;
  files?: Array<{
    id?: string;
    filename?: string;
    file_name?: string;
    filepath?: string;
    status?: string;
    name?: string;
    candidate_name?: string;
    email?: string;
    phone?: string;
    role?: string;
    current_role?: string;
    company?: string;
    experience_years?: number;
    location?: string;
    skills?: string[];
    degree?: string;
    education?: string[];
  }>;
  candidates?: Candidate[];
}

export interface ManifestStatusResponse {
  status: string;
  source_directory: string;
  upload_directory?: string;
  upload_directory_exists?: boolean;
  total_documents: number;
  extracted_documents: number;
  unprocessed_documents: number;
}

export const filesApi = {
  /**
   * Upload multiple resume documents (POST /api/v1/files/upload-multiple)
   * Saves each file to FilePathUpload and triggers extraction.
   */
  async uploadMultiple(files: File[]): Promise<UploadMultipleResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post<UploadMultipleResponse>(
      "/files/upload-multiple",
      formData
    );
    return response.data;
  },

  /**
   * Upload a single resume document (POST /api/v1/files/upload)
   * Saves to FilePathUpload and performs structured AI extraction.
   */
  async uploadSingle(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/files/upload", formData);
    return response.data;
  },

  /**
   * Fetch all extracted candidates (GET /api/v1/files/candidates)
   */
  async getCandidates(): Promise<Candidate[]> {
    const response = await apiClient.get<Candidate[]>("/files/candidates");
    return response.data;
  },

  /**
   * Fetch all extracted document records (GET /api/v1/files/extracted)
   */
  async getExtractedDocuments() {
    const response = await apiClient.get("/files/extracted");
    return response.data;
  },

  /**
   * Get storage and manifest status (GET /api/v1/files/manifest/status)
   */
  async getManifestStatus(): Promise<ManifestStatusResponse> {
    const response = await apiClient.get<ManifestStatusResponse>(
      "/files/manifest/status"
    );
    return response.data;
  },

  /**
   * Get specific extracted document by file stem (GET /api/v1/files/manifest/extracted/:file_stem)
   */
  async getExtractedByStem(fileStem: string) {
    const response = await apiClient.get(
      `/files/manifest/extracted/${encodeURIComponent(fileStem)}`
    );
    return response.data;
  },
};

export default filesApi;
