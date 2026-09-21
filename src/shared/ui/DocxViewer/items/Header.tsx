import React from "react";
import type {
  DocxContentItem,
  DocxParagraph,
  DocxTable,
  DocxHeaderFooter,
} from "../types/docxBridge.types";
import { ContentItemRenderer } from "./ContentItemRenderer";

export interface HeaderProps {
  header?: DocxHeaderFooter;
  headerTopPx: number;
  leftPx: number;
  rightPx: number;
  topPx: number;
}

export interface HeaderSpacerProps {
  topPx: number;
}

export const HeaderSpacer: React.FC<HeaderSpacerProps> = ({ topPx }) => {
  return (
    <div
      className="docx-header-spacer shrink-0"
      style={{
        height: `${topPx}px`,
        boxSizing: "border-box",
      }}
      aria-hidden="true"
    />
  );
};

export const HeaderContentRenderer: React.FC<{ content: DocxContentItem[] }> = ({
  content,
}) => {
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
    const p0Drawings =
      p0.runs?.flatMap((r) => r.drawings || []).filter((d) => !d.isWatermark) || [];
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
            <ContentItemRenderer
              key={`hdr-rest-${idx}`}
              item={item}
              inHeaderFooter={true}
            />
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

export const Header: React.FC<HeaderProps> = ({
  header,
  headerTopPx,
  leftPx,
  rightPx,
  topPx,
}) => {
  const hasContent = Boolean(header?.content && header.content.length > 0);
  if (!hasContent) {
    return <HeaderSpacer topPx={topPx} />;
  }

  return (
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
      <HeaderContentRenderer content={header!.content!} />
    </header>
  );
};
