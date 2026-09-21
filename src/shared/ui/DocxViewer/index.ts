// Core viewer component
export { DocxViewer, default } from "./DocxViewer";
export { DocxViewer as DocumentViewer } from "./DocxViewer";

// Types
export * from "./types/docxBridge.types";

// Parser — DOCX → JSON
export { parseDocxBridgeFile } from "./parser/docxBridgeParser";
export {
  docxToJson,
  docxBridgeToJsonString,
  downloadDocxBridgeJson,
} from "./parser/docxToJson";

// Helpers — JSON → Viewer
export { jsonToDocxViewerProps } from "./utils/jsonToDocxViewerProps";

// Context (for advanced / custom rendering)
export { DocumentProvider, useDocument } from "./context/DocumentContext";

// Sub-components (for custom rendering pipelines)
export { Section } from "./items/Section";
export { Paragraph } from "./items/Paragraph";
export { Run } from "./items/Run";
export { Table } from "./items/Table";
export { Toolbar } from "./items/Toolbar";
