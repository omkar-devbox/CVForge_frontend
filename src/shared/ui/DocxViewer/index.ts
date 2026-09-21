// Core viewer component
export { DocxViewer, default } from "./DocxViewer";
export { DocxViewer as DocumentViewer } from "./DocxViewer";

// Types
export * from "./types";

// Parser — DOCX → JSON
export * from "./parser";

// Helpers & Utilities
export * from "./utils";

// Hooks
export * from "./hooks";

// Context (for advanced / custom rendering)
export { DocumentProvider, useDocument } from "./context/DocumentContext";

// Sub-components (for custom rendering pipelines)
export { Section, DocxPageSheet } from "./items/Section";
export { Paragraph } from "./items/Paragraph";
export { Run } from "./items/Run";
export { Table } from "./items/Table";
export { TableCell } from "./items/TableCell";
export { Header, HeaderContentRenderer, HeaderSpacer } from "./items/Header";
export { Footer, FooterContentRenderer, FooterSpacer } from "./items/Footer";
export { PageBorder } from "./items/PageBorder";
export { Watermark, findWatermarkSrc } from "./items/Watermark";
export { ContentItemRenderer } from "./items/ContentItemRenderer";
export { Toolbar } from "./items/Toolbar";
export { DocxPageMeasurer } from "./items/DocxPageMeasurer";
export { DocxPrintStyles } from "./items/DocxPrintStyles";
export {
  DocxLoadingState,
  DocxErrorState,
  DocxEmptyState,
} from "./items/DocxStatusStates";
export {
  DocxSelectionFloatingAction,
  DynamicSparklePencilIcon,
} from "./items/DocxSelectionFloatingAction";
export type {
  DocxSelectionFloatingActionProps,
  DocxSelectionContext,
  DocxSelectionColumn,
} from "./items/DocxSelectionFloatingAction";
