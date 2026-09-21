import React from "react";
import type { DocxContentItem, DocxParagraph } from "../types/docxBridge.types";

export interface WatermarkProps {
  watermarkSrc?: string;
}

/**
 * Scan paragraphs and runs to find an embedded watermark image source
 */
export function findWatermarkSrc(
  content: DocxContentItem[] | undefined,
  resolveMediaSrc: (rawSrc?: string) => string | undefined
): string | undefined {
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
}

export const Watermark: React.FC<WatermarkProps> = ({ watermarkSrc }) => {
  if (!watermarkSrc) return null;

  return (
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
  );
};
