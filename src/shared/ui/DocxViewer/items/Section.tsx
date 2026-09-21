import React from "react";
import type {
  DocxSection,
  DocxContentItem,
  DocxParagraph,
  DocxTable,
  DocxHeaderFooter,
  PaginatedPage,
  DocxBorder,
  DocxPageBorders,
} from "../types/docxBridge.types";
import { Paragraph } from "./Paragraph";
import { Table } from "./Table";
import { useDocument } from "../context/DocumentContext";
import { PageProvider } from "../context/PageContext";
import { resolveSectionGeometry } from "../utils/docxPaginator";

interface SectionProps {
  page?: PaginatedPage;
  section?: DocxSection;
  pageNumber: number;
  totalPages: number;
  showPageNumberPill?: boolean;
}

function fmtPageBorder(b?: DocxBorder): string {
  if (!b) return "none";
  const val = b.val || "single";
  if (val === "none" || val === "nil") return "none";
  let style = "solid";
  if (val === "double") style = "double";
  else if (val === "dashed" || val === "dashDot") style = "dashed";
  else if (val === "dotted") style = "dotted";

  // sz is in 1/8 pt -> px (1pt = 96/72 px = 1.3333px)
  const widthPx = Math.max(1, Math.round(((b.sz || 4) / 8) * (96 / 72)));
  const color =
    b.color && b.color !== "auto"
      ? b.color.startsWith("#")
        ? b.color
        : `#${b.color}`
      : "#000000";
  return `${widthPx}px ${style} ${color}`;
}

const ptToPx = (pt: number) => Math.round(pt * (96 / 72));

export const Section: React.FC<SectionProps> = ({
  page,
  section,
  pageNumber,
  totalPages,
  showPageNumberPill = false,
}) => {
  const { headers: globalHeaders, footers: globalFooters, resolveMediaSrc } = useDocument();

  // ── 1. Page Geometry & Settings ─────────────────────────────────────────
  const activeSection = page?.section || section || {};
  const geom = resolveSectionGeometry(activeSection);

  const pageWidthPx = page ? page.pageWidthPx : geom.pageWidthPx;
  const pageHeightPx = page ? page.pageHeightPx : geom.pageHeightPx;

  const topPx = page ? page.margins.top : geom.topPx;
  const rightPx = page ? page.margins.right : geom.rightPx;
  const bottomPx = page ? page.margins.bottom : geom.bottomPx;
  const leftPx = page ? page.margins.left : geom.leftPx;
  const headerTopPx = page ? page.margins.header : geom.headerTopPx;
  const footerBottomPx = page ? page.margins.footer : geom.footerBottomPx;
  const bgColor = geom.bgColor;

  // ── 2. Resolve Header ──────────────────────────────────────────────────
  let activeHeader: DocxHeaderFooter | undefined = page ? page.header : activeSection.header;
  if (!activeHeader && !page && activeSection.headers) {
    if (Array.isArray(activeSection.headers)) {
      activeHeader = activeSection.headers[0];
    } else {
      activeHeader =
        (activeSection.headers as any).default ||
        (activeSection.headers as any).first ||
        Object.values(activeSection.headers as Record<string, DocxHeaderFooter>)[0];
    }
  }
  if (!activeHeader && !page && Object.keys(globalHeaders).length > 0) {
    activeHeader = Object.values(globalHeaders)[0];
  }

  // ── 3. Resolve Footer ──────────────────────────────────────────────────
  let activeFooter: DocxHeaderFooter | undefined = page ? page.footer : activeSection.footer;
  if (!activeFooter && !page && activeSection.footers) {
    if (Array.isArray(activeSection.footers)) {
      activeFooter = activeSection.footers[0];
    } else {
      activeFooter =
        (activeSection.footers as any).default ||
        (activeSection.footers as any).first ||
        Object.values(activeSection.footers as Record<string, DocxHeaderFooter>)[0];
    }
  }
  if (!activeFooter && !page && Object.keys(globalFooters).length > 0) {
    activeFooter = Object.values(globalFooters)[0];
  }

  const hasHeader = !!activeHeader?.content?.length;
  const hasFooter = !!activeFooter?.content?.length;
  const contentItems: DocxContentItem[] = page ? page.items : (activeSection.content || []);

  // ── 4. Extract Watermark from Headers/Document ──────────────────────────
  const findWatermarkSrc = (content?: DocxContentItem[]): string | undefined => {
    if (!content) return undefined;
    for (const item of content) {
      const p = item as DocxParagraph;
      if (p.drawings) {
        for (const d of p.drawings) {
          if (d.isWatermark) return resolveMediaSrc(d.src || d.relationshipId);
        }
      }
      if (p.runs) {
        for (const r of p.runs) {
          if (r.drawings) {
            for (const d of r.drawings) {
              if (d.isWatermark) return resolveMediaSrc(d.src || d.relationshipId);
            }
          }
        }
      }
    }
    return undefined;
  };

  const watermarkSrc =
    findWatermarkSrc(activeHeader?.content) ||
    findWatermarkSrc(activeSection.header?.content) ||
    findWatermarkSrc(Object.values(globalHeaders)[0]?.content);

  // ── 5. Page Borders ────────────────────────────────────────────────────
  const pageBorders: DocxPageBorders | undefined =
    page?.pageBorders ||
    (activeSection.pageBorders as any) ||
    (activeSection.page?.borders as any) ||
    (activeSection.borders as any);

  const hasPageBorders = Boolean(
    pageBorders &&
    (pageBorders.top || pageBorders.bottom || pageBorders.left || pageBorders.right)
  );

  let borderInsetTop = 0;
  let borderInsetBottom = 0;
  let borderInsetLeft = 0;
  let borderInsetRight = 0;

  if (hasPageBorders && pageBorders) {
    const isFromText = pageBorders.offsetFrom === "text";
    const spaceT = ptToPx(pageBorders.top?.space ?? 24);
    const spaceB = ptToPx(pageBorders.bottom?.space ?? 24);
    const spaceL = ptToPx(pageBorders.left?.space ?? 24);
    const spaceR = ptToPx(pageBorders.right?.space ?? 24);

    if (isFromText) {
      borderInsetTop = Math.max(0, topPx - spaceT);
      borderInsetBottom = Math.max(0, bottomPx - spaceB);
      borderInsetLeft = Math.max(0, leftPx - spaceL);
      borderInsetRight = Math.max(0, rightPx - spaceR);
    } else {
      borderInsetTop = spaceT;
      borderInsetBottom = spaceB;
      borderInsetLeft = spaceL;
      borderInsetRight = spaceR;
    }
  }

  return (
    <PageProvider pageNumber={pageNumber} totalPages={totalPages}>
      <div
        className="docx-page-container flex justify-center my-6 print:my-0 select-text transition-shadow"
        data-page={pageNumber}
      >
        <div
          className="docx-page bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.10)] relative flex flex-col justify-between print:shadow-none print:border-none"
          style={{
            width: `${pageWidthPx}px`,
            height: `${pageHeightPx}px`,
            minHeight: `${pageHeightPx}px`,
            maxHeight: `${pageHeightPx}px`,
            overflow: "hidden",
            backgroundColor: bgColor,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* ── Document Watermark ─── */}
          {watermarkSrc && (
            <img
              src={watermarkSrc}
              alt="Document Watermark"
              className="docx-page-watermark absolute pointer-events-none select-none z-1"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: "75%",
                maxHeight: "75%",
                opacity: 0.12,
              }}
              aria-hidden="true"
            />
          )}

          {/* ── Page Border Frame (w:pgBorders) ─── */}
          {hasPageBorders && pageBorders && (
            <div
              className="docx-page-border-frame absolute pointer-events-none z-[15]"
              style={{
                top: `${borderInsetTop}px`,
                bottom: `${borderInsetBottom}px`,
                left: `${borderInsetLeft}px`,
                right: `${borderInsetRight}px`,
                borderTop: fmtPageBorder(pageBorders.top),
                borderBottom: fmtPageBorder(pageBorders.bottom),
                borderLeft: fmtPageBorder(pageBorders.left),
                borderRight: fmtPageBorder(pageBorders.right),
                boxSizing: "border-box",
              }}
              aria-hidden="true"
            />
          )}

          {/* ── Header — positioned at top of page ─── */}
          {hasHeader ? (
            <header
              className="docx-header shrink-0 relative z-10 overflow-visible"
              style={{
                paddingTop: `${headerTopPx}px`,
                paddingLeft: `${leftPx}px`,
                paddingRight: `${rightPx}px`,
                paddingBottom: "4px",
                minHeight: `${topPx}px`,
                boxSizing: "border-box",
              }}
            >
              <HeaderContentRenderer content={activeHeader!.content!} />
            </header>
          ) : (
            <div
              className="docx-header-spacer shrink-0"
              style={{
                height: `${topPx}px`,
                boxSizing: "border-box",
              }}
              aria-hidden="true"
            />
          )}

          {/* ── Body — strictly bounded between header and footer ── */}
          <main
            className="docx-body flex-1 min-h-0 relative z-5"
            style={{
              paddingLeft: `${leftPx}px`,
              paddingRight: `${rightPx}px`,
              paddingTop: "0px",
              paddingBottom: "0px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {contentItems.map((item, idx) => (
              <ContentItemRenderer key={`cnt-${idx}`} item={item} />
            ))}
          </main>

          {/* ── Footer — positioned at bottom of page ─── */}
          {hasFooter ? (
            <footer
              className="docx-footer shrink-0 mt-auto relative z-10 overflow-visible"
              style={{
                paddingBottom: `${footerBottomPx}px`,
                paddingLeft: `${leftPx}px`,
                paddingRight: `${rightPx}px`,
                paddingTop: "4px",
                minHeight: `${bottomPx}px`,
                boxSizing: "border-box",
              }}
            >
              <FooterContentRenderer content={activeFooter!.content!} />
            </footer>
          ) : (
            <div
              className="docx-footer-spacer shrink-0 mt-auto"
              style={{
                height: `${bottomPx}px`,
                boxSizing: "border-box",
              }}
              aria-hidden="true"
            />
          )}

          {/* External page number pill: hidden so original DOCX footer/page number shows cleanly */}
          {showPageNumberPill && !hasFooter && (
            <div
              className="absolute bottom-2 right-3 text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-600 select-none print:hidden pointer-events-none z-20"
              aria-hidden="true"
            >
              {pageNumber} / {totalPages}
            </div>
          )}
        </div>
      </div>
    </PageProvider>
  );
};

export const DocxPageSheet = Section;

export const HeaderContentRenderer: React.FC<{ content: DocxContentItem[] }> = ({ content }) => {
  // Filter out truly empty paragraphs in headers
  const activeItems = content.filter((item) => {
    if ((item as DocxTable).type === "table" || (item as DocxTable).rows) return true;
    const p = item as DocxParagraph;
    const runs = p.runs;
    const isEmpty =
      (!runs ||
        runs.length === 0 ||
        runs.every(
          (r) =>
            (!r.text || /^\s*$/.test(r.text)) &&
            (!r.drawings || r.drawings.every((d) => d.isWatermark)) &&
            !r.breaks
        )) &&
      (!p.text || /^\s*$/.test(p.text));
    return !isEmpty;
  });

  if (activeItems.length === 0) return null;

  // Pattern: Small logo in item 0 + title text in item 1 (e.g. ATS Conveyors in header3.xml)
  if (activeItems.length >= 2) {
    const p0 = activeItems[0] as DocxParagraph;
    const p1 = activeItems[1] as DocxParagraph;
    const p0Drawings = p0.runs?.flatMap((r) => r.drawings || []).filter((d) => !d.isWatermark) || [];
    const p0IsLogoOnly =
      p0Drawings.length === 1 &&
      (!p0.runs || p0.runs.every((r) => !r.text || /^\s*$/.test(r.text)));

    const p1HasText = Boolean(
      (p1.text && !/^\s*$/.test(p1.text)) ||
      p1.runs?.some((r) => r.text && !/^\s*$/.test(r.text))
    );

    if (p0IsLogoOnly && p1HasText) {
      const restItems = activeItems.slice(2);
      return (
        <div className="docx-header-content flex flex-col w-full gap-1">
          <div className="docx-header-logo-row flex items-center gap-3 w-full">
            <div className="shrink-0 flex items-center">
              <ContentItemRenderer item={p0} inHeaderFooter={true} />
            </div>
            <div className="flex-1 min-w-0">
              <ContentItemRenderer item={p1} inHeaderFooter={true} />
            </div>
          </div>
          {restItems.map((item, idx) => (
            <ContentItemRenderer key={`hdr-rest-${idx}`} item={item} inHeaderFooter={true} />
          ))}
        </div>
      );
    }
  }

  return (
    <div className="docx-header-content flex flex-col w-full gap-1">
      {activeItems.map((item, idx) => (
        <ContentItemRenderer key={`hdr-${idx}`} item={item} inHeaderFooter={true} />
      ))}
    </div>
  );
};

export const FooterContentRenderer: React.FC<{ content: DocxContentItem[] }> = ({ content }) => {
  // 1. Filter out truly empty paragraphs (exact same as HeaderContentRenderer)
  const activeItems = content.filter((item) => {
    if ((item as DocxTable).type === "table" || (item as DocxTable).rows) return true;
    const p = item as DocxParagraph;
    const runs = p.runs;
    const isEmpty =
      (!runs ||
        runs.length === 0 ||
        runs.every(
          (r) =>
            (!r.text || /^\s*$/.test(r.text)) &&
            (!r.drawings || r.drawings.every((d) => d.isWatermark)) &&
            !r.breaks
        )) &&
      (!p.text || /^\s*$/.test(p.text));
    return !isEmpty;
  });

  if (activeItems.length === 0) return null;

  // 2. Pattern: Multi-item footer where the last item is a right-aligned page number
  // e.g. Left column: Company Name + Address Textbox, Right column: Page: X of Y
  if (activeItems.length >= 2) {
    const lastItem = activeItems[activeItems.length - 1];
    const isLastTable = (lastItem as DocxTable).type === "table" || !!(lastItem as DocxTable).rows;
    if (!isLastTable) {
      const pLast = lastItem as DocxParagraph;
      const isPageOrRight =
        pLast.alignment === "right" ||
        pLast.runs?.some((r) => r.field === "PAGE" || r.field === "NUMPAGES") ||
        (pLast.text && /page\s*:/i.test(pLast.text));

      if (isPageOrRight) {
        const leftItems = activeItems.slice(0, activeItems.length - 1);
        return (
          <div className="docx-footer-content flex justify-between items-end w-full leading-tight">
            <div className="flex-1 flex flex-col text-left items-start gap-0 min-w-0">
              {leftItems.map((item, idx) => (
                <ContentItemRenderer key={`ftr-left-${idx}`} item={item} inHeaderFooter={true} />
              ))}
            </div>
            <div className="shrink-0 flex flex-col text-right justify-end items-end min-w-0 pb-0.5">
              <ContentItemRenderer item={lastItem} inHeaderFooter={true} />
            </div>
          </div>
        );
      }
    }
  }

  // 3. Render active items in order
  return (
    <div className="docx-footer-content flex flex-col w-full gap-1">
      {activeItems.map((item, idx) => (
        <ContentItemRenderer key={`ftr-${idx}`} item={item} inHeaderFooter={true} />
      ))}
    </div>
  );
};

export const ContentItemRenderer: React.FC<{
  item: DocxContentItem;
  inHeaderFooter?: boolean;
}> = ({ item, inHeaderFooter = false }) => {
  if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
    return <Table table={item as DocxTable} inHeaderFooter={inHeaderFooter} />;
  }
  return <Paragraph paragraph={item as DocxParagraph} inHeaderFooter={inHeaderFooter} />;
};
