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
