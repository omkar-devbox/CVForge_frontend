import React from "react";
import type { DocxPageBorders } from "../types/docxBridge.types";
import { fmtPageBorder, ptToPx } from "./border.utils";

export interface PageBorderProps {
  pageBorders?: DocxPageBorders;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const PageBorder: React.FC<PageBorderProps> = ({ pageBorders, margins }) => {
  if (!pageBorders) return null;

  const hasPageBorders = Boolean(
    pageBorders.top || pageBorders.bottom || pageBorders.left || pageBorders.right
  );
  if (!hasPageBorders) return null;

  const isFromText = pageBorders.offsetFrom === "text";
  const spaceT = ptToPx(pageBorders.top?.space ?? 24);
  const spaceB = ptToPx(pageBorders.bottom?.space ?? 24);
  const spaceL = ptToPx(pageBorders.left?.space ?? 24);
  const spaceR = ptToPx(pageBorders.right?.space ?? 24);

  const borderInsetTop = isFromText ? Math.max(0, margins.top - spaceT) : spaceT;
  const borderInsetBottom = isFromText ? Math.max(0, margins.bottom - spaceB) : spaceB;
  const borderInsetLeft = isFromText ? Math.max(0, margins.left - spaceL) : spaceL;
  const borderInsetRight = isFromText ? Math.max(0, margins.right - spaceR) : spaceR;

  return (
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
  );
};
