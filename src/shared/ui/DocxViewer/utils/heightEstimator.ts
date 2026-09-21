import type {
  DocxContentItem,
  DocxParagraph,
  DocxTable,
  DocxHeaderFooter,
} from "../types";
import { dxa } from "./pageGeometry";

/**
 * Fast deterministic heuristic height estimator for initial render before DOM measurement.
 */
export function estimateItemHeight(item: DocxContentItem, contentWidthPx: number): number {
  if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
    const table = item as DocxTable;
    const rows = table.rows || [];
    let total = 8; // table borders/padding
    for (const r of rows) {
      const row = Array.isArray(r) ? { cells: r } : r;
      const rh = (row as any).height ? dxa((row as any).height) : 32;
      total += Math.max(26, rh);
    }
    return total;
  }

  const para = item as DocxParagraph;
  const sizeHp = para.size ?? para.fontSize ?? 24;
  const fontSizePx = Math.max(10, Math.round((sizeHp / 2) * 1.33));
  const lineHeightPx = Math.max(14, Math.round(fontSizePx * 1.35));

  // Compute text length
  let text = para.text || "";
  if (para.runs) {
    text = para.runs.map((r) => r.text || "").join("");
  }

  const charsPerLine = Math.max(20, Math.floor(contentWidthPx / (fontSizePx * 0.52)));
  const lineCount = Math.max(1, Math.ceil((text.length || 1) / charsPerLine));

  // Spacing
  const spacingBefore = para.spacing?.before ? dxa(para.spacing.before) : 0;
  const spacingAfter = para.spacing?.after ? dxa(para.spacing.after) : 4;

  // Drawings
  let drawingsHeight = 0;
  if (para.drawings) {
    for (const d of para.drawings) {
      if (d.extent?.cy) drawingsHeight += Math.round(d.extent.cy / 9525);
      else if (d.extent?.height) drawingsHeight += d.extent.height;
    }
  }
  if (para.runs) {
    for (const r of para.runs) {
      if (r.drawings) {
        for (const d of r.drawings) {
          if (d.extent?.cy) drawingsHeight += Math.round(d.extent.cy / 9525);
          else if (d.extent?.height) drawingsHeight += d.extent.height;
        }
      }
    }
  }

  return lineCount * lineHeightPx + spacingBefore + spacingAfter + drawingsHeight;
}

/**
 * Estimates height for header or footer content items.
 */
export function estimateHeaderFooterHeight(
  hf?: DocxHeaderFooter,
  defaultFallback = 50
): number {
  if (!hf || !hf.content || hf.content.length === 0) return 0;
  let total = 0;
  for (const item of hf.content) {
    if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
      const rows = (item as DocxTable).rows || [];
      total += Math.max(30, rows.length * 24);
    } else {
      const p = item as DocxParagraph;
      const drawings = (p.drawings || []).concat(
        p.runs?.flatMap((r) => r.drawings || []) || []
      );
      const drawingH = drawings.reduce((max, d) => {
        const cy = d.extent?.cy ? Math.round(d.extent.cy / 9525) : 0;
        return Math.max(max, cy);
      }, 0);
      const textH = p.text || p.runs?.some((r) => r.text) ? 22 : 0;
      total += Math.max(textH, drawingH, 18);
    }
  }
  return Math.max(defaultFallback, total);
}
