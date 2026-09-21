import type {
  DocxTable,
  DocxRow,
  DocxCell,
  DocxCellMargins,
  DocxParagraph,
} from "../types";
import { parseParagraph } from "./paragraphParser";

/**
 * Parses a `<w:tbl>` table element.
 */
export function parseTable(
  tblEl: Element,
  mediaMap: Record<string, string>,
  relationsMap: Record<string, string>
): DocxTable {
  // Column widths
  const gridCols: number[] = [];
  const tblGrid = tblEl.getElementsByTagName("w:tblGrid")[0];
  if (tblGrid) {
    const colEls = tblGrid.getElementsByTagName("w:gridCol");
    for (let i = 0; i < colEls.length; i++) {
      const w = colEls[i].getAttribute("w:w");
      if (w) gridCols.push(parseInt(w, 10));
    }
  }

  // Table-level properties: borders, alignment, cell margins
  const tblPr = tblEl.getElementsByTagName("w:tblPr")[0];
  const tableBorders: Record<string, any> = {};
  let tableAlignment: string | undefined;
  let tblCellMargins: DocxCellMargins | undefined;

  if (tblPr) {
    const jcEl = tblPr.getElementsByTagName("w:jc")[0];
    if (jcEl) tableAlignment = jcEl.getAttribute("w:val") || undefined;

    const tblBordersEl = tblPr.getElementsByTagName("w:tblBorders")[0];
    if (tblBordersEl) {
      for (const bName of ["top", "left", "bottom", "right", "insideH", "insideV"]) {
        const bEl = tblBordersEl.getElementsByTagName(`w:${bName}`)[0];
        if (bEl) {
          const val = bEl.getAttribute("w:val") || "single";
          tableBorders[bName] = {
            val,
            sz: bEl.getAttribute("w:sz") ? parseInt(bEl.getAttribute("w:sz")!, 10) : 4,
            color: bEl.getAttribute("w:color") || "000000",
          };
        }
      }
    }

    const tblCellMarEl = tblPr.getElementsByTagName("w:tblCellMar")[0];
    if (tblCellMarEl) {
      const getMar = (side: string) => {
        const el = tblCellMarEl.getElementsByTagName(`w:${side}`)[0];
        const w = el?.getAttribute("w:w");
        return w ? parseInt(w, 10) : undefined;
      };
      tblCellMargins = {
        top: getMar("top"),
        bottom: getMar("bottom"),
        left: getMar("left"),
        right: getMar("right"),
      };
    }
  }

  // Rows — only direct tr children (avoid picking up nested table rows)
  const rows: DocxRow[] = [];
  const allTrEls = tblEl.getElementsByTagName("w:tr");
  for (let i = 0; i < allTrEls.length; i++) {
    const tr = allTrEls[i];
    if (tr.parentElement !== tblEl) continue; // skip nested table rows

    // Row-level properties: row height
    let rowHeight: number | undefined;
    const trPr = tr.getElementsByTagName("w:trPr")[0];
    if (trPr) {
      const trHeightEl = trPr.getElementsByTagName("w:trHeight")[0];
      if (trHeightEl) {
        const hVal = trHeightEl.getAttribute("w:val");
        if (hVal) rowHeight = parseInt(hVal, 10);
      }
    }

    const cells: DocxCell[] = [];
    const allTcEls = tr.getElementsByTagName("w:tc");
    for (let j = 0; j < allTcEls.length; j++) {
      const tc = allTcEls[j];
      if (tc.parentElement !== tr) continue; // skip nested table cells

      const tcPr = tc.getElementsByTagName("w:tcPr")[0];
      let colSpan: number | undefined;
      let vMerge: any;
      let bg: string | undefined;
      let vAlign: any;
      let cellWidth: number | undefined;
      const cellBorders: Record<string, any> = {};
      let tcMargins: DocxCellMargins | undefined;

      if (tcPr) {
        const gridSpan = tcPr.getElementsByTagName("w:gridSpan")[0];
        if (gridSpan) {
          const val = gridSpan.getAttribute("w:val");
          if (val) colSpan = parseInt(val, 10);
        }

        const vMergeEl = tcPr.getElementsByTagName("w:vMerge")[0];
        if (vMergeEl) {
          vMerge = vMergeEl.getAttribute("w:val") === "restart" ? "restart" : "continue";
        }

        const shd = tcPr.getElementsByTagName("w:shd")[0];
        if (shd) {
          const fill = shd.getAttribute("w:fill");
          if (fill && fill !== "auto" && fill !== "none") bg = `#${fill}`;
        }

        const vAlignEl = tcPr.getElementsByTagName("w:vAlign")[0];
        if (vAlignEl) vAlign = vAlignEl.getAttribute("w:val");

        // Cell width (w:tcW)
        const tcWEl = tcPr.getElementsByTagName("w:tcW")[0];
        if (tcWEl) {
          const wVal = tcWEl.getAttribute("w:w");
          if (wVal) cellWidth = parseInt(wVal, 10);
        }

        // Cell margins (w:tcMar)
        const tcMarEl = tcPr.getElementsByTagName("w:tcMar")[0];
        if (tcMarEl) {
          const getMar = (side: string) => {
            const el = tcMarEl.getElementsByTagName(`w:${side}`)[0];
            const w = el?.getAttribute("w:w");
            return w ? parseInt(w, 10) : undefined;
          };
          tcMargins = {
            top: getMar("top"),
            bottom: getMar("bottom"),
            left: getMar("left"),
            right: getMar("right"),
          };
        }

        // Cell-level borders
        const tcBordersEl = tcPr.getElementsByTagName("w:tcBorders")[0];
        if (tcBordersEl) {
          for (const side of ["top", "bottom", "left", "right"]) {
            const bEl = tcBordersEl.getElementsByTagName(`w:${side}`)[0];
            if (bEl) {
              cellBorders[side] = {
                val: bEl.getAttribute("w:val") || "single",
                sz: parseInt(bEl.getAttribute("w:sz") || "4", 10),
                color: bEl.getAttribute("w:color") || "000000",
              };
            }
          }
        }
      }

      // Cell content — process direct children in order (paragraphs + nested tables)
      const cellContent: (DocxParagraph | DocxTable)[] = [];
      const tcChildren = Array.from(tc.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE
      ) as Element[];
      for (const tcChild of tcChildren) {
        const tcTag = tcChild.localName || tcChild.nodeName.split(":").pop();
        if (tcTag === "p") cellContent.push(parseParagraph(tcChild, mediaMap, relationsMap));
        else if (tcTag === "tbl") cellContent.push(parseTable(tcChild, mediaMap, relationsMap));
      }

      cells.push({
        colSpan: colSpan && colSpan > 1 ? colSpan : undefined,
        vMerge,
        bg,
        vAlign,
        width: cellWidth,
        margins: tcMargins,
        borders: Object.keys(cellBorders).length > 0 ? (cellBorders as any) : undefined,
        content: cellContent,
        paragraphs: cellContent.filter((c) => c.type === "paragraph") as DocxParagraph[],
      });
    }
    rows.push({ cells, height: rowHeight });
  }

  return {
    type: "table",
    grid: gridCols.length > 0 ? gridCols : undefined,
    rows,
    alignment: tableAlignment,
    borders: Object.keys(tableBorders).length > 0 ? tableBorders : undefined,
    cellMargins: tblCellMargins,
  };
}
