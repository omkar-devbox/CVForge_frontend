import type {
  DocxSection,
  DocxContentItem,
  DocxParagraph,
  DocxTable,
  DocxHeaderFooter,
  PaginatedPage,
} from "../types/docxBridge.types";

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
  const widthDxa = isLandscape ? Math.max(baseWidthDxa, baseHeightDxa) : Math.min(baseWidthDxa, baseHeightDxa);
  const heightDxa = isLandscape ? Math.min(baseWidthDxa, baseHeightDxa) : Math.max(baseWidthDxa, baseHeightDxa);

  const pageWidthPx = dxa(widthDxa);
  const pageHeightPx = dxa(heightDxa);

  const margins = section.page?.margins || {};
  const topPx = dxa(margins.top ?? 1440);  // 96px default
  const rightPx = dxa(margins.right ?? 1440);
  const bottomPx = dxa(margins.bottom ?? 1440);
  const leftPx = dxa(margins.left ?? 1440);
  const headerTopPx = dxa(margins.header ?? 709);   // ~47px
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

/**
 * Normalizes content items by splitting paragraphs that contain intra-run page breaks.
 * Paragraphs immediately following a page break are marked with `pageBreakBefore: true`.
 */
export function normalizeSectionContent(items: DocxContentItem[]): DocxContentItem[] {
  const result: DocxContentItem[] = [];

  for (const item of items) {
    if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
      result.push(item);
      continue;
    }

    const para = item as DocxParagraph;
    const runs = para.runs;

    // Check if any run contains a page break
    let hasPageBreak = false;
    if (runs && runs.length > 0) {
      for (const r of runs) {
        if (r.breaks?.some((b) => b.type === "page")) {
          hasPageBreak = true;
          break;
        }
      }
    }

    if (!hasPageBreak) {
      result.push(para);
      continue;
    }

    // Split paragraph at page break runs
    let currentRuns: typeof runs = [];
    let isNextPageBreak = para.pageBreakBefore || false;

    for (const r of runs!) {
      const pageBrIdx = r.breaks ? r.breaks.findIndex((b) => b.type === "page") : -1;
      if (pageBrIdx === -1) {
        currentRuns.push(r);
      } else {
        // Run has a page break: slice runs before break
        const otherBreaks = r.breaks!.filter((b) => b.type !== "page");
        const rBefore = { ...r, breaks: otherBreaks.length > 0 ? otherBreaks : undefined };

        // Push paragraph segment before break if it has content
        if (currentRuns.length > 0 || rBefore.text || rBefore.drawings?.length) {
          if (rBefore.text || rBefore.drawings?.length) currentRuns.push(rBefore);
          result.push({
            ...para,
            pageBreakBefore: isNextPageBreak,
            runs: currentRuns,
          });
          currentRuns = [];
        }

        // Subsequent segment must break to new page
        isNextPageBreak = true;
      }
    }

    if (currentRuns.length > 0) {
      result.push({
        ...para,
        pageBreakBefore: isNextPageBreak,
        runs: currentRuns,
      });
    } else if (isNextPageBreak && result.length === 0) {
      // Empty paragraph with page break
      result.push({
        ...para,
        pageBreakBefore: true,
        runs: [],
      });
    }
  }

  return result;
}

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

  return (lineCount * lineHeightPx) + spacingBefore + spacingAfter + drawingsHeight;
}

/**
 * Paginates a section's normalized content into discrete pages.
 * Supports both heuristic heights and exact measured DOM heights.
 */
export function paginateSectionContent(
  section: DocxSection,
  normalizedItems: DocxContentItem[],
  geom: SectionGeometry,
  measuredHeights?: Map<number, number>,
  measuredTableRows?: Map<number, number[]>,
  availableHeightOverride?: number
): DocxContentItem[][] {
  const pages: DocxContentItem[][] = [];
  let currentPageItems: DocxContentItem[] = [];
  let currentHeight = 0;
  const availableHeight = availableHeightOverride ?? geom.availableBodyHeight;

  const pushCurrentPage = () => {
    if (currentPageItems.length > 0) {
      pages.push(currentPageItems);
      currentPageItems = [];
      currentHeight = 0;
    }
  };

  for (let idx = 0; idx < normalizedItems.length; idx++) {
    const item = normalizedItems[idx];
    const isTable = (item as DocxTable).type === "table" || !!(item as DocxTable).rows;
    const isPara = !isTable;
    const para = isPara ? (item as DocxParagraph) : null;

    // Explicit page break check
    if (para?.pageBreakBefore && currentPageItems.length > 0) {
      pushCurrentPage();
    }

    if (isTable) {
      const table = item as DocxTable;
      const rows = table.rows || [];
      const rowHeights = measuredTableRows?.get(idx) || rows.map((r) => {
        const row = Array.isArray(r) ? { cells: r } : r;
        return (row as any).height ? dxa((row as any).height) : 32;
      });

      const fullTableHeight = measuredHeights?.get(idx) ??
        rowHeights.reduce((sum, h) => sum + h, 8);

      // Check if entire table fits on current page
      if (currentHeight + fullTableHeight <= availableHeight || (rows.length <= 2 && currentPageItems.length === 0)) {
        currentPageItems.push(table);
        currentHeight += fullTableHeight;
      } else {
        // Table doesn't fit wholly on current page — split rows across pages
        let rIdx = 0;
        while (rIdx < rows.length) {
          const remainingSpace = availableHeight - currentHeight;
          let batchRowsCount = 0;
          let batchHeight = 4; // table header/border buffer

          for (let r = rIdx; r < rows.length; r++) {
            const rh = rowHeights[r] ?? 32;
            if (batchHeight + rh <= remainingSpace || (batchRowsCount === 0 && currentPageItems.length === 0)) {
              batchHeight += rh;
              batchRowsCount++;
            } else {
              break;
            }
          }

          if (batchRowsCount > 0) {
            const slicedRows = rows.slice(rIdx, rIdx + batchRowsCount);
            currentPageItems.push({
              ...table,
              rows: slicedRows,
            });
            currentHeight += batchHeight;
            rIdx += batchRowsCount;
          }

          if (rIdx < rows.length) {
            pushCurrentPage();
          }
        }
      }
    } else {
      // Paragraph item
      const itemH = measuredHeights?.get(idx) ?? estimateItemHeight(item, geom.contentWidthPx);

      if (currentHeight + itemH <= availableHeight || currentPageItems.length === 0) {
        currentPageItems.push(item);
        currentHeight += itemH;
      } else {
        // Doesn't fit in remaining page space — flow onto new page
        pushCurrentPage();
        currentPageItems.push(item);
        currentHeight = itemH;
      }
    }
  }

  pushCurrentPage();

  // Guarantee at least 1 page
  if (pages.length === 0) {
    pages.push([]);
  }

  return pages;
}

export function estimateHeaderFooterHeight(hf?: DocxHeaderFooter, defaultFallback = 50): number {
  if (!hf || !hf.content || hf.content.length === 0) return 0;
  let total = 0;
  for (const item of hf.content) {
    if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
      const rows = (item as DocxTable).rows || [];
      total += Math.max(30, rows.length * 24);
    } else {
      const p = item as DocxParagraph;
      const drawings = (p.drawings || []).concat(p.runs?.flatMap((r) => r.drawings || []) || []);
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

function toHeaderFooterRecord(
  hf?: Record<string, DocxHeaderFooter> | DocxHeaderFooter[]
): Record<string, DocxHeaderFooter> {
  if (!hf) return {};
  if (Array.isArray(hf)) {
    const res: Record<string, DocxHeaderFooter> = {};
    hf.forEach((item, idx) => {
      res[item.id || `hf-${idx}`] = item;
    });
    return res;
  }
  return hf;
}

/**
 * Creates the complete PaginatedPage array for an entire document.
 */
export function buildPaginatedPages(
  sections: DocxSection[],
  globalHeadersInput: Record<string, DocxHeaderFooter> | DocxHeaderFooter[] = {},
  globalFootersInput: Record<string, DocxHeaderFooter> | DocxHeaderFooter[] = {},
  measuredData?: {
    heightsBySection: Map<number, Map<number, number>>;
    tableRowsBySection: Map<number, Map<number, number[]>>;
    headerHeightsBySection?: Map<number, Map<string, number>>;
    footerHeightsBySection?: Map<number, Map<string, number>>;
  }
): PaginatedPage[] {
  const globalHeaders = toHeaderFooterRecord(globalHeadersInput);
  const globalFooters = toHeaderFooterRecord(globalFootersInput);
  const allPages: PaginatedPage[] = [];
  let pageCounter = 1;

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    const geom = resolveSectionGeometry(section);
    const normalizedItems = normalizeSectionContent(section.content || []);

    // Resolve header & footer options for this section
    const getSectionHeader = (type: "first" | "even" | "default"): DocxHeaderFooter | undefined => {
      if (section.headers && !Array.isArray(section.headers)) {
        return (section.headers as any)[type];
      }
      return undefined;
    };

    const getSectionFooter = (type: "first" | "even" | "default"): DocxHeaderFooter | undefined => {
      if (section.footers && !Array.isArray(section.footers)) {
        return (section.footers as any)[type];
      }
      return undefined;
    };

    const firstHeader = getSectionHeader("first");
    const firstFooter = getSectionFooter("first");
    const evenHeader = getSectionHeader("even");
    const evenFooter = getSectionFooter("even");
    const defaultHeader =
      getSectionHeader("default") ||
      section.header ||
      (Array.isArray(section.headers) ? section.headers[0] : undefined) ||
      (Object.keys(globalHeaders).length > 0 ? Object.values(globalHeaders)[0] : undefined);
    const defaultFooter =
      getSectionFooter("default") ||
      section.footer ||
      (Array.isArray(section.footers) ? section.footers[0] : undefined) ||
      (Object.keys(globalFooters).length > 0 ? Object.values(globalFooters)[0] : undefined);

    const hasDifferentFirstPage = Boolean(section.titlePg || firstHeader || firstFooter);

    const sectionHeights = measuredData?.heightsBySection.get(sIdx);
    const sectionTableRows = measuredData?.tableRowsBySection.get(sIdx);
    const secHeaderHeights = measuredData?.headerHeightsBySection?.get(sIdx);
    const secFooterHeights = measuredData?.footerHeightsBySection?.get(sIdx);

    // Calculate available body height subtracting header and footer heights
    const calcEffectiveAvailableHeight = (
      hdr?: DocxHeaderFooter,
      ftr?: DocxHeaderFooter,
      hdrType = "default",
      ftrType = "default"
    ): number => {
      const hdrH = hdr ? (secHeaderHeights?.get(hdrType) ?? estimateHeaderFooterHeight(hdr, 60)) : 0;
      const ftrH = ftr ? (secFooterHeights?.get(ftrType) ?? estimateHeaderFooterHeight(ftr, 55)) : 0;

      const topZone = hdr ? Math.max(geom.topPx, geom.headerTopPx + hdrH + 6) : geom.topPx;
      const bottomZone = ftr ? Math.max(geom.bottomPx, geom.footerBottomPx + ftrH + 6) : geom.bottomPx;

      return Math.max(150, geom.pageHeightPx - topZone - bottomZone);
    };

    const effectiveAvailableHeight = calcEffectiveAvailableHeight(defaultHeader, defaultFooter, "default", "default");

    const pageItemGroups = paginateSectionContent(
      section,
      normalizedItems,
      geom,
      sectionHeights,
      sectionTableRows,
      effectiveAvailableHeight
    );

    const pageBorders = section.pageBorders || (section.page?.borders as any) || (section.borders as any);

    for (let pIdx = 0; pIdx < pageItemGroups.length; pIdx++) {
      const pageNum = pageCounter++;
      const isFirstPageOfSection = pIdx === 0;
      const isEvenPage = pageNum % 2 === 0;

      let pageHeader: DocxHeaderFooter | undefined;
      let pageFooter: DocxHeaderFooter | undefined;

      if (isFirstPageOfSection && hasDifferentFirstPage) {
        pageHeader = firstHeader;
        pageFooter = firstFooter;
      } else {
        const useEven = isEvenPage && Boolean(section.evenAndOddHeaders);
        pageHeader = (useEven && evenHeader) ? evenHeader : defaultHeader;
        pageFooter = (useEven && evenFooter) ? evenFooter : defaultFooter;
      }

      allPages.push({
        pageNumber: pageNum,
        totalPages: 1, // updated after loop
        sectionIndex: sIdx,
        section,
        pageWidthPx: geom.pageWidthPx,
        pageHeightPx: geom.pageHeightPx,
        margins: {
          top: geom.topPx,
          bottom: geom.bottomPx,
          left: geom.leftPx,
          right: geom.rightPx,
          header: geom.headerTopPx,
          footer: geom.footerBottomPx,
        },
        pageBorders,
        header: pageHeader,
        footer: pageFooter,
        items: pageItemGroups[pIdx],
      });
    }
  }

  // Set totalPages on every page
  const total = allPages.length;
  for (const page of allPages) {
    page.totalPages = total;
  }

  return allPages;
}
