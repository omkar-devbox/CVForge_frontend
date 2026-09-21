import type { DocxRow, DocxCell } from "../types/docxBridge.types";

export interface ProcessedCell {
  cell: DocxCell | string;
  rowSpan: number;
  skip: boolean; // true = this cell is a vMerge continuation, don't render
}

export interface ProcessedRow {
  cells: ProcessedCell[];
  height?: number;
}

/**
 * Converts vMerge="restart"/"continue" into proper rowSpan numbers and marks
 * continue cells to be skipped during rendering.
 */
export function processVMerge(
  rows: Array<DocxRow | Array<DocxCell | string>>
): ProcessedRow[] {
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
