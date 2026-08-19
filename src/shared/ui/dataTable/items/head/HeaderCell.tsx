import { useRef, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, Filter } from "lucide-react";
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
  flip,
  shift,
  FloatingPortal,
} from "@floating-ui/react";
import type {
  ColumnDef,
  PinDirection,
  ColumnSort,
} from "../../types/dataTable.types";
import { ColumnMenu } from "./ColumnMenu";
import { dataTableStyles as styles } from "../../styles/dataTable.styles";
import { calculateColumnMinWidth, calculateColumnContentWidth } from "../../utils/dataTable.utils";

interface HeaderCellProps<T> {
  column: ColumnDef<T>;
  width?: number;
  isLast: boolean;
  isSecondToLast?: boolean;
  isSorted?: ColumnSort<T>;
  pinDirection: PinDirection;
  isMenuOpen: boolean;
  leftOffset?: number;
  rightOffset?: number;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onSort: (id: string, desc?: boolean | null) => void;
  onPin: (id: string, direction: PinDirection) => void;
  onResize: (id: string, width: number) => void;
  data: T[];
}

export const HeaderCell = <T,>({
  column,
  width,
  isLast,
  isSecondToLast,
  isSorted,
  pinDirection,
  isMenuOpen,
  leftOffset,
  rightOffset,
  onToggleMenu,
  onCloseMenu,
  onSort,
  onPin,
  onResize,
  data,
}: HeaderCellProps<T>) => {
  const resizeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const minWidth = useMemo(() => {
    return calculateColumnMinWidth(column, data);
  }, [column, data]);

  const contentWidth = useMemo(() => {
    return calculateColumnContentWidth(column, data);
  }, [column, data]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const cellElem = resizeRef.current.parentElement;
      if (!cellElem) return;

      const containerElem = cellElem.closest(".isolate") || cellElem.closest("table") || document.body;
      const containerWidth = containerElem.getBoundingClientRect().width;
      const max30PercentWidth = Math.floor(containerWidth * 0.30);
      const effectiveMaxWidth = column.maxWidth ?? max30PercentWidth;

      let newWidth = Math.max(
        minWidth,
        e.clientX - cellElem.getBoundingClientRect().left,
      );

      if (newWidth > effectiveMaxWidth) {
        newWidth = effectiveMaxWidth;
      }

      onResize(column.id, newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const onMouseDown = () => {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const resizer = resizeRef.current;
    if (resizer) resizer.addEventListener("mousedown", onMouseDown);
    return () => {
      if (resizer) resizer.removeEventListener("mousedown", onMouseDown);
    };
  }, [column.id, column.maxWidth, onResize, minWidth]);

  const { refs, floatingStyles } = useFloating({
    open: isMenuOpen,
    onOpenChange: (open) => {
      if (!open) onCloseMenu();
    },
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(4),
      flip({ fallbackPlacements: ["bottom-start", "top-end", "top-start"] }),
      shift({ padding: 10 }),
    ],
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      // Ignore clicks inside the floating menu
      if (refs.floating.current && refs.floating.current.contains(target)) {
        return;
      }

      // Ignore clicks on the reference element (filter button)
      if (
        refs.domReference.current &&
        (refs.domReference.current as HTMLElement).contains(target)
      ) {
        return;
      }

      // Ignore clicks inside portals (like DatePicker)
      // Elements in portals are usually rendered outside the main app root
      const root = document.getElementById("root");
      if (root && !root.contains(target)) {
        // If it's not in root, it's likely a portal
        return;
      }

      // Also check if the target has an ancestor with a portal attribute
      // Floating UI adds 'data-floating-ui-portal' to its portal containers
      if ((target as HTMLElement).closest('[data-floating-ui-portal]')) {
        return;
      }

      onCloseMenu();
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onCloseMenu, refs.floating]);

  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => {
        const inputElem = refs.floating.current?.querySelector<HTMLInputElement | HTMLSelectElement>(
          "input, select, textarea"
        );
        if (inputElem) {
          inputElem.focus({ preventScroll: true });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMenuOpen, refs.floating]);



  const isPinned = !!pinDirection;

  const hasMenu = useMemo(() => {
    const isSortable = "sortable" in column ? column.sortable !== false : false;
    const isPinnable = column.pinnable !== false;
    const isResizable = column.resizable !== false;
    const hasFilter =
      "filterSectionRender" in column && !!column.filterSectionRender;

    return (
      isSortable || isPinnable || isResizable || hasFilter || !!column.isFilter
    );
  }, [column]);

  const headerAlign = column.headerAlign || column.align || "left";

  return (
    <th
      className={styles.headerCell(
        isPinned,
        isMenuOpen,
        isLast,
        headerAlign,
        isSecondToLast,
      )}
      style={{
        width: `${width || minWidth}px`,
        minWidth: `${width || minWidth}px`,
        maxWidth: column.maxWidth ? `${column.maxWidth}px` : "30%",
        left: leftOffset !== undefined ? `${leftOffset}px` : undefined,
        right: rightOffset !== undefined ? `${rightOffset}px` : undefined,
      }}
    >
      <div
        className={`${styles.headerLabelContainer(headerAlign)} ${hasMenu || ("sortable" in column && column.sortable !== false) ? "cursor-pointer" : "cursor-default"} select-none`}
        onClick={() => {
          if ("sortable" in column && column.sortable !== false) {
            onSort(column.id);
          }
        }}
      >
        {column.headerRender ? (
          column.headerRender()
        ) : (
          <span className={styles.headerLabel}>{column.label}</span>
        )}
        {isSorted &&
          (isSorted.desc ? (
            <ChevronDown size={14} className="text-blue-500" />
          ) : (
            <ChevronUp size={14} className="text-blue-500" />
          ))}
      </div>

      {column.isFilter && hasMenu && (
        <button
          ref={refs.setReference}
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu();
          }}
          className={`
            flex items-center justify-center p-1.5 rounded-md transition-all duration-200 border-none cursor-pointer
            ${isMenuOpen ? "bg-blue-50 text-blue-500 shadow-sm" : "bg-transparent text-slate-400 hover:bg-slate-100"}
          `}
        >
          <Filter size={14} fill={isMenuOpen ? "currentColor" : "none"} />
        </button>
      )}

      {column.resizable !== false && (
        <div
          ref={resizeRef}
          className={styles.resizer}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onResize(column.id, contentWidth);
          }}
          title="Double-click to auto set proper column width for data"
        />
      )}

      {isMenuOpen && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles}>
            <ColumnMenu
              column={column}
              isSorted={isSorted}
              pinDirection={pinDirection}
              onSort={onSort}
              onPin={onPin}
              onResize={onResize}
              onClose={onCloseMenu}
              minWidth={contentWidth}
            />
          </div>
        </FloatingPortal>
      )}
    </th>
  );
};
