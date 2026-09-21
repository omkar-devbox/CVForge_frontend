import type {
  DocxSection,
  DocxContentItem,
  DocxParagraph,
  DocxTable,
  DocxHeaderFooter,
  PaginatedPage,
} from "../types";
import {
  dxa,
  resolveSectionGeometry,
  type SectionGeometry,
} from "./pageGeometry";
import { normalizeSectionContent } from "./contentNormalizer";
import {
  estimateItemHeight,
  estimateHeaderFooterHeight,
} from "./heightEstimator";

// Re-exports for backward compatibility
export {
  STANDARD_PAGE_SIZES,
  dxa,
  resolveSectionGeometry,
  type SectionGeometry,
} from "./pageGeometry";
export { normalizeSectionContent } from "./contentNormalizer";
export {
  estimateItemHeight,
  estimateHeaderFooterHeight,
} from "./heightEstimator";

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
      const rowHeights =
        measuredTableRows?.get(idx) ||
        rows.map((r) => {
          const row = Array.isArray(r) ? { cells: r } : r;
          return (row as any).height ? dxa((row as any).height) : 32;
        });

      const fullTableHeight =
        measuredHeights?.get(idx) ??
        rowHeights.reduce((sum, h) => sum + h, 8);

      // Check if entire table fits on current page
      if (
        currentHeight + fullTableHeight <= availableHeight ||
        (rows.length <= 2 && currentPageItems.length === 0)
      ) {
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
            if (
              batchHeight + rh <= remainingSpace ||
              (batchRowsCount === 0 && currentPageItems.length === 0)
            ) {
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
      const itemH =
        measuredHeights?.get(idx) ?? estimateItemHeight(item, geom.contentWidthPx);

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

export function toHeaderFooterRecord(
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
      const hdrH = hdr ? secHeaderHeights?.get(hdrType) ?? estimateHeaderFooterHeight(hdr, 60) : 0;
      const ftrH = ftr ? secFooterHeights?.get(ftrType) ?? estimateHeaderFooterHeight(ftr, 55) : 0;

      const topZone = hdr ? Math.max(geom.topPx, geom.headerTopPx + hdrH + 6) : geom.topPx;
      const bottomZone = ftr ? Math.max(geom.bottomPx, geom.footerBottomPx + ftrH + 6) : geom.bottomPx;

      return Math.max(150, geom.pageHeightPx - topZone - bottomZone);
    };

    const effectiveAvailableHeight = calcEffectiveAvailableHeight(
      defaultHeader,
      defaultFooter,
      "default",
      "default"
    );

    const pageItemGroups = paginateSectionContent(
      section,
      normalizedItems,
      geom,
      sectionHeights,
      sectionTableRows,
      effectiveAvailableHeight
    );

    const pageBorders =
      section.pageBorders || (section.page?.borders as any) || (section.borders as any);

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
        pageHeader = useEven && evenHeader ? evenHeader : defaultHeader;
        pageFooter = useEven && evenFooter ? evenFooter : defaultFooter;
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
