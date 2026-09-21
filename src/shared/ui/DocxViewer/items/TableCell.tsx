import React from "react";
import type {
  DocxCell,
  DocxCellMargins,
  DocxParagraph,
  DocxTable,
} from "../types/docxBridge.types";
import { fmtBorder, dxa } from "./border.utils";
import { Paragraph } from "./Paragraph";
import { Run } from "./Run";
import { Table } from "./Table";

export interface TableCellProps {
  cell: DocxCell | string;
  rowSpanOverride?: number;
  tableBorders?: Record<string, any>;
  tableCellMargins?: DocxCellMargins;
  isFirstRow?: boolean;
  isLastRow?: boolean;
  isFirstCol?: boolean;
  isLastCol?: boolean;
  inHeaderFooter?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  cell,
  rowSpanOverride,
  tableBorders,
  tableCellMargins,
  isFirstRow,
  isLastRow,
  isFirstCol,
  isLastCol,
  inHeaderFooter = false,
}) => {
  // ── String cell (simple format) ──────────────────────────────────────
  if (typeof cell === "string") {
    return (
      <td
        className="docx-tc text-sm"
        style={{
          border: tableBorders?.insideH ? fmtBorder(tableBorders.insideH) : "none",
          padding: "3px 6px",
        }}
      >
        <Paragraph paragraph={{ type: "paragraph", text: cell }} inHeaderFooter={inHeaderFooter} />
      </td>
    );
  }

  // ── Spanning ─────────────────────────────────────────────────────────
  const colSpan = cell.colSpan || cell.gridSpan;
  const rowSpan = rowSpanOverride ?? cell.rowSpan;

  // ── Background ────────────────────────────────────────────────────────
  let bgColor = cell.bg;
  if (!bgColor && cell.shading) {
    bgColor = typeof cell.shading === "object" ? cell.shading.fill : cell.shading;
  }
  if (bgColor && bgColor !== "auto" && bgColor !== "none") {
    bgColor = bgColor.startsWith("#") ? bgColor : `#${bgColor}`;
  } else {
    bgColor = undefined;
  }

  // ── Vertical alignment ────────────────────────────────────────────────
  let vAlign: "top" | "middle" | "bottom" = "top";
  if (cell.vAlign === "center") vAlign = "middle";
  else if (cell.vAlign === "bottom") vAlign = "bottom";

  // ── Cell width from tcW ───────────────────────────────────────────────
  let cellWidthStyle: string | undefined;
  if (cell.width && typeof cell.width === "number" && cell.width > 0) {
    // Convert dxa to px — only apply if not using colgroup (which handles it via %)
    cellWidthStyle = `${dxa(cell.width)}px`;
  }

  // ── Borders — cell > table inside > table outer > none ─────────────
  const cellBorderMap = cell.borders as Record<string, any> | undefined;

  const resolveBorder = (side: "top" | "bottom" | "left" | "right"): string => {
    // 1. Explicit cell border
    if (cellBorderMap && side in cellBorderMap) {
      return fmtBorder(cellBorderMap[side]);
    }

    // 2. Table-level border fallback
    if (tableBorders && Object.keys(tableBorders).length > 0) {
      let tb: any;
      if (side === "top") tb = isFirstRow ? tableBorders.top : tableBorders.insideH;
      else if (side === "bottom") tb = isLastRow ? tableBorders.bottom : tableBorders.insideH;
      else if (side === "left") tb = isFirstCol ? tableBorders.left : tableBorders.insideV;
      else tb = isLastCol ? tableBorders.right : tableBorders.insideV;
      if (tb) return fmtBorder(tb);
      return "none";
    }

    // 3. If neither cell nor table defined any borders, Word default is no border
    return "none";
  };

  // ── Padding from margins ──────────────────────────────────────────────
  const padTop =
    cell.margins?.top !== undefined
      ? `${dxa(cell.margins.top)}px`
      : tableCellMargins?.top !== undefined
      ? `${dxa(tableCellMargins.top)}px`
      : "3px";
  const padBottom =
    cell.margins?.bottom !== undefined
      ? `${dxa(cell.margins.bottom)}px`
      : tableCellMargins?.bottom !== undefined
      ? `${dxa(tableCellMargins.bottom)}px`
      : "3px";
  const padLeft =
    cell.margins?.left !== undefined
      ? `${dxa(cell.margins.left)}px`
      : tableCellMargins?.left !== undefined
      ? `${dxa(tableCellMargins.left)}px`
      : "6px";
  const padRight =
    cell.margins?.right !== undefined
      ? `${dxa(cell.margins.right)}px`
      : tableCellMargins?.right !== undefined
      ? `${dxa(tableCellMargins.right)}px`
      : "6px";

  const tdStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    verticalAlign: vAlign,
    paddingTop: padTop,
    paddingBottom: padBottom,
    paddingLeft: padLeft,
    paddingRight: padRight,
    borderTop: resolveBorder("top"),
    borderBottom: resolveBorder("bottom"),
    borderLeft: resolveBorder("left"),
    borderRight: resolveBorder("right"),
  };
  if (cellWidthStyle) {
    tdStyle.width = cellWidthStyle;
    tdStyle.minWidth = cellWidthStyle;
  }

  // ── Content ───────────────────────────────────────────────────────────
  const contentItems = cell.content || cell.paragraphs;

  return (
    <td
      colSpan={colSpan && colSpan > 1 ? colSpan : undefined}
      rowSpan={rowSpan && rowSpan > 1 ? rowSpan : undefined}
      style={tdStyle}
      className="docx-tc text-sm"
    >
      {contentItems && contentItems.length > 0 ? (
        contentItems.map((item, idx) => {
          if ((item as DocxTable).type === "table" || (item as DocxTable).rows) {
            return <Table key={idx} table={item as DocxTable} inHeaderFooter={inHeaderFooter} />;
          }
          return (
            <Paragraph
              key={idx}
              paragraph={item as DocxParagraph}
              inHeaderFooter={inHeaderFooter}
            />
          );
        })
      ) : cell.runs && cell.runs.length > 0 ? (
        <div className="docx-paragraph">
          {cell.runs.map((r, idx) => (
            <Run key={idx} run={r} />
          ))}
        </div>
      ) : cell.text ? (
        <Paragraph
          paragraph={{ type: "paragraph", text: cell.text }}
          inHeaderFooter={inHeaderFooter}
        />
      ) : (
        <div className="min-h-[1.2em]" aria-hidden="true" />
      )}
    </td>
  );
};
