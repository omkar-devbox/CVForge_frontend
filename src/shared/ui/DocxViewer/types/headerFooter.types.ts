import type { DocxParagraph } from "./paragraph.types";
import type { DocxTable } from "./table.types";

export type DocxContentItem = DocxParagraph | DocxTable;

export interface DocxHeaderFooter {
  type?: "header" | "footer";
  id?: string;
  content?: DocxContentItem[];
}

export interface DocxSectionHeaders {
  default?: DocxHeaderFooter;
  first?: DocxHeaderFooter;
  even?: DocxHeaderFooter;
  [key: string]: DocxHeaderFooter | undefined;
}

export interface DocxSectionFooters {
  default?: DocxHeaderFooter;
  first?: DocxHeaderFooter;
  even?: DocxHeaderFooter;
  [key: string]: DocxHeaderFooter | undefined;
}
