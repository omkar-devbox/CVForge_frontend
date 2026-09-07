import { apiClient } from "@/app/api/client/api-client";
import type { Candidate, CandidateStatus, CandidateStage, CandidateNote, CandidateApplicationHistory } from "../allcandidates/types/candidate.types";

/* =========================================================
   🔹 BACKEND API TYPES (matching app/api/candidates/schemas.py)
========================================================= */

export interface BackendCandidateSummary {
  document_id?: number | null;
  file_name: string;
  file_size?: number | null;
  status?: string | null;
  project_name?: string | null;
  extraction_id?: number | null;
  overall_confidence?: number | null;
  created_at?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string[] | string | null;
  phone?: string[] | string | null;
  contact_no?: string[] | string | null;
  role?: string | null;
  skills?: string[] | string | null;
  experience?: any;
  education?: any;
  highest_degree?: string | null;
  experience_years?: number | null;
  total_experience?: number | string | null;
  notice_period?: string | null;
  current_ctc?: string | null;
  expected_ctc?: string | null;
  source?: string | null;
  note?: string | null;
  notes?: Array<{ id?: string; author?: string; text?: string; date?: string; created_at?: string; timestamp?: string }> | null;
  location?: string | null;
  ats_overall_score?: number | null;
  overall_profile?: string | null;
  download_url?: string | null;
}

export interface BackendCandidateListResponse {
  total: number;
  limit: number;
  offset: number;
  items: BackendCandidateSummary[];
}

export interface BackendCandidateDetailResponse {
  document_id?: number | null;
  project_id?: number | null;
  project_name?: string | null;
  file_name: string;
  status?: string | null;
  created_at?: string | null;
  extraction_id?: number | null;
  overall_confidence?: number | null;
  extracted_at?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string[];
  contact_no?: string[];
  phone?: string[];
  role?: string | null;
  summary?: string | null;
  skills?: string[];
  experience?: Array<{
    role?: string | null;
    company?: string | null;
    duration?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    location?: string | null;
    highlights?: string[];
    is_current?: boolean;
  }>;
  education?: Array<{
    degree?: string | null;
    institution?: string | null;
    duration?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    details?: string | null;
  }> | string;
  total_experience?: number | string | null;
  notice_period?: string | null;
  current_ctc?: string | null;
  expected_ctc?: string | null;
  source?: string | null;
  note?: string | null;
  notes?: Array<{ id?: string; author?: string; text?: string; date?: string; created_at?: string; timestamp?: string }> | null;
  location?: string | null;
  certifications?: Array<string | any>;
  languages?: string[];
  links?: {
    github?: string | null;
    linkedin?: string | null;
    portfolio?: string | null;
    others?: string[];
  } | null;
  ats_score?: {
    grade?: string;
    overall_score?: number;
    score?: number;
    strengths?: string[];
    suggestions?: string[];
    skills_score?: number;
    experience_score?: number;
  } | null;
  overall_profile?: string | null;
  download_url?: string | null;
  metadata?: Record<string, any> | null;
}

export interface BackendStandardResponse<T> {
  success: boolean;
  status_code?: number;
  message?: string | null;
  data: T;
}

export interface EditCandidateProfilePayload {
  full_name?: string;
  name?: string;
  email?: string;
  contact_no?: string;
  phone?: string;
  status?: string;
  notice_period?: string;
  current_ctc?: string;
  expected_ctc?: string;
  source?: string;
  note?: string;
  remarks?: string;
}

export interface EditCandidateProfileResponse {
  success: boolean;
  document_id: number;
  message: string;
  candidate: BackendCandidateSummary;
}

export interface ListCandidatesParams {
  project_name?: string;
  status?: string;
  overall_profile?: string;
  min_ats_score?: number;
  limit?: number;
  offset?: number;
}

export interface SearchCandidatesParams {
  q?: string;
  skills?: string;
  project_name?: string;
  limit?: number;
  offset?: number;
}

/* =========================================================
   🔹 HELPER FUNCTIONS FOR DATA NORMALIZATION
========================================================= */

export const parseExperienceYears = (exp: any): number => {
  if (exp === null || exp === undefined) return 0;
  if (typeof exp === "number") return exp;
  if (typeof exp === "string") {
    const match = exp.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return 0;
};

export interface ParsedEducation {
  degree: string;
  institution?: string;
  year?: string;
  formattedText: string;
}

/**
 * Parses a single education entry string or object, stripping any raw '|'.
 */
export function parseSingleEducation(input: any): ParsedEducation {
  if (!input) return { degree: "", formattedText: "" };

  if (typeof input === "object" && !Array.isArray(input)) {
    const degree = String(
      input.degree || input.course || input.title || input.qualification || input.name || ""
    ).trim();
    const institution = String(
      input.institution || input.college || input.university || input.school || ""
    ).trim();
    const year = String(
      input.year || input.duration || input.end_date || input.passing_year || ""
    ).trim();
    const parts = [degree, institution, year].filter(Boolean);
    return {
      degree,
      institution: institution || undefined,
      year: year || undefined,
      formattedText: parts.join(" • "),
    };
  }

  let str = String(input).trim();
  if (!str || str === "—" || str === "-" || str.toLowerCase() === "n/a") {
    return { degree: "", formattedText: "" };
  }

  // Remove any pipe characters from the single entry string
  str = str.replace(/\|+/g, " ").trim();

  // Extract year pattern e.g. 2018-2022, 2021, etc.
  let year = "";
  const yearMatch = str.match(/\b(19\d\d|20\d\d)(?:\s*[-–—]\s*(19\d\d|20\d\d|present|current))?\b/i);
  if (yearMatch) {
    year = yearMatch[0];
    str = str.replace(yearMatch[0], "").replace(/\(\s*\)/g, "").trim();
  }

  // Check delimiters: " from ", " at ", " - ", ", "
  const delimiters = [" from ", " at ", " - ", ", "];
  for (const delim of delimiters) {
    if (str.includes(delim)) {
      const parts = str.split(delim);
      const degreePart = parts[0].trim();
      const instPart = parts
        .slice(1)
        .join(" ")
        .replace(/^[,\-\s]+|[,\-\s]+$/g, "")
        .trim();
      if (degreePart) {
        const partsList = [degreePart, instPart, year].filter(Boolean);
        return {
          degree: degreePart,
          institution: instPart || undefined,
          year: year || undefined,
          formattedText: partsList.join(" • "),
        };
      }
    }
  }

  return {
    degree: str,
    year: year || undefined,
    formattedText: [str, year].filter(Boolean).join(" • "),
  };
}

/**
 * Parses all educations from input.
 * If input contains '|', splits by '|' because each pipe section represents a new education!
 * If input is an array, parses each item in order.
 */
export function parseAllEducations(input: any): ParsedEducation[] {
  if (!input) return [];

  let data = input;
  // If string, check if it's stringified JSON
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed || trimmed === "—" || trimmed === "-" || trimmed.toLowerCase() === "n/a") {
      return [];
    }
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        data = JSON.parse(trimmed);
      } catch {
        // keep as string
      }
    }
  }

  // If array of objects or strings
  if (Array.isArray(data)) {
    return data
      .map((item) => parseSingleEducation(item))
      .filter((edu) => Boolean(edu.degree && edu.degree !== "—" && edu.degree !== "-"));
  }

  // If single object
  if (data && typeof data === "object") {
    const single = parseSingleEducation(data);
    return single.degree ? [single] : [];
  }

  // If string: SPLIT BY '|' (each pipe indicates a new education record)
  if (typeof data === "string") {
    const trimmed = data.trim();
    const rawItems = trimmed.includes("|")
      ? trimmed.split("|").map((s) => s.trim()).filter(Boolean)
      : [trimmed];

    return rawItems
      .map((item) => parseSingleEducation(item))
      .filter((edu) => Boolean(edu.degree && edu.degree !== "—" && edu.degree !== "-"));
  }

  return [];
}

/**
 * Returns primary (first / highest) education entry.
 */
export function parseEducation(input: any): ParsedEducation {
  const all = parseAllEducations(input);
  if (all.length === 0) return { degree: "", formattedText: "" };
  return all[0];
}

/**
 * Normalizes raw education data into pipe-delimited format so all degrees are preserved.
 */
export function normalizeEducationRaw(input: any): string {
  if (!input) return "";
  if (typeof input === "string") return input.trim();
  if (Array.isArray(input)) {
    return input
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const parts = [
            item.degree || item.course || item.title || item.qualification,
            item.institution || item.college || item.university,
            item.year || item.duration,
          ].filter(Boolean);
          return parts.join(", ");
        }
        return String(item);
      })
      .filter(Boolean)
      .join(" | ");
  }
  if (typeof input === "object") {
    const parts = [
      input.degree || input.course || input.title || input.qualification,
      input.institution || input.college || input.university,
      input.year || input.duration,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return String(input);
}

export const formatNameFromFilename = (fileName: string): string => {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const cleanName = baseName
    .replace(/[-_]/g, " ")
    .replace(/\b(resume|cv|profile|document|candidate|resumekraftcom)\b/gi, "")
    .trim();
  if (!cleanName) return "—";
  return cleanName
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Normalizes backend CandidateSummary into the frontend Candidate model.
 * If data is missing or empty, returns empty string/0 so UI renders '—' (no hardcoded fake values).
 */
export function mapCandidateSummaryToCandidate(
  item: BackendCandidateSummary,
  idx: number = 0
): Candidate {
  const candidateName =
    item.full_name?.trim() ||
    item.name?.trim() ||
    (item.file_name ? formatNameFromFilename(item.file_name) : "—");

  // Format email - do NOT hardcode example.com
  let primaryEmail = "";
  if (Array.isArray(item.email) && item.email.length > 0) {
    primaryEmail = item.email[0]?.trim() || "";
  } else if (typeof item.email === "string" && item.email.trim()) {
    primaryEmail = item.email.trim();
  }

  // Format phone - do NOT hardcode fake phone number
  let primaryPhone = "";
  const rawPhone = item.contact_no || item.phone;
  if (Array.isArray(rawPhone) && rawPhone.length > 0) {
    primaryPhone = rawPhone[0]?.trim() || "";
  } else if (typeof rawPhone === "string" && rawPhone.trim()) {
    primaryPhone = rawPhone.trim();
  }

  // Determine role & company - do NOT hardcode Software Engineer or Tech Systems
  const role = item.role?.trim() || item.overall_profile?.trim() || "";
  const company = item.project_name?.trim() || "";

  // Skills - do NOT hardcode fake skills
  let skills: string[] = [];
  if (Array.isArray(item.skills)) {
    skills = item.skills.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof item.skills === "string" && (item.skills as string).trim()) {
    skills = (item.skills as string).split(",").map((s) => s.trim()).filter(Boolean);
  }
  const primarySkill = skills[0] || item.overall_profile?.trim() || "";

  // Calculate rating (1 to 5) from ATS score if present
  let rating = 0;
  if (typeof item.ats_overall_score === "number" && item.ats_overall_score > 0) {
    rating = Math.min(5, Math.max(1, Math.round(item.ats_overall_score / 20)));
  }

  // Normalize status
  let status: CandidateStatus = "Active";
  const rawStatus = (item.status || "").toLowerCase();
  if (rawStatus === "failed") status = "Archived";
  else if (rawStatus === "hired") status = "Hired";
  else if (rawStatus === "interviewing") status = "Interviewing";
  else if (rawStatus === "in pipeline") status = "In Pipeline";

  const id = item.document_id ? String(item.document_id) : `CND-${Date.now().toString().slice(-4)}${idx}`;

  const tags = [
    item.overall_profile?.trim(),
    ...(skills.slice(0, 2)),
    item.file_name?.split(".").pop()?.toUpperCase(),
  ].filter(Boolean) as string[];

  const formattedDate = item.created_at
    ? String(item.created_at).trim()
    : "";

  const experienceYears = parseExperienceYears(
    item.total_experience ?? item.experience_years ?? item.experience
  );

  const highestDegree = normalizeEducationRaw(item.education ?? item.highest_degree);
  const noticePeriod = item.notice_period?.trim() || "";
  const location = item.location?.trim() || "";
  const expectedSalary = item.expected_ctc?.trim() || "";

  // Notes mapping from backend notes array or note field
  let notes: CandidateNote[] = [];
  if (Array.isArray(item.notes) && item.notes.length > 0) {
    notes = item.notes.map((n: any, i: number) => ({
      id: String(n.id || `NOTE-${item.document_id || idx}-${i}`),
      author: String(n.author || "Recruiter Note"),
      text: String(n.text || n.note || ""),
      date: String(n.date || n.created_at || formattedDate),
    }));
  } else if (item.note?.trim()) {
    notes = [
      {
        id: `NOTE-${item.document_id || Date.now()}-backend`,
        author: "Recruiter Note",
        text: item.note.trim(),
        date: formattedDate,
      },
    ];
  }
  const note = item.note?.trim() || (notes.length > 0 ? notes[0].text : "") || "";

  return {
    id,
    fullName: candidateName,
    email: primaryEmail,
    phone: primaryPhone,
    currentRole: role,
    company,
    experienceYears,
    location,
    skills,
    primarySkill,
    overallProfile: item.overall_profile?.trim() || "",
    highestDegree,
    status,
    stage: "New",
    source: item.source?.trim() || (item.project_name ? `Project: ${item.project_name}` : ""),
    appliedJobTitle: role,
    rating,
    noticePeriod,
    currentSalary: item.current_ctc?.trim() || "",
    expectedSalary,
    resumeFileName: item.file_name,
    downloadUrl: item.download_url || undefined,
    tags,
    createdAt: formattedDate,
    lastActivity: formattedDate,
    notes,
    note,
    applicationHistory: [],
  };
}

/**
 * Normalizes full backend CandidateDetailResponse into frontend Candidate model.
 * If data is missing or empty, returns empty string/0 so UI renders '—' (no hardcoded fake values).
 */
export function mapCandidateDetailToCandidate(
  detail: BackendCandidateDetailResponse
): Candidate {
  const candidateName =
    detail.full_name?.trim() ||
    detail.name?.trim() ||
    (detail.file_name ? formatNameFromFilename(detail.file_name) : "—");

  // Email - do NOT hardcode example.com
  let primaryEmail = "";
  if (Array.isArray(detail.email) && detail.email.length > 0) {
    primaryEmail = detail.email[0]?.trim() || "";
  } else if (typeof detail.email === "string" && (detail.email as string).trim()) {
    primaryEmail = (detail.email as string).trim();
  }

  // Phone - do NOT hardcode fake phone number
  let primaryPhone = "";
  const rawPhone = detail.contact_no || detail.phone;
  if (Array.isArray(rawPhone) && rawPhone.length > 0) {
    primaryPhone = rawPhone[0]?.trim() || "";
  } else if (typeof rawPhone === "string" && rawPhone.trim()) {
    primaryPhone = rawPhone.trim();
  }

  // Role & Company from experience or direct fields - do NOT hardcode
  const primaryExp = detail.experience?.[0];
  const role =
    primaryExp?.role?.trim() ||
    detail.role?.trim() ||
    detail.overall_profile?.trim() ||
    "";
  const company = primaryExp?.company?.trim() || detail.project_name?.trim() || "";
  const location = primaryExp?.location?.trim() || detail.location?.trim() || "";

  // Skills - do NOT hardcode fake skills
  let skills: string[] = [];
  if (Array.isArray(detail.skills)) {
    skills = detail.skills.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof (detail as any).skills === "string") {
    skills = ((detail as any).skills as string).split(",").map((s) => s.trim()).filter(Boolean);
  }
  const primarySkill = skills[0] || detail.overall_profile?.trim() || "";

  // Degree from education field - normalized via normalizeEducationRaw
  const degree = normalizeEducationRaw(detail.education);

  // Rating from ATS score
  let rating = 0;
  const atsScore = detail.ats_score?.score ?? detail.ats_score?.overall_score ?? detail.overall_confidence;
  if (typeof atsScore === "number" && atsScore > 0) {
    rating = Math.min(5, Math.max(1, Math.round(atsScore / 20)));
  }

  // Tags
  const tags = [
    detail.overall_profile?.trim(),
    ...(skills.slice(0, 3)),
    detail.file_name?.split(".").pop()?.toUpperCase(),
  ].filter(Boolean) as string[];

  // Notes from backend notes array or note field
  let notes: CandidateNote[] = [];
  if (Array.isArray(detail.notes) && detail.notes.length > 0) {
    notes = detail.notes.map((n: any, i: number) => ({
      id: String(n.id || `NOTE-${detail.document_id || Date.now()}-${i}`),
      author: String(n.author || "Recruiter Note"),
      text: String(n.text || n.note || ""),
      date: String(n.date || n.created_at || (detail.created_at ? String(detail.created_at).trim() : "")),
    }));
  } else if (detail.note?.trim()) {
    notes = [
      {
        id: `NOTE-${detail.document_id || Date.now()}-recruiter`,
        author: "Recruiter Note",
        text: detail.note.trim(),
        date: detail.created_at ? String(detail.created_at).trim() : "",
      },
    ];
  }
  const note = detail.note?.trim() || (notes.length > 0 ? notes[0].text : "") || "";

  // Normalize status from backend detail response
  let status: CandidateStatus = "Active";
  const rawStatus = (detail.status || "").toLowerCase();
  if (rawStatus === "failed" || rawStatus === "archived") status = "Archived";
  else if (rawStatus === "hired") status = "Hired";
  else if (rawStatus === "interviewing") status = "Interviewing";
  else if (rawStatus === "in pipeline") status = "In Pipeline";
  else if (rawStatus === "blacklisted") status = "Blacklisted";

  // Experience as Application History / Work History
  const applicationHistory: CandidateApplicationHistory[] = (detail.experience || []).map((exp, i) => ({
    id: `HIST-${detail.document_id}-${i}`,
    jobId: `JOB-${i + 1}`,
    jobTitle: exp.role?.trim() || role || "—",
    department: exp.company?.trim() || company || "—",
    appliedDate: exp.start_date || (detail.created_at ? String(detail.created_at).split("T")[0] : ""),
    stage: "New",
    status: "Active",
  }));

  const formattedDate = detail.created_at
    ? String(detail.created_at).trim()
    : "";

  const experienceYears = parseExperienceYears(
    detail.total_experience ?? (detail.experience?.length ? detail.experience.length : 0)
  );

  const noticePeriod = detail.notice_period?.trim() || "";
  const currentSalary = detail.current_ctc?.trim() || "";
  const expectedSalary = detail.expected_ctc?.trim() || "";
  const source = detail.source?.trim() || (detail.project_name ? `Project: ${detail.project_name}` : "");

  return {
    id: detail.document_id ? String(detail.document_id) : `CND-${Date.now()}`,
    fullName: candidateName,
    email: primaryEmail,
    phone: primaryPhone,
    currentRole: role,
    company,
    experienceYears,
    location,
    skills,
    primarySkill,
    overallProfile: detail.overall_profile?.trim() || "",
    highestDegree: degree,
    status,
    stage: "New",
    source,
    appliedJobTitle: role,
    rating,
    noticePeriod,
    currentSalary,
    expectedSalary,
    resumeFileName: detail.file_name,
    resumeUrl: detail.links?.linkedin || undefined,
    downloadUrl: detail.download_url || undefined,
    tags,
    createdAt: formattedDate,
    lastActivity: detail.extracted_at ? String(detail.extracted_at).split("T")[0] : formattedDate,
    notes,
    note,
    applicationHistory,
  };
}

/* =========================================================
   🔹 CANDIDATES API SERVICE
========================================================= */

export const candidatesApi = {
  /**
   * Fetches paginated & filtered candidates from GET /api/v1/candidates.
   */
  async listCandidates(params: ListCandidatesParams = {}): Promise<{ total: number; items: Candidate[] }> {
    try {
      const response = await apiClient.get<BackendStandardResponse<BackendCandidateListResponse>>(
        "/candidates",
        {
          params: {
            limit: params.limit ?? 50,
            offset: params.offset ?? 0,
            project_name: params.project_name,
            status: params.status && params.status !== "All" ? params.status : undefined,
            overall_profile: params.overall_profile && params.overall_profile !== "All" ? params.overall_profile : undefined,
            min_ats_score: params.min_ats_score,
          },
        }
      );

      const data = response.data?.data;
      if (data && Array.isArray(data.items)) {
        return {
          total: data.total ?? data.items.length,
          items: data.items.map((item, idx) => mapCandidateSummaryToCandidate(item, idx)),
        };
      }
    } catch (err) {
      console.warn("Error calling GET /candidates:", err);
    }
    return { total: 0, items: [] };
  },

  /**
   * Searches candidates using GET /api/v1/candidates/search.
   */
  async searchCandidates(params: SearchCandidatesParams): Promise<Candidate[]> {
    try {
      const response = await apiClient.get<BackendStandardResponse<BackendCandidateSummary[]>>(
        "/candidates/search",
        {
          params: {
            q: params.q,
            skills: params.skills,
            project_name: params.project_name,
            limit: params.limit ?? 20,
            offset: params.offset ?? 0,
          },
        }
      );

      const data = response.data?.data;
      if (Array.isArray(data)) {
        return data.map((item, idx) => mapCandidateSummaryToCandidate(item, idx));
      }
    } catch (err) {
      console.warn("Error searching candidates via GET /candidates/search:", err);
    }
    return [];
  },

  /**
   * Fetches full structured candidate resume details from GET /api/v1/candidates/{document_id}.
   */
  async getCandidateById(documentId: string | number): Promise<Candidate | null> {
    try {
      const response = await apiClient.get<BackendStandardResponse<BackendCandidateDetailResponse>>(
        `/candidates/${documentId}`
      );
      if (response.data?.data) {
        return mapCandidateDetailToCandidate(response.data.data);
      }
    } catch (err) {
      console.warn(`Error fetching candidate ${documentId} via GET /candidates/{id}:`, err);
    }
    return null;
  },

  /**
   * Fetches candidate resume by file stem from GET /api/v1/candidates/by-stem/{file_stem}.
   */
  async getCandidateByStem(fileStem: string): Promise<Candidate | null> {
    try {
      const response = await apiClient.get<BackendStandardResponse<BackendCandidateDetailResponse>>(
        `/candidates/by-stem/${encodeURIComponent(fileStem)}`
      );
      if (response.data?.data) {
        return mapCandidateDetailToCandidate(response.data.data);
      }
    } catch (err) {
      console.warn(`Error fetching candidate by stem ${fileStem}:`, err);
    }
    return null;
  },

  /**
   * Edit Candidate Profile (Contact & Recruitment Details)
   * PATCH /api/v1/candidates/{document_id}/profile
   * Strictly restricted to the 9 editable fields:
   * full_name, email, contact_no, status, notice_period, current_ctc, expected_ctc, source, note
   */
  async editCandidateProfile(
    documentId: string | number,
    payload: EditCandidateProfilePayload
  ): Promise<{ success: boolean; candidate?: Candidate; message?: string }> {
    try {
      const response = await apiClient.patch<BackendStandardResponse<EditCandidateProfileResponse>>(
        `/candidates/${documentId}/profile`,
        payload
      );
      const resData = response.data?.data;
      if (resData?.candidate) {
        return {
          success: true,
          candidate: mapCandidateSummaryToCandidate(resData.candidate),
          message: resData.message || response.data?.message || "Candidate profile updated successfully.",
        };
      }
      return {
        success: true,
        message: response.data?.message || "Candidate profile updated successfully.",
      };
    } catch (err: any) {
      console.warn(`PATCH /candidates/${documentId}/profile failed, trying fallback /candidates/${documentId}:`, err);
      try {
        const response = await apiClient.patch<BackendStandardResponse<EditCandidateProfileResponse>>(
          `/candidates/${documentId}`,
          payload
        );
        const resData = response.data?.data;
        if (resData?.candidate) {
          return {
            success: true,
            candidate: mapCandidateSummaryToCandidate(resData.candidate),
            message: resData.message || response.data?.message || "Candidate profile updated successfully.",
          };
        }
        return {
          success: true,
          message: response.data?.message || "Candidate profile updated successfully.",
        };
      } catch (fallbackErr) {
        console.error(`Failed to edit candidate profile for document ${documentId}:`, fallbackErr);
        throw fallbackErr;
      }
    }
  },

  /**
   * Updates a candidate field via PATCH /api/v1/candidates/{document_id}/field.
   */
  async updateCandidateField(
    documentId: string | number,
    fieldName: string,
    newValue: any
  ): Promise<boolean> {
    try {
      const response = await apiClient.patch<{ success: boolean; message: string }>(
        `/candidates/${documentId}/field`,
        {
          field_name: fieldName,
          new_value: newValue,
        }
      );
      return response.data?.success ?? true;
    } catch (err) {
      console.warn(`Error updating field ${fieldName} for candidate ${documentId}:`, err);
      return false;
    }
  },

  /**
   * Explicitly marks candidate document as soft-deleted without permanent data loss.
   * POST /api/v1/candidates/{document_id}/soft-delete
   */
  async softDeleteCandidate(documentId: string | number): Promise<boolean> {
    try {
      await apiClient.post(`/candidates/${documentId}/soft-delete`, null, {
        headers: { Accept: "application/json" },
      });
      return true;
    } catch (err) {
      console.warn(`Error soft-deleting candidate ${documentId}:`, err);
      return false;
    }
  },

  /**
   * Restores a soft-deleted candidate document back to active state.
   * POST /api/v1/candidates/{document_id}/restore
   */
  async restoreCandidate(documentId: string | number): Promise<boolean> {
    try {
      await apiClient.post(`/candidates/${documentId}/restore`, null, {
        headers: { Accept: "application/json" },
      });
      return true;
    } catch (err) {
      console.warn(`Error restoring candidate ${documentId}:`, err);
      return false;
    }
  },

  /**
   * Deletes a candidate document via POST /api/v1/candidates/{document_id}/soft-delete (soft delete)
   * or DELETE /api/v1/candidates/{document_id}?soft_delete=false (hard delete).
   */
  async deleteCandidate(documentId: string | number, softDelete: boolean = true): Promise<boolean> {
    try {
      if (softDelete) {
        return await this.softDeleteCandidate(documentId);
      }
      await apiClient.delete(`/candidates/${documentId}`, {
        params: { soft_delete: false },
      });
      return true;
    } catch (err) {
      console.warn(`Error deleting candidate ${documentId}:`, err);
      return false;
    }
  },

  /**
   * Uploads multiple resume documents to POST /api/v1/files/upload-multiple.
   */
  async uploadFiles(files: File[]): Promise<Candidate[]> {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await apiClient.post<any>("/files/upload-multiple", formData);
      const raw = response?.data;
      const data = raw?.data || raw?.files || raw?.candidates || (Array.isArray(raw) ? raw : null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((doc: any, idx: number) => mapCandidateSummaryToCandidate(doc, idx));
      }
    } catch (err) {
      console.warn("Error uploading to /files/upload-multiple:", err);
    }

    // Return client-constructed candidate summaries if backend returns empty or during offline
    return files.map((file, i) =>
      mapCandidateSummaryToCandidate({ file_name: file.name, file_size: file.size }, i)
    );
  },

  /**
   * Fetches aggregate candidate stats from GET /api/v1/candidates/stats.
   */
  async getStats(projectName?: string) {
    try {
      const response = await apiClient.get<BackendStandardResponse<any>>("/candidates/stats", {
        params: { project_name: projectName },
      });
      return response.data?.data || null;
    } catch (err) {
      console.warn("Error fetching candidate stats:", err);
      return null;
    }
  },

  /**
   * Resolves the full backend URL to download a candidate's resume file.
   * Matches endpoints from CVForge API:
   * 1. GET /api/v1/candidates/{document_id}/download
   * 2. GET /api/v1/candidates/download/{file_name}
   */
  getResumeDownloadUrl(candidate: {
    id?: string | number;
    resumeFileName?: string;
    downloadUrl?: string;
  }): string {
    const rawBaseUrl = (import.meta.env?.VITE_API_URL as string) || "http://localhost:8000/api/v1";
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");
    const backendHost = baseUrl.replace(/\/api\/v1\/?$/, "");

    if (candidate.downloadUrl) {
      if (/^https?:\/\//i.test(candidate.downloadUrl)) {
        return candidate.downloadUrl;
      }
      if (candidate.downloadUrl.startsWith("/api/v1")) {
        return `${backendHost}${candidate.downloadUrl}`;
      }
      const slash = candidate.downloadUrl.startsWith("/") ? "" : "/";
      return `${baseUrl}${slash}${candidate.downloadUrl}`;
    }

    // If ID is numeric (document_id in backend DB)
    if (candidate.id && /^\d+$/.test(String(candidate.id))) {
      return `${baseUrl}/candidates/${candidate.id}/download`;
    }

    // Fallback to filename/stem download endpoint
    if (candidate.resumeFileName) {
      return `${baseUrl}/candidates/download/${encodeURIComponent(candidate.resumeFileName)}`;
    }

    return `${baseUrl}/candidates/${candidate.id}/download`;
  },

  /**
   * Downloads candidate physical resume file (PDF, DOCX, DOC) directly from the backend.
   * Supports blob fetching with Content-Disposition extraction and graceful fallback.
   */
  async downloadResumeFile(candidate: Candidate): Promise<boolean> {
    const url = this.getResumeDownloadUrl(candidate);
    const defaultFileName = candidate.resumeFileName || `${candidate.fullName.replace(/\s+/g, "_")}_Resume.pdf`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, */*",
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status} (${response.statusText})`);
      }

      let resolvedFileName = defaultFileName;
      const disposition = response.headers.get("Content-Disposition") || response.headers.get("content-disposition");
      if (disposition) {
        const utf8FilenameMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const regularFilenameMatch = disposition.match(/filename="?([^";]+)"?/i);
        if (utf8FilenameMatch?.[1]) {
          resolvedFileName = decodeURIComponent(utf8FilenameMatch[1]);
        } else if (regularFilenameMatch?.[1]) {
          resolvedFileName = regularFilenameMatch[1].trim();
        }
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = resolvedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return true;
    } catch (fetchErr) {
      console.warn("Direct blob download failed, attempting window trigger fallback:", fetchErr);
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = defaultFileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch (fallbackErr) {
        console.error("Download fallback failed:", fallbackErr);
        throw fetchErr;
      }
    }
  },
};

export default candidatesApi;
