import type { DocxRun, DocxParagraph, DocxIndent } from "./paragraph.types";

export interface DocxNumberingLevel {
  level?: number;
  format?: string; // "bullet" | "decimal" | "lowerLetter" | "upperLetter" | "lowerRoman" | "upperRoman" | etc.
  text?: string;
  bullet?: string;
  symbol?: string;
  font?: string;
  start?: number;
  indent?: DocxIndent;
  pStyle?: string;
  run?: Partial<DocxRun>;
}

export interface DocxAbstractNum {
  id?: number | string;
  abstractNumId?: number | string;
  levels?: DocxNumberingLevel[] | Record<number, DocxNumberingLevel>;
}

export interface DocxNumInstance {
  id?: number | string;
  numId?: number | string;
  abstractNumId?: number | string;
}

export interface DocxNumberingData {
  abstractNums?: DocxAbstractNum[];
  nums?: DocxNumInstance[];
  // Or simple flat array/map
  [key: string]: any;
}

export interface DocxStyle {
  id?: string;
  name?: string;
  type?: "paragraph" | "character" | "table" | "numbering";
  default?: boolean;
  basedOn?: string;
  next?: string;
  paragraph?: Partial<DocxParagraph>;
  run?: Partial<DocxRun>;
  bold?: boolean;
  italic?: boolean;
  size?: number;
  font?: string;
  color?: string;
}

export interface DocxRelation {
  id: string;
  type: string;
  target: string;
}
