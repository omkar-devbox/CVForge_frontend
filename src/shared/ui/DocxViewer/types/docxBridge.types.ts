export interface DocxPageMargins {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  header?: number;
  footer?: number;
  gutter?: number;
}

export interface DocxPageSize {
  width?: number;
  height?: number;
}

export interface DocxPage {
  size?: string | DocxPageSize;
  orientation?: "portrait" | "landscape";
  margins?: DocxPageMargins;
}

export interface DocxColumns {
  space?: number;
  num?: number;
  equalWidth?: number | boolean;
  columns?: Array<{ w?: number; space?: number }>;
}

export interface DocxDrawing {
  type?: string;
  container?: string;
  drawingType?: string;
  name?: string;
  id?: number | string;
  relationshipId?: string;
  src?: string;
  extent?: {
    cx?: number;
    cy?: number;
    width?: number;
    height?: number;
  };
  positionH?: {
    relativeFrom?: string;
    offset?: number;
    align?: string;
  };
  positionV?: {
    relativeFrom?: string;
    offset?: number;
    align?: string;
  };
  distT?: number;
  distB?: number;
  distL?: number;
  distR?: number;
  wrap?: string;
  behindDoc?: boolean;
  isWatermark?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  fillColor?: string;
  textboxContent?: DocxParagraph[];
}

export interface DocxBreak {
  type?: "page" | "line" | "textWrapping" | "column";
}

export interface DocxRun {
  text?: string;
  field?: "PAGE" | "NUMPAGES" | string;
  bold?: boolean;
  boldCs?: boolean;
  italic?: boolean;
  italicCs?: boolean;
  underline?: boolean | string | { val?: string; color?: string };
  strike?: boolean;
  doubleStrike?: boolean;
  size?: number; // In half-points (e.g. 24 = 12pt)
  fontSize?: number;
  fontSizeCs?: number;
  font?: string;
  fonts?: {
    ascii?: string;
    cs?: string;
    eastAsia?: string;
    hAnsi?: string;
  };
  color?: string; // Hex color (e.g. "FF0000" or "#FF0000")
  highlight?: string;
  shading?: string | { fill?: string; val?: string };
  vertAlign?: "baseline" | "superscript" | "subscript";
  breaks?: DocxBreak[];
  drawings?: DocxDrawing[];
  noProof?: boolean;
  hasTab?: boolean;
  hasCarriageReturn?: boolean;
  symbol?: {
    font?: string;
    char?: string;
  };
}

export interface DocxIndent {
  left?: number;
  right?: number;
  start?: number;
  end?: number;
  hanging?: number;
  firstLine?: number;
}

export interface DocxSpacing {
  before?: number;
  after?: number;
  line?: number;
  lineRule?: string;
}

export interface DocxParagraphNumbering {
  id?: number | string;
  numId?: number | string;
  level?: number;
  ilvl?: number;
}

export interface DocxParagraph {
  type?: "paragraph";
  text?: string;
  runs?: DocxRun[];
  style?: string;
  alignment?: "left" | "center" | "right" | "both" | "justify" | "distribute";
  spacing?: DocxSpacing;
  indent?: DocxIndent;
  indentation?: DocxIndent;
  numbering?: DocxParagraphNumbering;
  level?: number;
  keepWithNext?: boolean;
  pageBreakBefore?: boolean;
  tabs?: Array<{ val?: string; pos?: number }>;
  borders?: Record<string, any>;
  shading?: string | { fill?: string };
  // Inlined run properties if simple mode output
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | string | { val?: string; color?: string };
  size?: number;
  fontSize?: number;
  font?: string;
  color?: string;
  highlight?: string;
  drawings?: DocxDrawing[];
}

export interface DocxBorder {
  val?: string;
  sz?: number;
  space?: number;
  color?: string;
}

export interface DocxPageBorders {
  offsetFrom?: "page" | "text" | string;
  zOrder?: "front" | "back" | string;
  top?: DocxBorder;
  bottom?: DocxBorder;
  left?: DocxBorder;
  right?: DocxBorder;
}

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

export interface DocxSection {
  page?: DocxPage & { borders?: DocxPageBorders };
  columns?: DocxColumns;
  content?: DocxContentItem[];
  headers?: DocxSectionHeaders | DocxHeaderFooter[] | Record<string, DocxHeaderFooter>;
  footers?: DocxSectionFooters | DocxHeaderFooter[] | Record<string, DocxHeaderFooter>;
  header?: DocxHeaderFooter;
  footer?: DocxHeaderFooter;
  titlePg?: boolean;
  evenAndOddHeaders?: boolean;
  pageBorders?: DocxPageBorders;
  background?: string;
  borders?: Record<string, DocxBorder | string> | DocxPageBorders;
}

export interface PaginatedPage {
  pageNumber: number;
  totalPages: number;
  sectionIndex: number;
  section: DocxSection;
  pageWidthPx: number;
  pageHeightPx: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    header: number;
    footer: number;
  };
  pageBorders?: DocxPageBorders;
  header?: DocxHeaderFooter;
  footer?: DocxHeaderFooter;
  items: DocxContentItem[];
}

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

export interface DocxBridgeDocument {
  sections?: DocxSection[];
  styles?: Record<string, DocxStyle> | DocxStyle[];
  numbering?: DocxNumberingData | any[];
  headers?: Record<string, DocxHeaderFooter> | DocxHeaderFooter[];
  footers?: Record<string, DocxHeaderFooter> | DocxHeaderFooter[];
  media?: Record<string, string>; // Maps rId or target path to base64 Data URL or media URL
  relations?: DocxRelation[] | Record<string, string>;
  relationships?: DocxRelation[] | Record<string, string>;
  background?: string;
  metadata?: {
    title?: string;
    creator?: string;
    description?: string;
    created?: string;
    modified?: string;
    revision?: string | number;
    [key: string]: any;
  };
}

export interface DocxViewerProps {
  /** URL to .docx or .json file */
  fileUrl?: string;
  /** Blob, File or ArrayBuffer of .docx or .json */
  fileBlob?: Blob | File | ArrayBuffer | null;
  /** Pre-parsed docx-bridge JSON document object */
  data?: DocxBridgeDocument | null;
  /** Document title or file name for display */
  fileName?: string;
  /** Whether to render top toolbar with zoom, page navigation, download, etc. */
  showToolbar?: boolean;
  /** Custom wrapper CSS class name */
  className?: string;
  /** Callback fired when document finishes parsing/loading */
  onLoad?: (doc: DocxBridgeDocument) => void;
  /** Callback fired on loading/parsing failure */
  onError?: (error: Error) => void;
  /**
   * Callback fired when the user clicks the "Export JSON" button in the toolbar.
   * Receives the fully parsed DocxBridgeDocument object.
   * When provided, the toolbar will show an Export JSON button.
   */
  onJsonExport?: (doc: DocxBridgeDocument) => void;
  /**
   * When true, the toolbar Export JSON button will also auto-download the JSON file.
   * Defaults to true when onJsonExport is not provided but showJsonExport is true.
   */
  showJsonExport?: boolean;
  /**
   * When true, shows an external bottom-right page indicator pill on each page sheet.
   * Defaults to false so original DOCX headers/footers show cleanly.
   */
  showPageNumberPill?: boolean;
}
