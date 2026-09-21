import type { DocxSection } from "../types";

// Standard paper dimensions in twips/dxa (1 inch = 1440 dxa, 96 DPI → 1 dxa = 1/15 px)
export const STANDARD_PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4: { width: 11906, height: 16838 },
  letter: { width: 12240, height: 15840 },
  legal: { width: 12240, height: 20160 },
  a3: { width: 16838, height: 23811 },
  a5: { width: 8419, height: 11906 },
  b5: { width: 10318, height: 14570 },
  tabloid: { width: 15840, height: 24480 },
};

/** Convert dxa (twips) → CSS pixels at 96 DPI */
export const dxa = (twips: number): number => Math.round(twips / 15);

export interface SectionGeometry {
  pageWidthPx: number;
  pageHeightPx: number;
  topPx: number;
  bottomPx: number;
  leftPx: number;
  rightPx: number;
  headerTopPx: number;
  footerBottomPx: number;
  contentWidthPx: number;
  availableBodyHeight: number;
  bgColor: string;
}

/**
 * Resolves paper geometry in CSS pixels for a section.
 */
export function resolveSectionGeometry(section: DocxSection): SectionGeometry {
  const pageSizeConfig = section.page?.size;
  let baseWidthDxa = 11906;
  let baseHeightDxa = 16838;

  if (typeof pageSizeConfig === "string") {
    const key = pageSizeConfig.toLowerCase();
    if (STANDARD_PAGE_SIZES[key]) {
      ({ width: baseWidthDxa, height: baseHeightDxa } = STANDARD_PAGE_SIZES[key]);
    }
  } else if (pageSizeConfig && typeof pageSizeConfig === "object") {
    if (pageSizeConfig.width) baseWidthDxa = pageSizeConfig.width;
    if (pageSizeConfig.height) baseHeightDxa = pageSizeConfig.height;
  }

  const isLandscape = section.page?.orientation === "landscape";
  const widthDxa = isLandscape
    ? Math.max(baseWidthDxa, baseHeightDxa)
    : Math.min(baseWidthDxa, baseHeightDxa);
  const heightDxa = isLandscape
    ? Math.min(baseWidthDxa, baseHeightDxa)
    : Math.max(baseWidthDxa, baseHeightDxa);

  const pageWidthPx = dxa(widthDxa);
  const pageHeightPx = dxa(heightDxa);

  const margins = section.page?.margins || {};
  const topPx = dxa(margins.top ?? 1440); // 96px default
  const rightPx = dxa(margins.right ?? 1440);
  const bottomPx = dxa(margins.bottom ?? 1440);
  const leftPx = dxa(margins.left ?? 1440);
  const headerTopPx = dxa(margins.header ?? 709); // ~47px
  const footerBottomPx = dxa(margins.footer ?? 709);

  const contentWidthPx = Math.max(200, pageWidthPx - leftPx - rightPx);
  // Net printable vertical space inside page body margins
  const availableBodyHeight = Math.max(200, pageHeightPx - topPx - bottomPx);
  const bgColor = section.background || "#ffffff";

  return {
    pageWidthPx,
    pageHeightPx,
    topPx,
    bottomPx,
    leftPx,
    rightPx,
    headerTopPx,
    footerBottomPx,
    contentWidthPx,
    availableBodyHeight,
    bgColor,
  };
}
