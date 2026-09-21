import React, { useLayoutEffect, useRef } from "react";
import type { DocxBridgeDocument } from "../types/docxBridge.types";
import {
  resolveSectionGeometry,
  normalizeSectionContent,
} from "../utils/docxPaginator";
import { ContentItemRenderer } from "./ContentItemRenderer";
import { HeaderContentRenderer } from "./Header";
import { FooterContentRenderer } from "./Footer";

export interface MeasuredData {
  heightsBySection: Map<number, Map<number, number>>;
  tableRowsBySection: Map<number, Map<number, number[]>>;
  headerHeightsBySection?: Map<number, Map<string, number>>;
  footerHeightsBySection?: Map<number, Map<string, number>>;
}

interface DocxPageMeasurerProps {
  document: DocxBridgeDocument;
  onMeasured: (data: MeasuredData) => void;
}

/**
 * Invisible measurement sandbox mounted to measure real rendered heights
 * of paragraphs, table rows, headers, and footers using active styles and assets.
 */
export const DocxPageMeasurer: React.FC<DocxPageMeasurerProps> = ({
  document: doc,
  onMeasured,
}) => {
  const measureRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const container = measureRef.current;

    const heightsBySection = new Map<number, Map<number, number>>();
    const tableRowsBySection = new Map<number, Map<number, number[]>>();
    const headerHeightsBySection = new Map<number, Map<string, number>>();
    const footerHeightsBySection = new Map<number, Map<string, number>>();

    const sectionEls = container.querySelectorAll("[data-measure-sidx]");
    sectionEls.forEach((sEl) => {
      const sIdx = parseInt(sEl.getAttribute("data-measure-sidx") || "0", 10);
      const itemMap = new Map<number, number>();
      const tableMap = new Map<number, number[]>();
      const headerMap = new Map<string, number>();
      const footerMap = new Map<string, number>();

      // Measure headers
      const hdrEls = sEl.querySelectorAll(":scope > [data-measure-header]");
      hdrEls.forEach((hEl) => {
        const type = hEl.getAttribute("data-measure-header") || "default";
        const rect = (hEl as HTMLElement).getBoundingClientRect();
        headerMap.set(type, Math.max(1, Math.round(rect.height)));
      });
      headerHeightsBySection.set(sIdx, headerMap);

      // Measure footers
      const ftrEls = sEl.querySelectorAll(":scope > [data-measure-footer]");
      ftrEls.forEach((fEl) => {
        const type = fEl.getAttribute("data-measure-footer") || "default";
        const rect = (fEl as HTMLElement).getBoundingClientRect();
        footerMap.set(type, Math.max(1, Math.round(rect.height)));
      });
      footerHeightsBySection.set(sIdx, footerMap);

      const itemEls = sEl.querySelectorAll(":scope > [data-measure-iidx]");
      itemEls.forEach((iEl) => {
        const iIdx = parseInt(iEl.getAttribute("data-measure-iidx") || "0", 10);
        const rect = (iEl as HTMLElement).getBoundingClientRect();

        let margins = 0;
        const firstChild = iEl.firstElementChild as HTMLElement;
        if (firstChild) {
          const cs = window.getComputedStyle(firstChild);
          margins = (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
        }

        const totalH = Math.max(1, rect.height + margins);
        itemMap.set(iIdx, totalH);

        // Check if item contains a table
        const tbl = iEl.querySelector("table");
        if (tbl) {
          const trs = tbl.querySelectorAll("tr");
          const rHeights: number[] = [];
          trs.forEach((tr) => {
            rHeights.push(Math.max(20, tr.getBoundingClientRect().height));
          });
          if (rHeights.length > 0) {
            tableMap.set(iIdx, rHeights);
          }
        }
      });

      heightsBySection.set(sIdx, itemMap);
      tableRowsBySection.set(sIdx, tableMap);
    });

    onMeasured({
      heightsBySection,
      tableRowsBySection,
      headerHeightsBySection,
      footerHeightsBySection,
    });
  }, [doc, onMeasured]);

  const sections = doc.sections || [];

  return (
    <div
      ref={measureRef}
      className="docx-measure-sandbox"
      style={{
        position: "fixed",
        top: 0,
        left: "-99999px",
        visibility: "hidden",
        pointerEvents: "none",
        zIndex: -9999,
        opacity: 0,
      }}
      aria-hidden="true"
    >
      {sections.map((section, sIdx) => {
        const geom = resolveSectionGeometry(section);
        const normalized = normalizeSectionContent(section.content || []);

        return (
          <div
            key={sIdx}
            data-measure-sidx={sIdx}
            style={{
              width: `${geom.contentWidthPx}px`,
              boxSizing: "border-box",
            }}
          >
            {/* Headers measurement */}
            {section.headers &&
              !Array.isArray(section.headers) &&
              Object.entries(section.headers).map(([type, hf]) => (
                <div key={`hdr-${type}`} data-measure-header={type}>
                  <HeaderContentRenderer content={hf?.content || []} />
                </div>
              ))}

            {/* Footers measurement */}
            {section.footers &&
              !Array.isArray(section.footers) &&
              Object.entries(section.footers).map(([type, hf]) => (
                <div key={`ftr-${type}`} data-measure-footer={type}>
                  <FooterContentRenderer content={hf?.content || []} />
                </div>
              ))}

            {/* Body items measurement */}
            {normalized.map((item, iIdx) => (
              <div key={iIdx} data-measure-iidx={iIdx}>
                <ContentItemRenderer item={item} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
