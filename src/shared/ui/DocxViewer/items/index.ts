// Header & Footer
export { Header, HeaderContentRenderer, HeaderSpacer } from "./Header";
export type { HeaderProps, HeaderSpacerProps } from "./Header";
export { Footer, FooterContentRenderer, FooterSpacer } from "./Footer";
export type { FooterProps, FooterSpacerProps } from "./Footer";

// Table & Cell
export { Table } from "./Table";
export type { TableProps } from "./Table";
export { TableCell } from "./TableCell";
export type { TableCellProps } from "./TableCell";
export { processVMerge } from "./table.utils";
export type { ProcessedCell, ProcessedRow } from "./table.utils";

// Border & Page Border
export { PageBorder } from "./PageBorder";
export type { PageBorderProps } from "./PageBorder";
export {
  mapBorderStyle,
  fmtBorder,
  fmtPageBorder,
  fmtParaBorder,
  ptToPx,
  dxa,
} from "./border.utils";

// Watermark
export { Watermark, findWatermarkSrc } from "./Watermark";
export type { WatermarkProps } from "./Watermark";

// Content Item Dispatcher
export { ContentItemRenderer } from "./ContentItemRenderer";
export type { ContentItemRendererProps } from "./ContentItemRenderer";

// Core Content Blocks
export { Paragraph } from "./Paragraph";
export { Run } from "./Run";
export { Section, DocxPageSheet } from "./Section";
export type { SectionProps } from "./Section";

// Viewer Controls & Measurement
export { Toolbar } from "./Toolbar";
export { DocxPageMeasurer } from "./DocxPageMeasurer";
export type { MeasuredData } from "./DocxPageMeasurer";

// Print Styles & Status States
export { DocxPrintStyles } from "./DocxPrintStyles";
export {
  DocxLoadingState,
  DocxErrorState,
  DocxEmptyState,
} from "./DocxStatusStates";
export type { DocxErrorStateProps } from "./DocxStatusStates";

// Text Selection Floating Action
export {
  DocxSelectionFloatingAction,
  DynamicSparklePencilIcon,
} from "./DocxSelectionFloatingAction";
export type {
  DocxSelectionFloatingActionProps,
  DocxSelectionContext,
  DocxSelectionColumn,
} from "./DocxSelectionFloatingAction";
