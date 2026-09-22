import { apiClient } from "@/app/api/client/api-client";
import { local } from "@/shared/lib/Storage/localstorage";
import { masterWordApi } from "@/features/masterWord/api/masterWordApi";
import type { TemplateRecord } from "@/features/masterWord/types/masterWord.types";
import type {
  WordOfferRecord,
  WordOfferFilters,
  WordOfferTemplateResponse,
  WordOfferTemplateListResponse,
  WordOfferDynamicFieldResponse,
  BOQItem,
  WordOfferStatus,
} from "../types/wordOffer.types";

const STORAGE_KEY = "system_mechatronics_word_offers";

/**
 * Normalizes status string to WordOfferStatus
 */
function normalizeStatus(statusStr?: string): WordOfferStatus {
  if (!statusStr) return "Draft";
  const s = statusStr.trim().toUpperCase();
  if (s === "ACTIVE" || s === "PUBLISHED" || s === "SENT") return "Sent";
  if (s === "UNDER REVIEW") return "Under Review";
  if (s === "ACCEPTED") return "Accepted";
  if (s === "REJECTED") return "Rejected";
  if (s === "EXPIRED" || s === "INACTIVE") return "Expired";
  return "Draft";
}

/**
 * Maps a backend WordOfferTemplateResponse (bundled with dynamic fields) to a full WordOfferRecord.
 */
export function mapTemplateToWordOffer(tpl: WordOfferTemplateResponse): WordOfferRecord {
  const variables: Record<string, string> = {};
  const fields = tpl.dynamicFields || [];
  let clientName = "";
  let projectName = "";

  fields.forEach((f) => {
    const rawKey = f.key ? f.key.replace(/[{}]/g, "") : f.name;
    const cleanKey = rawKey.trim();
    const val = f.value || f.description || f.name || "";
    variables[cleanKey] = val;

    const lowerKey = cleanKey.toLowerCase();
    if (!clientName && (lowerKey.includes("client") || lowerKey.includes("customer") || lowerKey.includes("company"))) {
      clientName = val;
    }
    if (!projectName && (lowerKey.includes("project") || lowerKey.includes("scope") || lowerKey.includes("title"))) {
      projectName = val;
    }
  });

  // Extract BOQ Items from table/column dynamic fields if any
  const boqItems: BOQItem[] = [];
  const tableFields = fields.filter(
    (f) => f.type?.toUpperCase() === "COLUMN" || (f.columns && f.columns.length > 0)
  );

  if (tableFields.length > 0) {
    tableFields.forEach((tf, tfIdx) => {
      boqItems.push({
        id: `boq-${tpl.id}-${tfIdx + 1}`,
        itemCode: tf.name ? tf.name.slice(0, 10).toUpperCase() : `ITM-${tfIdx + 1}`,
        description: tf.name || "",
        quantity: 1,
        unit: "Set",
        unitPrice: 0,
        total: 0,
      });
    });
  }

  const totalAmount = boqItems.reduce((acc, item) => acc + (item.total || 0), 0);
  const dateStr = tpl.createdAt ? tpl.createdAt.split("T")[0] : "";

  return {
    id: String(tpl.id),
    offerNumber: `WO-${String(tpl.id).padStart(3, "0")}`,
    title: tpl.templateName || `Offer ${tpl.id}`,
    clientName: clientName || "",
    clientContact: "",
    project: projectName || tpl.description || "",
    templateId: String(tpl.id),
    templateName: tpl.templateName,
    status: normalizeStatus(tpl.status),
    totalAmount,
    currency: "INR",
    createdAt: dateStr,
    validUntil: "",
    version: tpl.version || "v1.0",
    notes: tpl.description || "",
    preparedBy: "",
    variables,
    boqItems,
    clauses: [],
    fileName: tpl.fileName,
    filePath: tpl.filePath,
    dynamicFieldsCount: tpl.totalFieldsCount || fields.length,
    dynamicFields: fields,
  };
}

export const wordOfferApi = {
  /**
   * 1. GET /api/v1/word-offer/templates
   * List templates bundled with their active dynamic fields directly from backend.
   */
  async getWordOfferTemplates(filters?: {
    search?: string;
    status?: string;
  }): Promise<WordOfferTemplateListResponse> {
    const params: Record<string, string> = {};
    if (filters?.search?.trim()) params.search = filters.search.trim();
    if (filters?.status && filters.status !== "ALL") params.status = filters.status.trim();

    const response = await apiClient.get<WordOfferTemplateListResponse>(
      "/word-offer/templates",
      { params }
    );
    return response.data;
  },

  /**
   * 2. GET /api/v1/word-offer/templates/{id}
   * Get single template with active dynamic fields and child columns.
   */
  async getWordOfferTemplate(
    templateId: string,
    versionId?: number
  ): Promise<WordOfferTemplateResponse> {
    const params: Record<string, number> = {};
    if (versionId !== undefined) params.versionId = versionId;

    const response = await apiClient.get<WordOfferTemplateResponse>(
      `/word-offer/templates/${templateId}`,
      { params }
    );
    return response.data;
  },

  /**
   * 3. GET /api/v1/word-offer/templates/{id}/dynamic-fields
   * Get dynamic fields specifically linked to a template.
   */
  async getWordOfferDynamicFields(
    templateId: string,
    versionId?: number
  ): Promise<WordOfferDynamicFieldResponse[]> {
    const params: Record<string, number> = {};
    if (versionId !== undefined) params.versionId = versionId;

    const response = await apiClient.get<WordOfferDynamicFieldResponse[]>(
      `/word-offer/templates/${templateId}/dynamic-fields`,
      { params }
    );
    return response.data || [];
  },

  /**
   * 4. GET /api/v1/word-offer/dynamic-fields
   * Query dynamic fields by templateId or versionId.
   */
  async queryDynamicFields(params: {
    templateId?: string;
    versionId?: number;
  }): Promise<WordOfferDynamicFieldResponse[]> {
    const response = await apiClient.get<WordOfferDynamicFieldResponse[]>(
      "/word-offer/dynamic-fields",
      { params }
    );
    return response.data || [];
  },

  /**
   * 5. Get all offers for UI table display:
   * Fetches backend templates with dynamic fields and combines with any local offers.
   * If backend is unreachable or returns empty, seamlessly falls back to local storage.
   */
  async getOffers(filters?: WordOfferFilters): Promise<WordOfferRecord[]> {
    let combinedOffers: WordOfferRecord[] = [];

    try {
      const backendData = await this.getWordOfferTemplates({
        search: filters?.search,
        status: filters?.status,
      });

      if (backendData?.templates && Array.isArray(backendData.templates) && backendData.templates.length > 0) {
        combinedOffers = backendData.templates.map(mapTemplateToWordOffer);
      }
    } catch (err) {
      console.warn("Could not fetch backend word-offer templates:", err);
    }

    // Purge any legacy mock offers from localStorage
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }

    let result = [...combinedOffers];

    // Safe client-side filtering
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          (o.title && o.title.toLowerCase().includes(q)) ||
          (o.offerNumber && o.offerNumber.toLowerCase().includes(q)) ||
          (o.clientName && o.clientName.toLowerCase().includes(q)) ||
          (o.project && o.project.toLowerCase().includes(q)) ||
          (o.templateName && o.templateName.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== "ALL") {
      const targetStatus = filters.status.trim().toLowerCase();
      result = result.filter(
        (o) => o.status && o.status.toLowerCase() === targetStatus
      );
    }

    // Default sort: newest first
    result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  },

  /**
   * Get single offer by ID (checking backend first, then local)
   */
  async getOfferById(id: string): Promise<WordOfferRecord | null> {
    try {
      const tpl = await this.getWordOfferTemplate(id);
      if (tpl) {
        return mapTemplateToWordOffer(tpl);
      }
    } catch {
      // Check local cache
    }

    const offers = await this.getOffers();
    return offers.find((o) => o.id === id) || null;
  },

  /**
   * Create a new offer and persist to storage
   */
  async createOffer(payload: Omit<WordOfferRecord, "id" | "createdAt">): Promise<WordOfferRecord> {
    const offers = await this.getOffers();
    const newOffer: WordOfferRecord = {
      ...payload,
      id: `off-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newOffer, ...offers];
    local.set(STORAGE_KEY, updated);
    return newOffer;
  },

  /**
   * Update an existing offer
   */
  async updateOffer(id: string, updates: Partial<WordOfferRecord>): Promise<WordOfferRecord> {
    const offers = await this.getOffers();
    const index = offers.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`Offer with id ${id} not found.`);
    }

    const updatedOffer = { ...offers[index], ...updates };
    offers[index] = updatedOffer;
    local.set(STORAGE_KEY, offers);
    return updatedOffer;
  },

  /**
   * Duplicate an existing offer with new offer reference
   */
  async duplicateOffer(id: string): Promise<WordOfferRecord> {
    const existing = await this.getOfferById(id);
    if (!existing) {
      throw new Error(`Offer with id ${id} not found.`);
    }

    const newOfferNumber = `${existing.offerNumber}-COPY`;
    const duplicated: WordOfferRecord = {
      ...existing,
      id: `off-${Date.now()}`,
      offerNumber: newOfferNumber,
      title: `${existing.title} (Copy)`,
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      version: "D1",
    };

    const offers = await this.getOffers();
    const updated = [duplicated, ...offers];
    local.set(STORAGE_KEY, updated);
    return duplicated;
  },

  /**
   * Delete an offer
   */
  async deleteOffer(id: string): Promise<void> {
    const offers = await this.getOffers();
    const filtered = offers.filter((o) => o.id !== id);
    local.set(STORAGE_KEY, filtered);
  },

  /**
   * Fetch available Master Word Templates from backend
   */
  async getMasterTemplates(): Promise<TemplateRecord[]> {
    try {
      const backendData = await this.getWordOfferTemplates();
      if (backendData?.templates) {
        return backendData.templates.map((t) => ({
          id: t.id,
          templateName: t.templateName,
          description: t.description,
          fileName: t.fileName,
          filePath: t.filePath || undefined,
          category: t.category,
          version: t.version,
          status: t.status,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        }));
      }
      return await masterWordApi.getTemplates();
    } catch {
      return await masterWordApi.getTemplates().catch(() => []);
    }
  },


  /**
   * Export / Download Word Document for Offer
   * If templateId matches an uploaded backend template, attempts to fetch the template .docx
   * Otherwise constructs an informative downloadable Word document (.docx compatible)
   */
  async exportOfferDocx(offer: WordOfferRecord): Promise<void> {
    try {
      if (offer.templateId) {
        try {
          await masterWordApi.downloadTemplate(
            offer.templateId,
            `${offer.offerNumber}_${offer.title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
          );
          return;
        } catch {
          // Fall through to fallback generator
        }
      }

      // Generate a structured HTML-based document that Word natively opens with full formatting
      const boqRows = offer.boqItems
        .map(
          (item, idx) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${item.itemCode}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${item.description}</td>
            <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">${item.quantity} ${item.unit}</td>
            <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">${item.unitPrice.toLocaleString("en-IN")}</td>
            <td style="padding: 8px; border: 1px solid #ccc; text-align: right; font-weight: bold;">${item.total.toLocaleString("en-IN")}</td>
          </tr>`
        )
        .join("");

      const clausesList = offer.clauses
        .map(
          (cl) => `
          <div style="margin-bottom: 12px;">
            <strong style="color: #004066;">${cl.title}</strong>
            <p style="margin: 4px 0 0 0; color: #444;">${cl.content}</p>
          </div>`
        )
        .join("");

      const docContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${offer.offerNumber} - ${offer.title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; }
            h1 { color: #004066; border-bottom: 2px solid #0077be; padding-bottom: 8px; font-size: 24px; }
            h2 { color: #0284c7; margin-top: 24px; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background-color: #004066; color: #ffffff; padding: 10px; border: 1px solid #004066; text-align: left; }
            .info-grid { width: 100%; margin-bottom: 20px; }
            .info-grid td { padding: 6px 0; }
            .total-box { margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold; color: #004066; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; color: #004066;">${offer.templateName || offer.title || "COMMERCIAL OFFER"}</h2>
              <div style="font-size: 12px; color: #64748b;">${offer.project || ""}</div>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: bold; font-size: 12px;">
                ${offer.status.toUpperCase()}
              </span>
            </div>
          </div>

          <hr style="border: none; border-top: 2px solid #0077be; margin: 15px 0 25px 0;" />

          <h1>COMMERCIAL & TECHNICAL OFFER</h1>

          <table class="info-grid">
            <tr>
              <td style="width: 20%;"><strong>Offer Reference:</strong></td>
              <td style="width: 30%; color: #0077be;">${offer.offerNumber} (${offer.version})</td>
              <td style="width: 20%;"><strong>Date:</strong></td>
              <td style="width: 30%;">${offer.createdAt}</td>
            </tr>
            <tr>
              <td><strong>Customer Name:</strong></td>
              <td>${offer.clientName}</td>
              <td><strong>Validity:</strong></td>
              <td>${offer.validUntil}</td>
            </tr>
            <tr>
              <td><strong>Project / Scope:</strong></td>
              <td>${offer.project}</td>
              <td><strong>Prepared By:</strong></td>
              <td>${offer.preparedBy}</td>
            </tr>
            <tr>
              <td><strong>Contact Info:</strong></td>
              <td>${offer.clientContact || offer.clientEmail || "N/A"}</td>
              <td><strong>Master Template:</strong></td>
              <td>${offer.templateName || "Standard Engineering"}</td>
            </tr>
          </table>

          <h2>1. Project Scope & Dynamic Specifications</h2>
          <table style="width: 100%; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="background: #f1f5f9; color: #334155; width: 35%;">Parameter / Field</th>
                <th style="background: #f1f5f9; color: #334155;">Specified Value</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(offer.variables)
          .map(
            ([key, val]) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${key.replace(/_/g, " ").toUpperCase()}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: #334155;">${val}</td>
                </tr>`
          )
          .join("")}
            </tbody>
          </table>

          <h2>2. Bill of Quantities (BOQ) & Commercial Schedule</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 15%;">Item Code</th>
                <th style="width: 40%;">Description</th>
                <th style="width: 12%;">Qty</th>
                <th style="width: 13%;">Unit Price (${offer.currency})</th>
                <th style="width: 15%;">Total (${offer.currency})</th>
              </tr>
            </thead>
            <tbody>
              ${boqRows}
            </tbody>
          </table>

          <div class="total-box">
            <span>Total Offer Value (${offer.currency}): </span>
            <span style="font-size: 20px; color: #0284c7;">${offer.totalAmount.toLocaleString("en-IN")} /-</span>
          </div>

          <h2>3. Commercial Terms, Conditions & Clauses</h2>
          <div style="background: #f8fafc; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${clausesList}
          </div>

          <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div>
              <div style="font-weight: bold; color: #004066;">Prepared By:</div>
              <div style="margin-top: 30px; border-top: 1px solid #94a3b8; width: 200px; padding-top: 4px; font-size: 13px;">
                ${offer.preparedBy || "Authorized Representative"}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; color: #004066;">Client Acceptance:</div>
              <div style="margin-top: 30px; border-top: 1px solid #94a3b8; width: 200px; padding-top: 4px; font-size: 13px;">
                Authorized Signatory & Seal
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([docContent], {
        type: "application/msword;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${offer.offerNumber}_${offer.title.replace(/[^a-zA-Z0-9]/g, "_")}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      throw new Error(`Failed to export offer document: ${err?.message || err}`);
    }
  },

  /**
   * 6. POST /api/v1/word-offer/process-document
   * Uploads a document (.docx, .doc, .pdf, .txt), extracts content via docx_converter,
   * performs LLM analysis, clones the master word template original JSON,
   * and replaces all fields with 100% style preservation.
   */
  async processDocument(
    file: File,
    templateId: string,
    offerId?: string,
    prompt?: string
  ): Promise<{
    status: string;
    message: string;
    fileName: string;
    filePath: string;
    fileSize: string;
    downloadUrl: string;
    templateId: string;
    templateName: string;
    offerId?: string;
    extractedFields: Record<string, any>;
    replacedFieldsCount: number;
    elapsedSeconds: number;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("template_id", templateId);
    if (offerId) formData.append("offer_id", offerId);
    if (prompt) formData.append("prompt", prompt);

    const response = await apiClient.post<any>(
      "/word-offer/process-document",
      formData
    );
    return response.data;
  },

  /**
   * 7. Download processed Word offer document as Blob
   */
  async downloadProcessedOffer(fileName: string): Promise<Blob> {
    const url = `/word-offer/download/${encodeURIComponent(fileName)}`;
    const res = await apiClient.get<Blob>(url);
    return res.data;
  },
};

