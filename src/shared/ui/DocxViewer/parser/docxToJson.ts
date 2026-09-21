import { parseDocxBridgeFile } from "./docxBridgeParser";
import type { DocxBridgeDocument } from "../types/docxBridge.types";

/**
 * Convert a `.docx` file (or JSON string/object) into a `DocxBridgeDocument` JSON object.
 *
 * @param input - A `File`, `Blob`, `ArrayBuffer`, or JSON string / pre-parsed object.
 * @returns The parsed `DocxBridgeDocument` ready for use with `<DocxViewer data={...} />`.
 *
 * @example
 * // From a file input:
 * const json = await docxToJson(fileInputEvent.target.files[0]);
 *
 * @example
 * // From a URL fetch:
 * const buffer = await fetch("/my-doc.docx").then(r => r.arrayBuffer());
 * const json = await docxToJson(buffer);
 */
export async function docxToJson(
  input: File | Blob | ArrayBuffer | string | object
): Promise<DocxBridgeDocument> {
  // If already a plain object (pre-parsed JSON), normalize and return it
  if (input !== null && typeof input === "object" && !(input instanceof Blob) && !(input instanceof ArrayBuffer)) {
    // Re-export through the normalizer path by stringifying
    const jsonStr = JSON.stringify(input);
    return parseDocxBridgeFile(jsonStr);
  }

  return parseDocxBridgeFile(input as ArrayBuffer | Blob | string);
}

/**
 * Serialize a `DocxBridgeDocument` to a formatted JSON string.
 *
 * @param doc - The parsed document object.
 * @param pretty - If true (default), outputs prettily indented JSON.
 * @returns JSON string representation of the document.
 *
 * @example
 * const json = await docxToJson(file);
 * const jsonStr = docxBridgeToJsonString(json);
 * // Trigger download:
 * const blob = new Blob([jsonStr], { type: "application/json" });
 */
export function docxBridgeToJsonString(
  doc: DocxBridgeDocument,
  pretty = true
): string {
  // Strip media blobs from the JSON string to keep the output small if desired
  return JSON.stringify(doc, null, pretty ? 2 : undefined);
}

/**
 * Trigger a browser download of the document JSON.
 *
 * @param doc  - The parsed `DocxBridgeDocument`.
 * @param name - Filename for the download (default: `document.json`).
 */
export function downloadDocxBridgeJson(
  doc: DocxBridgeDocument,
  name = "document.json"
): void {
  const json = docxBridgeToJsonString(doc);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
