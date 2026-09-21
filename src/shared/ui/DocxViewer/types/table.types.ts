import type { DocxBorder } from "./border.types";
import type { DocxRun, DocxParagraph } from "./paragraph.types";

export interface DocxCellMargins {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface DocxCellBorders {
  top?: DocxBorder | string;
  bottom?: DocxBorder | string;
  left?: DocxBorder | string;
  right?: DocxBorder | string;
}

export interface DocxCell {
  text?: string;
  runs?: DocxRun[];
  content?: Array<DocxParagraph | DocxTable>;
  paragraphs?: DocxParagraph[];
  colSpan?: number;
  gridSpan?: number;
  rowSpan?: number;
  vMerge?: "restart" | "continue" | number | boolean;
  bg?: string;
  shading?: string | { fill?: string };
  width?: number | string | { value?: number | string; type?: string };
  vAlign?: "top" | "center" | "bottom";
  borders?: DocxCellBorders;
  margins?: DocxCellMargins;
  // Typography properties that might be on cell
  bold?: boolean;
  italic?: boolean;
  size?: number;
  font?: string;
  color?: string;
  alignment?: string;
}

export interface DocxRow {
  type?: string;
  properties?: Record<string, any>;
  cells?: Array<DocxCell | string>;
  height?: number;
}

export interface DocxTable {
  type?: "table";
  rows?: Array<DocxRow | Array<DocxCell | string>>;
  grid?: number[]; // Column widths in twips/dxa
  properties?: {
    alignment?: string;
    width?: { value?: number | string; type?: string };
    indent?: number;
    borders?: Record<string, DocxBorder | string>;
    cellMargins?: DocxCellMargins;
  };
  alignment?: string;
  borders?: Record<string, DocxBorder | string>;
  cellMargins?: DocxCellMargins;
}
