import type { DocxBorder } from "../types/docxBridge.types";

/**
 * Map OOXML border val → CSS border-style
 */
export function mapBorderStyle(val: string): string {
  switch (val) {
    case "double":
      return "double";
    case "dashed":
    case "dashDot":
    case "dotDash":
    case "dashDotStroked":
      return "dashed";
    case "dotted":
    case "dotDotDash":
      return "dotted";
    case "none":
    case "nil":
      return "none";
    // single, thick, wave, threeDEmboss, etc. → solid
    default:
      return "solid";
  }
}

/**
 * Resolve any border representation to a CSS border shorthand (or "none")
 */
export function fmtBorder(b: any): string {
  if (!b) return "none";
  if (typeof b === "string") {
    if (b === "none" || b === "nil") return "none";
    return `1px solid ${b.startsWith("#") ? b : `#${b}`}`;
  }
  const val: string = b.val || "single";
  if (val === "none" || val === "nil") return "none";
  const style = mapBorderStyle(val);
  if (style === "none") return "none";
  const width = b.sz ? `${Math.max(1, Math.round(b.sz / 8))}px` : "1px";
  const color =
    b.color && b.color !== "auto"
      ? `#${(b.color as string).replace("#", "")}`
      : "#000000";
  return `${width} ${style} ${color}`;
}

/**
 * Format page border (w:pgBorders)
 * sz is in 1/8 pt -> px (1pt = 96/72 px = 1.3333px)
 */
export function fmtPageBorder(b?: DocxBorder): string {
  if (!b) return "none";
  const val = b.val || "single";
  if (val === "none" || val === "nil") return "none";
  const style = mapBorderStyle(val);
  if (style === "none") return "none";

  const widthPx = Math.max(1, Math.round(((b.sz || 4) / 8) * (96 / 72)));
  const color =
    b.color && b.color !== "auto"
      ? b.color.startsWith("#")
        ? b.color
        : `#${b.color}`
      : "#000000";
  return `${widthPx}px ${style} ${color}`;
}

/**
 * Format paragraph border (w:pBdr)
 */
export function fmtParaBorder(b: any): string | undefined {
  if (!b) return undefined;
  const val = b.val || "single";
  if (val === "none" || val === "nil") return undefined;
  const style = mapBorderStyle(val);
  if (style === "none") return undefined;
  // sz is in 1/8 pt -> px (1pt = 96/72 px = 1.333px)
  const width = b.sz ? `${Math.max(1, Math.round((b.sz / 8) * (96 / 72)))}px` : "1px";
  const color =
    b.color && b.color !== "auto" ? `#${(b.color as string).replace("#", "")}` : "#000000";
  return `${width} ${style} ${color}`;
}

/**
 * Convert points to pixels at 96 DPI (1 pt = 96/72 px)
 */
export const ptToPx = (pt: number): number => Math.round(pt * (96 / 72));

/**
 * Convert dxa (twips) to px at 96 DPI (1 dxa = 1/15 px)
 */
export const dxa = (v: number): number => Math.round(v / 15);
