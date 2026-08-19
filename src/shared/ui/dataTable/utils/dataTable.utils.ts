import type { ColumnDef } from "../types/dataTable.types";

/**
 * Calculates the sticky column offset.
 *
 * - left  → width of all columns before current column
 * - right → width of all columns after current column
 */
export const calculateOffset = (
  cols: ColumnDef<any>[],
  index: number,
  direction: "left" | "right",
  sizing: Record<string, number>,
): number => {
  if (direction === "left") {
    return cols
      .slice(0, index)
      .reduce(
        (acc, col) =>
          acc + (sizing[col.id] || col.width || 150),
        0,
      );
  }

  return cols
    .slice(index + 1)
    .reduce(
      (acc, col) =>
        acc + (sizing[col.id] || col.width || 150),
      0,
    );
};

/**
 * Calculates the initial minimum width for a column.
 *
 * Priority:
 * 1. Explicit column.width
 * 2. Automatically calculated content width
 */
export const calculateColumnMinWidth = <T,>(
  column: ColumnDef<T>,
  data: T[],
): number => {
  if (column.id === "select" || column.id === "selection") {
    return column.width || 48;
  }
  if (
    column.width !== undefined &&
    column.width > 0
  ) {
    return column.width;
  }

  return calculateColumnContentWidth(column, data);
};

/**
 * Dynamically calculates the optimal content-fit width
 * for any column.
 *
 * Width is calculated using:
 * 1. Header label width
 * 2. Maximum content width from sample rows
 * 3. 10% extra padding
 * 4. Minimum width
 * 5. Maximum width
 */
export const calculateColumnContentWidth = <T,>(
  column: ColumnDef<T>,
  data: T[],
): number => {
  if (column.id === "select" || column.id === "selection") {
    return column.width || 48;
  }
  // --------------------------------------------------
  // Canvas setup
  // --------------------------------------------------

  const canvas =
    typeof document !== "undefined"
      ? document.createElement("canvas")
      : null;

  const context = canvas?.getContext("2d");

  // --------------------------------------------------
  // 1. Measure Header Label Width
  // --------------------------------------------------

  let labelWidth = 60;

  if (context && column.label) {
    context.font =
      "700 11px Inter, system-ui, sans-serif";

    labelWidth = Math.ceil(
      context.measureText(column.label).width + 56,
    );
  }

  // --------------------------------------------------
  // 2. Measure Row Content Width
  // --------------------------------------------------

  let maxCellWidth = 0;

  if (
    context &&
    Array.isArray(data) &&
    data.length > 0
  ) {
    context.font =
      "500 13px Inter, system-ui, sans-serif";

    // Check maximum 50 rows for performance
    const sampleRows = data.slice(0, 50);

    sampleRows.forEach((row: any) => {
      let textVal = "";

      // ------------------------------------------------
      // Get value using column.key
      // ------------------------------------------------

      if (
        "key" in column &&
        column.key &&
        row[column.key] !== undefined &&
        row[column.key] !== null
      ) {
        const val = row[column.key];

        if (
          typeof val === "object" &&
          val !== null
        ) {
          textVal =
            val.name ||
            val.title ||
            val.label ||
            val.value ||
            "";
        } else {
          textVal = String(val);
        }
      }

      // ------------------------------------------------
      // Fallback: Get value using column.id
      // ------------------------------------------------

      if (
        !textVal &&
        row &&
        column.id &&
        row[column.id] !== undefined &&
        row[column.id] !== null
      ) {
        const val = row[column.id];

        if (
          typeof val === "object" &&
          val !== null
        ) {
          textVal =
            val.name ||
            val.title ||
            val.label ||
            val.value ||
            "";
        } else {
          textVal = String(val);
        }
      }

      // ------------------------------------------------
      // Calculate Cell Width
      // ------------------------------------------------

      let cellWidth = 0;

      if (textVal) {
        const measuredWidth = Math.ceil(
          context.measureText(textVal).width + 36,
        );

        // Maximum content width = 450px
        cellWidth = Math.min(
          measuredWidth,
          450,
        );
      } else if (
        column.id === "select" ||
        column.id === "selection"
      ) {
        cellWidth = 48;
      } else {
        cellWidth =
          column.width ??
          column.minWidth ??
          90;
      }

      // Store largest cell width
      if (cellWidth > maxCellWidth) {
        maxCellWidth = cellWidth;
      }
    });
  }

  // --------------------------------------------------
  // 3. Compare Header Width vs Content Width
  // --------------------------------------------------

  const maxContentWidth = Math.max(
    labelWidth,
    maxCellWidth,
  );

  // --------------------------------------------------
  // 4. Add 10% Extra Padding
  // --------------------------------------------------

  let calculated = Math.ceil(
    maxContentWidth * 1.10,
  );

  // --------------------------------------------------
  // 5. Apply Minimum Width
  // --------------------------------------------------

  const baseMin = column.minWidth ?? 60;

  calculated = Math.max(
    baseMin,
    calculated,
  );

  // --------------------------------------------------
  // 6. Calculate Default Maximum Width
  // --------------------------------------------------

  const defaultMax =
    typeof window !== "undefined" &&
      window.innerWidth
      ? Math.floor(window.innerWidth * 0.30)
      : 380;

  // --------------------------------------------------
  // 7. Apply Maximum Width
  // --------------------------------------------------

  const maxAllowed =
    column.maxWidth ?? defaultMax;

  calculated = Math.min(
    calculated,
    maxAllowed,
  );

  // --------------------------------------------------
  // 8. Return Final Width
  // --------------------------------------------------

  return calculated;
};