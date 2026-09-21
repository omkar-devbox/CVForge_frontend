import type {
  DocxSection,
  DocxHeaderFooter,
  DocxSectionHeaders,
  DocxSectionFooters,
  DocxPageBorders,
} from "../types";
import { REL_NS } from "./drawingParser";

/**
 * Creates and normalizes a DocxSection from `<w:sectPr>` and parsed document contents.
 */
export function createSection(
  sectPr: Element | null,
  content: any[],
  parsedHF: Record<string, DocxHeaderFooter> = {},
  evenAndOddHeaders: boolean = false
): DocxSection {
  if (!sectPr) {
    return {
      page: {
        size: "a4",
        orientation: "portrait",
        margins: { top: 1440, bottom: 1440, left: 1440, right: 1440, header: 709, footer: 709 },
      },
      content,
    };
  }

  // Page size
  const pgSz = sectPr.getElementsByTagName("w:pgSz")[0];
  const width = pgSz?.getAttribute("w:w") ? parseInt(pgSz.getAttribute("w:w")!, 10) : 11906;
  const height = pgSz?.getAttribute("w:h") ? parseInt(pgSz.getAttribute("w:h")!, 10) : 16838;
  const orient = (pgSz?.getAttribute("w:orient") || "portrait") as any;

  // Page margins (including header/footer distances)
  const pgMar = sectPr.getElementsByTagName("w:pgMar")[0];
  const margins = {
    top: pgMar?.getAttribute("w:top") ? parseInt(pgMar.getAttribute("w:top")!, 10) : 1440,
    right: pgMar?.getAttribute("w:right") ? parseInt(pgMar.getAttribute("w:right")!, 10) : 1440,
    bottom: pgMar?.getAttribute("w:bottom") ? parseInt(pgMar.getAttribute("w:bottom")!, 10) : 1440,
    left: pgMar?.getAttribute("w:left") ? parseInt(pgMar.getAttribute("w:left")!, 10) : 1440,
    header: pgMar?.getAttribute("w:header") ? parseInt(pgMar.getAttribute("w:header")!, 10) : 709,
    footer: pgMar?.getAttribute("w:footer") ? parseInt(pgMar.getAttribute("w:footer")!, 10) : 709,
    gutter: pgMar?.getAttribute("w:gutter") ? parseInt(pgMar.getAttribute("w:gutter")!, 10) : 0,
  };

  // Distinct title page (different first page header/footer)
  const titlePg = sectPr.getElementsByTagName("w:titlePg").length > 0;

  // Resolve headers map (first, default, even)
  const headersMap: DocxSectionHeaders = {};
  const headerRefs = sectPr.getElementsByTagName("w:headerReference");
  for (let i = 0; i < headerRefs.length; i++) {
    const refEl = headerRefs[i];
    const rId = refEl.getAttributeNS(REL_NS, "id") || refEl.getAttribute("r:id") || "";
    const wType = refEl.getAttribute("w:type") || "default";
    if (rId && parsedHF[rId]) {
      headersMap[wType] = parsedHF[rId];
    }
  }

  // Resolve footers map (first, default, even)
  const footersMap: DocxSectionFooters = {};
  const footerRefs = sectPr.getElementsByTagName("w:footerReference");
  for (let i = 0; i < footerRefs.length; i++) {
    const refEl = footerRefs[i];
    const rId = refEl.getAttributeNS(REL_NS, "id") || refEl.getAttribute("r:id") || "";
    const wType = refEl.getAttribute("w:type") || "default";
    if (rId && parsedHF[rId]) {
      footersMap[wType] = parsedHF[rId];
    }
  }

  // Default fallbacks for backward compatibility
  const sectionHeader = headersMap.default || headersMap.first || headersMap.even;
  const sectionFooter = footersMap.default || footersMap.first || footersMap.even;

  // Page Borders (w:pgBorders)
  let pageBorders: DocxPageBorders | undefined;
  const pgBordersEl = sectPr.getElementsByTagName("w:pgBorders")[0];
  if (pgBordersEl) {
    const offsetFrom = (pgBordersEl.getAttribute("w:offsetFrom") || "page") as any;
    const zOrder = (pgBordersEl.getAttribute("w:zOrder") || "front") as any;
    const borders: DocxPageBorders = { offsetFrom, zOrder };
    for (const side of ["top", "left", "bottom", "right"] as const) {
      const bEl = pgBordersEl.getElementsByTagName(`w:${side}`)[0];
      if (bEl) {
        const val = bEl.getAttribute("w:val") || "single";
        if (val && val !== "none" && val !== "nil") {
          borders[side] = {
            val,
            sz: bEl.getAttribute("w:sz") ? parseInt(bEl.getAttribute("w:sz")!, 10) : 4,
            space: bEl.getAttribute("w:space") ? parseInt(bEl.getAttribute("w:space")!, 10) : 24,
            color: bEl.getAttribute("w:color") || "000000",
          };
        }
      }
    }
    if (borders.top || borders.bottom || borders.left || borders.right) {
      pageBorders = borders;
    }
  }

  return {
    page: { size: { width, height }, orientation: orient, margins, borders: pageBorders },
    content,
    headers: headersMap,
    footers: footersMap,
    header: sectionHeader,
    footer: sectionFooter,
    titlePg,
    evenAndOddHeaders,
    pageBorders,
    borders: pageBorders,
  };
}
