import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { createDataTableStore } from "./useDataTableStore";
import type { DataTableProps, ColumnDef } from "../types/dataTable.types";
import { calculateColumnMinWidth } from "../utils/dataTable.utils";

/**
 * useDataTable Hook
 * Centralizes the logic for sorting, filtering, pagination, selection, and column management.
 * Optimized for performance using Zustand and memoized selectors.
 */
export function useDataTable<T>(props: DataTableProps<T>) {
  const {
    data,
    columns: columnDefs,
    getRowId = (row: T) =>
      ((row as Record<string, unknown>).id as string) ||
      ((row as Record<string, unknown>)._id as string),
    enableSearch = true,
  } = props;

  // Initialize store only once per component instance
  const storeRef = useRef<ReturnType<typeof createDataTableStore<T>> | null>(
    null,
  );
  if (!storeRef.current) {
    storeRef.current = createDataTableStore<T>(columnDefs, props.layout, props.autoSize);
  }
  const useStore = storeRef.current;

  // Selectors for specific state slices to minimize re-renders
  // useShallow is critical here because we're returning a new object from the selector
  const state = useStore(
    useShallow((s) => ({
      sorting: s.sorting,
      pagination: s.pagination,
      globalSearch: s.globalSearch,
      selection: s.selection,
      columns: s.columns,
      layout: s.layout,
      cardOrientation: s.cardOrientation,
    })),
  );

  const actions = useStore(
    useShallow((s) => ({
      toggleSort: s.toggleSort,
      setColumnPinning: s.setColumnPinning,
      setColumnSizing: s.setColumnSizing,
      setColumnVisibility: s.setColumnVisibility,
      toggleSelection: s.toggleSelection,
      toggleAllSelection: s.toggleAllSelection,
      setSelection: s.setSelection,
      setPagination: s.setPagination,
      setGlobalSearch: s.setGlobalSearch,
      setLayout: s.setLayout,
      setCardOrientation: s.setCardOrientation,
      reset: s.reset,
    })),
  );
 
  // Sync external selection prop to internal store
  useEffect(() => {
    if (props.selection) {
      actions.setSelection(new Set(props.selection));
    }
  }, [props.selection, actions]);

  // Sync external layout prop to internal store
  useEffect(() => {
    if (props.layout !== undefined && props.layout !== null) {
      actions.setLayout(props.layout);
    }
  }, [props.layout, actions]);

  // Notify parent of global search changes
  useEffect(() => {
    if (props.onGlobalSearchChange) {
      props.onGlobalSearchChange(state.globalSearch);
    }
  }, [state.globalSearch, props.onGlobalSearchChange]);

  /* =========================================================
     🔹 DERIVED STATE: FILTERING (Memoized)
  ========================================================= */

  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Global Search
    if (state.globalSearch && enableSearch) {
      const search = state.globalSearch.toLowerCase();
      result = result.filter((row) =>
        Object.values(row as Record<string, unknown>).some((val) =>
          String(val).toLowerCase().includes(search),
        ),
      );
    }

    return result;
  }, [data, state.globalSearch, enableSearch]);

  /* =========================================================
     🔹 DERIVED STATE: SORTING
  ========================================================= */

  const sortedData = useMemo(() => {
    if (state.sorting.length === 0) return filteredData;

    const sorted = [...filteredData];
    const { id, desc } = state.sorting[0];
    const col = columnDefs.find((c) => c.id === id);

    if (!col || !("key" in col)) return sorted;

    const key = col.key;

    return sorted.sort((a, b) => {
      const aVal = (a as any)[key];
      const bVal = (b as any)[key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined || aVal === "") return 1;
      if (bVal === null || bVal === undefined || bVal === "") return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return desc ? bVal - aVal : aVal - bVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      const comp = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: "base" });
      return desc ? -comp : comp;
    });
  }, [filteredData, state.sorting, columnDefs]);

  /* =========================================================
     🔹 DERIVED STATE: PAGINATION
  ========================================================= */

  const paginatedData = useMemo(() => {
    if (props.manualPagination) {
      return data;
    }
    const start = state.pagination.pageIndex * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    return sortedData.slice(start, end);
  }, [data, sortedData, state.pagination, props.manualPagination]);

  /* =========================================================
     🔹 EFFECT: SYNC PROPS TO STORE
  ========================================================= */

  useEffect(() => {
    if (props.manualPagination || props.pagination) {
      const pageIndex = props.pagination 
        ? props.pagination.page - 1 
        : props.pageIndex;
      const pageSize = props.pagination
        ? props.pagination.limit
        : props.pageSize;

      if (
        pageIndex !== undefined &&
        pageIndex !== state.pagination.pageIndex
      ) {
        actions.setPagination({ pageIndex });
      }
      if (
        pageSize !== undefined &&
        pageSize !== state.pagination.pageSize
      ) {
        actions.setPagination({ pageSize });
      }
    }
  }, [
    props.manualPagination,
    props.pagination,
    props.pageIndex,
    props.pageSize,
    state.pagination.pageIndex,
    state.pagination.pageSize,
    actions,
  ]);

  /* =========================================================
     🔹 DERIVED STATE: COLUMNS
  ========================================================= */

  /* =========================================================
     🔹 SELECTION SYNC & HANDLERS
  ========================================================= */

  const handleToggleAllSelection = useCallback(() => {
    const allIds = paginatedData.map(getRowId);
    actions.toggleAllSelection(allIds);
  }, [paginatedData, getRowId, actions]);

  const handleToggleSelection = useCallback(
    (row: T) => {
      actions.toggleSelection(getRowId(row));
    },
    [getRowId, actions],
  );

  /* =========================================================
     🔹 DERIVED STATE: COLUMNS
  ========================================================= */

  const visibleColumns = useMemo(() => {
    const filtered = columnDefs.filter(
      (col) => state.columns.visibility[col.id] !== false,
    );

    if (props.selectable) {
      const hasSelectCol = filtered.some(
        (col) => col.id === "select" || col.id === "selection",
      );

      if (!hasSelectCol) {
        const selectCol: ColumnDef<T> = {
          id: "select",
          label: "",
          width: 48,
          minWidth: 48,
          maxWidth: 48,
          align: "center",
          headerAlign: "center",
          resizable: false,
          sortable: false,
          pinnable: false,
          headerRender: () => {
            const allSelected =
              paginatedData.length > 0 &&
              paginatedData.every((row) => state.selection.has(getRowId(row)));
            const someSelected =
              paginatedData.some((row) => state.selection.has(getRowId(row))) &&
              !allSelected;
            return React.createElement("input", {
              type: "checkbox",
              checked: allSelected,
              ref: (el: HTMLInputElement | null) => {
                if (el) el.indeterminate = someSelected;
              },
              onChange: handleToggleAllSelection,
              className:
                "w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600",
            });
          },
          render: (row: T) => {
            const isSelected = state.selection.has(getRowId(row));
            return React.createElement("input", {
              type: "checkbox",
              checked: isSelected,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.stopPropagation();
                handleToggleSelection(row);
              },
              className:
                "w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600",
            });
          },
        };
        return [selectCol, ...filtered];
      }
    }
    return filtered;
  }, [
    columnDefs,
    state.columns.visibility,
    props.selectable,
    paginatedData,
    state.selection,
    getRowId,
    handleToggleAllSelection,
    handleToggleSelection,
  ]);

  // Notify parent of selection changes
  const selectionArray = useMemo(
    () => Array.from(state.selection),
    [state.selection],
  );
  const prevSelectionRef = useRef<string>("");

  useEffect(() => {
    const currentSelectionStr = JSON.stringify(selectionArray);
    if (
      props.onSelectionChange &&
      currentSelectionStr !== prevSelectionRef.current
    ) {
      props.onSelectionChange(selectionArray);
      prevSelectionRef.current = currentSelectionStr;
    }
  }, [selectionArray, props.onSelectionChange]);

  // Notify parent of sorting changes
  useEffect(() => {
    if (props.onSortingChange) {
      props.onSortingChange(state.sorting);
    }
  }, [state.sorting, props.onSortingChange]);

  // Derived state: Column Widths
  const columnWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    for (const col of visibleColumns) {
      if (state.columns.sizing[col.id] !== undefined) {
        widths[col.id] = state.columns.sizing[col.id];
      } else if (col.width !== undefined) {
        widths[col.id] = col.width;
      } else {
        widths[col.id] = calculateColumnMinWidth(col, data);
      }
    }
    return widths;
  }, [visibleColumns, data, state.columns.sizing]);

  return {
    state,
    paginatedData,
    sortedData, // Export sortedData for virtualization if needed
    visibleColumns,
    columnWidths,
    totalCount: (props.manualPagination || props.pagination)
      ? (props.pagination?.total ?? props.totalCount ?? 0)
      : sortedData.length,
    actions: {
      ...actions,
      toggleSelection: handleToggleSelection,
      toggleAllSelection: handleToggleAllSelection,
      setPageIndex: (index: number) => {
        actions.setPagination({ pageIndex: index });
        if (props.pagination?.onPageChange) {
          props.pagination.onPageChange(index + 1);
        } else if (props.onPageChange) {
          props.onPageChange(index);
        }
      },
      setPageSize: (size: number) => {
        actions.setPagination({ pageSize: size, pageIndex: 0 });
        if (props.pagination?.onLimitChange) {
          props.pagination.onLimitChange(size);
        } else if (props.onPageSizeChange) {
          props.onPageSizeChange(size);
        }
      },
    },
  };
}
