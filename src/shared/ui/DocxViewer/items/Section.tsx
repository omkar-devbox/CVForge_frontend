import React from "react";
import type {
  DocxSection,
  DocxContentItem,
  DocxHeaderFooter,
  PaginatedPage,
  DocxPageBorders,
} from "../types/docxBridge.types";
import { useDocument } from "../context/DocumentContext";
import { PageProvider } from "../context/PageContext";
import { resolveSectionGeometry } from "../utils/docxPaginator";
import { PageBorder } from "./PageBorder";
import { Watermark, findWatermarkSrc } from "./Watermark";
import { Header, HeaderContentRenderer } from "./Header";
import { Footer, FooterContentRenderer } from "./Footer";
import { ContentItemRenderer } from "./ContentItemRenderer";

export interface SectionProps {
  page?: PaginatedPage;
  section?: DocxSection;
  pageNumber: number;
  totalPages: number;
  showPageNumberPill?: boolean;
  showWatermark?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  page,
  section,
  pageNumber,
  totalPages,
  showPageNumberPill = false,
  showWatermark = true,
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

  const hasFooter = !!activeFooter?.content?.length;
  const contentItems: DocxContentItem[] = page ? page.items : (activeSection.content || []);

  // ── 4. Extract Watermark from Active Header ─────────────────────────────
  const watermarkSrc = showWatermark
    ? findWatermarkSrc(activeHeader?.content, resolveMediaSrc) ||
      findWatermarkSrc(activeSection.header?.content, resolveMediaSrc)
    : undefined;

  // ── 5. Page Borders ────────────────────────────────────────────────────
  const pageBorders: DocxPageBorders | undefined =
    page?.pageBorders ||
    (activeSection.pageBorders as any) ||
    (activeSection.page?.borders as any) ||
    (activeSection.borders as any);

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
          <Watermark watermarkSrc={watermarkSrc} />

          {/* ── Page Border Frame (w:pgBorders) ─── */}
          <PageBorder
            pageBorders={pageBorders}
            margins={{ top: topPx, right: rightPx, bottom: bottomPx, left: leftPx }}
          />

          {/* ── Header — positioned at top of page ─── */}
          <Header
            header={activeHeader}
            headerTopPx={headerTopPx}
            leftPx={leftPx}
            rightPx={rightPx}
            topPx={topPx}
          />

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
          <Footer
            footer={activeFooter}
            footerBottomPx={footerBottomPx}
            leftPx={leftPx}
            rightPx={rightPx}
            bottomPx={bottomPx}
          />

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

// Backwards-compatibility re-exports
export { HeaderContentRenderer } from "./Header";
export { FooterContentRenderer } from "./Footer";
export { ContentItemRenderer } from "./ContentItemRenderer";
