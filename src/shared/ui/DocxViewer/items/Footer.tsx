import React from "react";
import type {
  DocxContentItem,
  DocxParagraph,
  DocxTable,
  DocxHeaderFooter,
} from "../types/docxBridge.types";
import { ContentItemRenderer } from "./ContentItemRenderer";

export interface FooterProps {
  footer?: DocxHeaderFooter;
  footerBottomPx: number;
  leftPx: number;
  rightPx: number;
  bottomPx: number;
}

export interface FooterSpacerProps {
  bottomPx: number;
}

export const FooterSpacer: React.FC<FooterSpacerProps> = ({ bottomPx }) => {
  return (
    <div
      className="docx-footer-spacer shrink-0 mt-auto"
      style={{
        height: `${bottomPx}px`,
        boxSizing: "border-box",
      }}
      aria-hidden="true"
    />
  );
};

export const FooterContentRenderer: React.FC<{ content: DocxContentItem[] }> = ({
  content,
}) => {
  // 1. Filter out truly empty paragraphs
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
    const isLastTable =
      (lastItem as DocxTable).type === "table" || !!(lastItem as DocxTable).rows;
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
                <ContentItemRenderer
                  key={`ftr-left-${idx}`}
                  item={item}
                  inHeaderFooter={true}
                />
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

export const Footer: React.FC<FooterProps> = ({
  footer,
  footerBottomPx,
  leftPx,
  rightPx,
  bottomPx,
}) => {
  const hasContent = Boolean(footer?.content && footer.content.length > 0);
  if (!hasContent) {
    return <FooterSpacer bottomPx={bottomPx} />;
  }

  return (
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
      <FooterContentRenderer content={footer!.content!} />
    </footer>
  );
};
