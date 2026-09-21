import type { DocxBridgeDocument } from "../types";
import { normalizeDocxBridgeJson } from "./jsonNormalizer";
import { parseDocxArchive } from "./archiveParser";

export { normalizeDocxBridgeJson } from "./jsonNormalizer";
export { parseDocxArchive } from "./archiveParser";
export { parseParagraphProperties, parseRunProperties } from "./propertiesParser";
export { parseDrawing, parsePictElement } from "./drawingParser";
export { parseParagraph, parseRun } from "./paragraphParser";
export { parseTable } from "./tableParser";
export { createSection } from "./sectionParser";

/**
 * Parses a .docx array buffer, Blob, File, or JSON string/object into the docx-bridge JSON document format.
 */
export async function parseDocxBridgeFile(
  input: ArrayBuffer | Blob | string
): Promise<DocxBridgeDocument> {
  // If string — try JSON first
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (parsed && (parsed.sections || parsed.content)) {
        return normalizeDocxBridgeJson(parsed);
      }
    } catch {
      // not JSON
    }
  }

  // Convert Blob → ArrayBuffer
  let buffer: ArrayBuffer;
  if (typeof Blob !== "undefined" && input instanceof Blob) {
    buffer = await input.arrayBuffer();
  } else if (input instanceof ArrayBuffer) {
    buffer = input;
  } else if (input && typeof (input as any).arrayBuffer === "function") {
    buffer = await (input as any).arrayBuffer();
  } else if (input && (input as any).buffer instanceof ArrayBuffer) {
    const u8 = input as any;
    buffer = (u8.buffer as ArrayBuffer).slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  } else {
    throw new Error("Invalid input format for DOCX parsing");
  }

  // Check if this buffer is actually a JSON file (from docx-bridge python)
  try {
    const text = new TextDecoder("utf-8").decode(buffer);
    if (text.trim().startsWith("{") && text.includes('"sections"')) {
      return normalizeDocxBridgeJson(JSON.parse(text));
    }
  } catch {
    // Binary — fall through to ZIP parsing
  }

  return parseDocxArchive(buffer);
}
