import React from "react";
import type { DocxTable, DocxCellMargins } from "../types/docxBridge.types";
import { processVMerge } from "./table.utils";
import { TableCell } from "./TableCell";
import { dxa } from "./border.utils";

export interface TableProps {
  table: DocxTable;
  inHeaderFooter?: boolean;
}

export const Table: React.FC<TableProps> = ({ table, inHeaderFooter = false }) => {
  const grid = table.grid;
  const rawRows = table.rows || [];
  const tableBorders = table.borders as Record<string, any> | undefined;
  const tableCellMargins = (table.cellMargins || table.properties?.cellMargins) as
    | DocxCellMargins
    | undefined;
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
    <div
      className={`docx-table-wrapper w-full overflow-x-auto ${
        inHeaderFooter ? "my-0" : "my-2"
      }`}
    >
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
            const isLastRow = rIdx === totalRows - 1;

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
