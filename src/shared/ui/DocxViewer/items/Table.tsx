import React from "react";
import type {
  DocxTable,
  DocxRow,
  DocxCell,
  DocxParagraph,
  DocxCellMargins,
} from "../types/docxBridge.types";
import { Paragraph } from "./Paragraph";
import { Run } from "./Run";

interface TableProps {
  table: DocxTable;
  inHeaderFooter?: boolean;
}

// ─── Border Utilities ─────────────────────────────────────────────────────────

/** Map OOXML border val → CSS border-style */
function mapBorderStyle(val: string): string {
  switch (val) {
    case "double":               return "double";
    case "dashed":
    case "dashDot":
    case "dotDash":
    case "dashDotStroked":       return "dashed";
    case "dotted":
    case "dotDotDash":           return "dotted";
    case "none":
    case "nil":                  return "none";
    // single, thick, wave, threeDEmboss, etc. → solid
    default:                     return "solid";
  }
}

/** Resolve any border representation to a CSS border shorthand (or "none") */
function fmtBorder(b: any): string {
  if (!b) return "none";
  if (typeof b === "string") {
    if (b === "none" || b === "nil") return "none";
    return `1px solid ${b.startsWith("#") ? b : `#${b}`}`;
  }
  const val: string = b.val || "single";
  if (val === "none" || val === "nil") return "none";
  const style = mapBorderStyle(val);
  if (style === "none") return "none";
  const width = b.sz ? `${Math.max(1, Math.round(b.sz / 8))}px` : "1px";
  const color = b.color && b.color !== "auto"
    ? `#${(b.color as string).replace("#", "")}`
    : "#000000";
  return `${width} ${style} ${color}`;
}

/** Convert dxa (twips) to px at 96 DPI (1 dxa = 1/15 px) */
const dxa = (v: number) => Math.round(v / 15);

// ─── vMerge processor ────────────────────────────────────────────────────────
// Converts vMerge="restart"/"continue" into proper rowSpan numbers and marks
// continue cells to be skipped during rendering.

interface ProcessedCell {
  cell: DocxCell | string;
  rowSpan: number;
  skip: boolean; // true = this cell is a vMerge continuation, don't render
}

interface ProcessedRow {
  cells: ProcessedCell[];
  height?: number;
}

function processVMerge(rows: Array<DocxRow | Array<DocxCell | string>>): ProcessedRow[] {
  // normalise rows
  const normRows: DocxRow[] = rows.map((r) =>
    Array.isArray(r) ? { cells: r } : r
  );

  // processed[rowIndex][colIndex] = { cell, rowSpan, skip }
  const processed: ProcessedCell[][] = normRows.map((row) =>
    (row.cells || []).map((c) => ({ cell: c, rowSpan: 1, skip: false }))
  );

  // Track open vMerge groups: colIndex → { rowIdx of restart, processedCell at restart }
  const openMerges: Record<number, { rowStart: number; pc: ProcessedCell }> = {};

  for (let rIdx = 0; rIdx < processed.length; rIdx++) {
    const rowCells = processed[rIdx];
    let colOffset = 0; // account for colSpan in previous cells

    for (let cIdx = 0; cIdx < rowCells.length; cIdx++) {
      const pc = rowCells[cIdx];
      const cell = pc.cell;
      const col = cIdx + colOffset;

      if (typeof cell !== "string") {
        const cs = (cell.colSpan ?? 1) - 1;
        colOffset += cs;

        if (cell.vMerge === "restart") {
          openMerges[col] = { rowStart: rIdx, pc };
        } else if (cell.vMerge === "continue" || (cell.vMerge as any) === true) {
          if (openMerges[col]) {
            pc.skip = true;
            openMerges[col].pc.rowSpan += 1;
          } else {
            // Table was sliced across pages; don't skip orphaned continuation
            pc.skip = false;
            pc.rowSpan = 1;
          }
        } else {
          // No vMerge — close any open merge for this column
          delete openMerges[col];
        }
      }
    }
  }

  return normRows.map((row, rIdx) => ({
    cells: processed[rIdx],
    height: (row as any).height,
  }));
}

// ─── Table ────────────────────────────────────────────────────────────────────

export const Table: React.FC<TableProps> = ({ table, inHeaderFooter = false }) => {
  const grid = table.grid;
  const rawRows = table.rows || [];
  const tableBorders = table.borders as Record<string, any> | undefined;
  const tableCellMargins = table.cellMargins || table.properties?.cellMargins;
  const totalGridDxa = grid ? grid.reduce((a, w) => a + (w || 0), 0) : 0;
  const totalRows = rawRows.length;

  const processedRows = processVMerge(rawRows);

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    margin: inHeaderFooter ? "0" : "0.5rem 0",
    tableLayout: grid && grid.length > 0 ? "fixed" : "auto",
  };

  return (
    <div className={`docx-table-wrapper w-full overflow-x-auto ${inHeaderFooter ? "my-0" : "my-2"}`}>
      <table style={tableStyle} className="docx-table text-left">
        {grid && grid.length > 0 && (
          <colgroup>
            {grid.map((colWidth, idx) => {
              const pct =
                totalGridDxa > 0
                  ? `${((colWidth / totalGridDxa) * 100).toFixed(2)}%`
                  : undefined;
              return <col key={idx} style={{ width: pct }} />;
            })}
          </colgroup>
        )}
        <tbody>
          {processedRows.map((pRow, rIdx) => {
            const isFirstRow = rIdx === 0;
            const isLastRow  = rIdx === totalRows - 1;

            // Build rendered cells (skipping vMerge continuations)
            const renderedCells = pRow.cells.filter((pc) => !pc.skip);

            return (
              <tr
                key={rIdx}
                className="docx-tr"
                style={pRow.height ? { height: `${dxa(pRow.height)}px` } : undefined}
              >
                {renderedCells.map((pc, cIdx) => (
                  <TableCell
                    key={cIdx}
                    cell={pc.cell}
                    rowSpanOverride={pc.rowSpan > 1 ? pc.rowSpan : undefined}
                    tableBorders={tableBorders}
                    tableCellMargins={tableCellMargins}
                    isFirstRow={isFirstRow}
                    isLastRow={isLastRow}
                    isFirstCol={cIdx === 0}
                    isLastCol={cIdx === renderedCells.length - 1}
                    inHeaderFooter={inHeaderFooter}
                  />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Cell ─────────────────────────────────────────────────────────────────────

interface CellProps {
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

const TableCell: React.FC<CellProps> = ({
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
        <Paragraph paragraph={{ type: "paragraph", text: cell }} />
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
      if      (side === "top")    tb = isFirstRow ? tableBorders.top    : tableBorders.insideH;
      else if (side === "bottom") tb = isLastRow  ? tableBorders.bottom : tableBorders.insideH;
      else if (side === "left")   tb = isFirstCol ? tableBorders.left   : tableBorders.insideV;
      else                        tb = isLastCol  ? tableBorders.right  : tableBorders.insideV;
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
    verticalAlign:   vAlign,
    paddingTop:      padTop,
    paddingBottom:   padBottom,
    paddingLeft:     padLeft,
    paddingRight:    padRight,
    borderTop:    resolveBorder("top"),
    borderBottom: resolveBorder("bottom"),
    borderLeft:   resolveBorder("left"),
    borderRight:  resolveBorder("right"),
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
          return <Paragraph key={idx} paragraph={item as DocxParagraph} inHeaderFooter={inHeaderFooter} />;
        })
      ) : cell.runs && cell.runs.length > 0 ? (
        <div className="docx-paragraph">
          {cell.runs.map((r, idx) => <Run key={idx} run={r} />)}
        </div>
      ) : cell.text ? (
        <Paragraph paragraph={{ type: "paragraph", text: cell.text }} inHeaderFooter={inHeaderFooter} />
      ) : (
        <div className="min-h-[1.2em]" aria-hidden="true" />
      )}
    </td>
  );
};
