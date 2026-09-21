import type { DocxContentItem, DocxTable, DocxParagraph } from "../types";

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
