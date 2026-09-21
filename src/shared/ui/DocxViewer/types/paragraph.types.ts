export interface DocxBreak {
  type?: "page" | "line" | "textWrapping" | "column";
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
