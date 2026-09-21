import type { DocxBridgeDocument } from "../types";

/**
 * Normalizes pre-parsed or Python-emitted docx-bridge JSON document object.
 */
export function normalizeDocxBridgeJson(json: any): DocxBridgeDocument {
  if (!json) return { sections: [] };
  if (json.content && !json.sections) {
    return {
      ...json,
      sections: [
        {
          page: json.page || {
            size: "a4",
            orientation: "portrait",
            margins: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
              header: 709,
              footer: 709,
            },
          },
          content: json.content,
        },
      ],
    };
  }
  return json as DocxBridgeDocument;
}
