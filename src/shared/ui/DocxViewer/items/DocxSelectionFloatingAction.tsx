import React, { useEffect, useState, useCallback, useRef } from "react";

export interface DocxSelectionColumn {
  id: string;
  name: string;
  key: string;
  type?: "text" | "number" | "date";
}

export interface DocxSelectionContext {
  isTable?: boolean;
  isHeaderRow?: boolean;
  fromHeaderHover?: boolean;
  tableName?: string;
  columns?: DocxSelectionColumn[];
  rawRowValues?: string[];
  isImage?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageName?: string;
}

export interface DocxSelectionFloatingActionProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onAction: (
    selectedText: string,
    selectionRect: DOMRect,
    context?: DocxSelectionContext
  ) => void;
  tooltip?: string;
  icon?: React.ReactNode;
  enabled?: boolean;
}

interface SelectionPosition {
  x: number;
  y: number;
  text: string;
  rect: DOMRect;
  context?: DocxSelectionContext;
}

/**
 * 4-point sparkle star + pencil dynamic field icon matching the reference design.
 */
export const DynamicSparklePencilIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 4-point star / sparkle at top-left */}
    <path
      d="M6.5 1.5c0 2.2-1.8 4-4 4 2.2 0 4 1.8 4 4 0-2.2 1.8-4 4-4-2.2 0-4-1.8-4-4z"
      fill="currentColor"
      stroke="none"
    />
    {/* Pencil angled down-left */}
    <path d="M19 4a2.121 2.121 0 0 1 3 3L11.5 17.5 7 19l1.5-4.5L19 4z" />
    <path d="M15 8l3 3" />
  </svg>
);

/**
 * Finds the main heading / title directly situated above a table.
 */
export function findMainHeaderAboveTable(tableEl: HTMLElement): string {
  const wrapper = tableEl.closest(".docx-table-wrapper") || tableEl;

  // 1. Look backwards among preceding sibling elements in the same container/page
  let prev = wrapper.previousElementSibling;
  while (prev) {
    const text = prev.textContent?.replace(/\s+/g, " ").trim();
    if (text && text.length > 0) {
      // Clean up common numbering prefixes like "1. ", "1.0 ", "A. ", "Section 1: "
      const cleaned = text
        .replace(/^[0-9]+(\.[0-9]+)*[.)\s-]+/, "")
        .replace(/^(Section|Clause|Item)\s+[0-9]+[:.\s-]*/i, "")
        .replace(/[:\s]+$/, "")
        .trim();
      return cleaned || text;
    }
    prev = prev.previousElementSibling;
  }

  // 2. If wrapper is at the top of a page sheet, look at previous page sheet's last paragraph
  const pageSheet = wrapper.closest(".docx-page-sheet");
  if (pageSheet && pageSheet.previousElementSibling) {
    const prevPage = pageSheet.previousElementSibling;
    const paras = prevPage.querySelectorAll(".docx-paragraph");
    if (paras.length > 0) {
      const lastPara = paras[paras.length - 1];
      const text = lastPara.textContent?.replace(/\s+/g, " ").trim();
      if (text && text.length > 0 && text.length < 120) {
        const cleaned = text
          .replace(/^[0-9]+(\.[0-9]+)*[.)\s-]+/, "")
          .replace(/^(Section|Clause|Item)\s+[0-9]+[:.\s-]*/i, "")
          .replace(/[:\s]+$/, "")
          .trim();
        return cleaned || text;
      }
    }
  }

  return "";
}

/**
 * Extracts table column headers from the first row of a table element.
 */
export function extractTableColumns(tableEl: HTMLElement): DocxSelectionColumn[] {
  const firstRow = tableEl.querySelector("tr");
  if (!firstRow) return [];
  const cells = Array.from(firstRow.querySelectorAll("td, th"));
  const rawColNames = cells
    .map((c) => c.textContent?.replace(/\s+/g, " ").trim())
    .filter((t): t is string => Boolean(t && t.length > 0));

  return rawColNames.map((name, idx) => {
    const lower = name.toLowerCase();
    const isNum =
      lower.includes("qty") ||
      lower.includes("quantity") ||
      lower.includes("amount") ||
      lower.includes("price") ||
      lower.includes("rate") ||
      lower.includes("total") ||
      lower.includes("cost") ||
      lower.includes("no") ||
      lower.includes("sr");
    const isDate = lower.includes("date");
    return {
      id: `col_${Date.now()}_${idx + 1}`,
      name,
      key:
        lower.replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "") ||
        `col_${idx + 1}`,
      type: isNum ? "number" : isDate ? "date" : "text",
    };
  });
}

/**
 * Extracts contextual metadata and fallback label for an embedded document image.
 */
export function getImageContext(img: HTMLImageElement): DocxSelectionContext {
  let imageName = "";
  // Check explicit drawing name or alt
  const drawingName = img.getAttribute("data-drawing-name");
  if (drawingName && !drawingName.includes("Embedded Document") && drawingName.length > 1) {
    imageName = drawingName.replace(/\.(png|jpe?g|svg|webp|gif)$/i, "").trim();
  } else if (img.alt && !img.alt.includes("Embedded Document") && img.alt.length > 1) {
    imageName = img.alt.replace(/\.(png|jpe?g|svg|webp|gif)$/i, "").trim();
  }

  // Look for preceding heading or caption paragraph
  if (!imageName) {
    const para = img.closest(".docx-paragraph") || img.parentElement;
    let prev = para?.previousElementSibling;
    while (prev && !imageName) {
      const t = prev.textContent?.replace(/\s+/g, " ").trim();
      if (t && t.length > 0 && t.length < 60) {
        imageName = t
          .replace(/^[0-9]+(\.[0-9]+)*[.)\s-]+/, "")
          .replace(/^(Section|Clause|Item)\s+[0-9]+[:.\s-]*/i, "")
          .replace(/[:\s]+$/, "")
          .trim();
        break;
      }
      prev = prev.previousElementSibling;
    }

    // Also check previous table cell if inside a table
    if (!imageName) {
      const td = img.closest("td, th");
      if (td) {
        const prevTd = td.previousElementSibling;
        const t = prevTd?.textContent?.replace(/\s+/g, " ").trim();
        if (t && t.length > 0 && t.length < 60) {
          imageName = t.replace(/[:\s]+$/, "").trim();
        }
      }
    }
  }

  if (!imageName) {
    imageName = "Company Logo";
  }

  return {
    isImage: true,
    imageSrc: img.src,
    imageAlt: img.alt || "",
    imageName,
  };
}

export const DocxSelectionFloatingAction: React.FC<DocxSelectionFloatingActionProps> = ({
  containerRef,
  scrollContainerRef,
  onAction,
  tooltip = "Add Dynamic Field",
  icon,
  enabled = true,
}) => {
  const [pos, setPos] = useState<SelectionPosition | null>(null);
  const [hoverPos, setHoverPos] = useState<SelectionPosition | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoveringButtonRef = useRef(false);

  // Updates position for active text selections
  const updatePosition = useCallback(() => {
    if (!enabled) {
      setPos(null);
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setPos(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setPos(null);
      return;
    }

    const container = containerRef.current;
    if (!container) {
      setPos(null);
      return;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode) {
      setPos(null);
      return;
    }

    // Ensure selection is inside the container
    if (!container.contains(anchorNode) && !container.contains(focusNode)) {
      setPos(null);
      return;
    }

    // Exclude toolbar or non-document areas
    const toolbar = container.querySelector(".docx-toolbar");
    if (toolbar && (toolbar.contains(anchorNode) || toolbar.contains(focusNode))) {
      setPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    if (rects.length === 0) {
      setPos(null);
      return;
    }

    const lastRect = rects[rects.length - 1];
    const containerRect = container.getBoundingClientRect();

    // Check if within visible bounds of the scroll container
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const scrollRect = scrollContainer.getBoundingClientRect();
      if (
        lastRect.bottom < scrollRect.top ||
        lastRect.top > scrollRect.bottom ||
        lastRect.right < scrollRect.left ||
        lastRect.left > scrollRect.right
      ) {
        setPos(null);
        return;
      }
    }

    // Inspect whether text selection is strictly inside a table header row
    let selectionContext: DocxSelectionContext | undefined = undefined;

    const common = range.commonAncestorContainer;
    const targetEl = common instanceof Element ? common : common.parentElement;
    const tableEl = targetEl?.closest("table");

    if (tableEl) {
      const allRows = Array.from(tableEl.querySelectorAll("tr"));
      const firstRow = allRows[0];
      const trEl = targetEl?.closest("tr");
      // Only considered header row if it is strictly the first row of table
      const isHeaderRow = trEl === firstRow;

      // Text with sentences, colons, or long text is NEVER a table header
      const isSentenceOrKeyValue = text.includes(":") || text.includes(". ") || text.length > 80;

      if (isHeaderRow && !isSentenceOrKeyValue) {
        const columns = extractTableColumns(tableEl);
        const tableName = findMainHeaderAboveTable(tableEl);

        if (columns.length >= 2) {
          selectionContext = {
            isTable: true,
            isHeaderRow: true,
            fromHeaderHover: false,
            tableName,
            columns,
          };
        }
      }
    }

    const buttonSize = 32;
    // Position at bottom of the selection, touching/slightly overlapping bottom edge
    const x = Math.max(
      8,
      Math.min(
        containerRect.width - buttonSize - 8,
        lastRect.right - containerRect.left - buttonSize / 2
      )
    );
    const y = Math.max(
      8,
      Math.min(
        containerRect.height - buttonSize - 8,
        lastRect.bottom - containerRect.top - 2
      )
    );

    setPos({
      x,
      y,
      text,
      rect: lastRect,
      context: selectionContext,
    });
  }, [enabled, containerRef, scrollContainerRef]);

  useEffect(() => {
    if (!enabled) {
      setPos(null);
      setHoverPos(null);
      return;
    }

    const handleMouseUp = () => {
      setTimeout(updatePosition, 10);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPos(null);
        setHoverPos(null);
      } else {
        setTimeout(updatePosition, 10);
      }
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPos(null);
      }
    };

    // Hover over table header row
    const handleMouseMove = (e: MouseEvent) => {
      // If user has actively selected text, text selection has precedence
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim()) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore if hovering directly over the floating action button
      if (buttonRef.current?.contains(target)) {
        if (hoverLeaveTimerRef.current) {
          clearTimeout(hoverLeaveTimerRef.current);
          hoverLeaveTimerRef.current = null;
        }
        return;
      }

      // Check if target is an image in the document
      const img = target.closest("img") as HTMLImageElement | null;
      if (img && !img.closest(".docx-page-watermark") && !img.closest(".docx-toolbar")) {
        if (hoverLeaveTimerRef.current) {
          clearTimeout(hoverLeaveTimerRef.current);
          hoverLeaveTimerRef.current = null;
        }

        const container = containerRef.current;
        if (!container) return;

        const imgRect = img.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Check if visible in scroll container
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
          const scrollRect = scrollContainer.getBoundingClientRect();
          if (
            imgRect.bottom < scrollRect.top ||
            imgRect.top > scrollRect.bottom ||
            imgRect.right < scrollRect.left ||
            imgRect.left > scrollRect.right
          ) {
            setHoverPos(null);
            return;
          }
        }

        const imgContext = getImageContext(img);
        const imageName = imgContext.imageName || "Company Logo";

        const buttonSize = 32;
        // Position at bottom right of the image
        const x = Math.max(
          8,
          Math.min(
            containerRect.width - buttonSize - 8,
            imgRect.right - containerRect.left - buttonSize - 4
          )
        );
        const y = Math.max(
          8,
          Math.min(
            containerRect.height - buttonSize - 8,
            imgRect.bottom - containerRect.top - 2
          )
        );

        setHoverPos({
          x,
          y,
          text: imageName,
          rect: imgRect,
          context: imgContext,
        });
        return;
      }

      const table = target.closest("table");
      if (!table) {
        if (!hoverLeaveTimerRef.current && hoverPos) {
          hoverLeaveTimerRef.current = setTimeout(() => {
            if (!isHoveringButtonRef.current) {
              setHoverPos(null);
            }
          }, 350);
        }
        return;
      }

      const tr = target.closest("tr");
      const allRows = Array.from(table.querySelectorAll("tr"));
      const isHeaderRow = tr && (tr === allRows[0] || allRows.indexOf(tr) === 0);

      if (!isHeaderRow || !tr) {
        if (!hoverLeaveTimerRef.current && hoverPos) {
          hoverLeaveTimerRef.current = setTimeout(() => {
            if (!isHoveringButtonRef.current) {
              setHoverPos(null);
            }
          }, 350);
        }
        return;
      }

      // Cursor is over the table header row!
      if (hoverLeaveTimerRef.current) {
        clearTimeout(hoverLeaveTimerRef.current);
        hoverLeaveTimerRef.current = null;
      }

      const container = containerRef.current;
      if (!container) return;

      const trRect = tr.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if visible in scroll container
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        const scrollRect = scrollContainer.getBoundingClientRect();
        if (
          trRect.bottom < scrollRect.top ||
          trRect.top > scrollRect.bottom ||
          trRect.right < scrollRect.left ||
          trRect.left > scrollRect.right
        ) {
          setHoverPos(null);
          return;
        }
      }

      const columns = extractTableColumns(table);
      const tableName = findMainHeaderAboveTable(table);

      const buttonSize = 32;
      // Position at bottom of the header row, horizontally aligned with cursor
      const x = Math.max(
        8,
        Math.min(
          containerRect.width - buttonSize - 8,
          Math.max(
            trRect.left - containerRect.left + 8,
            Math.min(
              trRect.right - containerRect.left - buttonSize - 8,
              e.clientX - containerRect.left - buttonSize / 2
            )
          )
        )
      );
      const y = Math.max(
        8,
        Math.min(
          containerRect.height - buttonSize - 8,
          trRect.bottom - containerRect.top - 2
        )
      );

      setHoverPos({
        x,
        y,
        text: columns.map((c) => c.name).join(" | "),
        rect: trRect,
        context: {
          isTable: true,
          isHeaderRow: true,
          fromHeaderHover: true,
          tableName,
          columns,
        },
      });
    };

    const handleMouseLeave = () => {
      hoverLeaveTimerRef.current = setTimeout(() => {
        if (!isHoveringButtonRef.current) {
          setHoverPos(null);
        }
      }, 350);
    };

    // Click listener on document images to directly open Dynamic Fields modal
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do not intercept clicks on the action button itself or toolbar
      if (buttonRef.current?.contains(target) || target.closest(".docx-toolbar")) {
        return;
      }

      // Check if clicked an embedded document image
      const img = target.closest("img") as HTMLImageElement | null;
      if (img && !img.closest(".docx-page-watermark") && !img.closest(".docx-toolbar")) {
        e.preventDefault();
        e.stopPropagation();
        const imgContext = getImageContext(img);
        const imgRect = img.getBoundingClientRect();
        onAction(imgContext.imageName || "Company Logo", imgRect, imgContext);
        setPos(null);
        setHoverPos(null);
      }
    };

    const scrollEl = scrollContainerRef.current;
    const handleScroll = () => {
      requestAnimationFrame(() => {
        updatePosition();
        setHoverPos(null);
      });
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener("mouseup", handleMouseUp);
      containerEl.addEventListener("keyup", handleKeyUp);
      containerEl.addEventListener("mousemove", handleMouseMove);
      containerEl.addEventListener("mouseleave", handleMouseLeave);
      containerEl.addEventListener("click", handleClick);
    }
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    }
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      if (containerEl) {
        containerEl.removeEventListener("mouseup", handleMouseUp);
        containerEl.removeEventListener("keyup", handleKeyUp);
        containerEl.removeEventListener("mousemove", handleMouseMove);
        containerEl.removeEventListener("mouseleave", handleMouseLeave);
        containerEl.removeEventListener("click", handleClick);
      }
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (hoverLeaveTimerRef.current) {
        clearTimeout(hoverLeaveTimerRef.current);
      }
    };
  }, [enabled, updatePosition, containerRef, scrollContainerRef, hoverPos, onAction]);

  const activePos = pos || hoverPos;

  if (!activePos || !enabled) return null;

  const activeTooltip = activePos.context?.isTable
    ? "Add / Edit Dynamic Table"
    : activePos.context?.isImage
    ? "Add / Edit Dynamic Image"
    : tooltip;

  return (
    <div
      className="absolute z-50 pointer-events-auto select-none transition-opacity duration-150"
      style={{
        left: `${activePos.x}px`,
        top: `${activePos.y}px`,
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onMouseDown={(e) => {
          // Prevent browser from dropping selection before click fires
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAction(activePos.text, activePos.rect, activePos.context);
          setPos(null);
          setHoverPos(null);
        }}
        onMouseEnter={() => {
          isHoveringButtonRef.current = true;
          setShowTooltip(true);
          if (hoverLeaveTimerRef.current) {
            clearTimeout(hoverLeaveTimerRef.current);
            hoverLeaveTimerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          isHoveringButtonRef.current = false;
          setShowTooltip(false);
          if (hoverPos && !pos) {
            hoverLeaveTimerRef.current = setTimeout(() => {
              setHoverPos(null);
            }, 350);
          }
        }}
        title={activeTooltip}
        aria-label={activeTooltip}
        className="group relative flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-md hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-hidden"
      >
        {icon ?? <DynamicSparklePencilIcon className="w-4 h-4" />}

        {/* Floating Tooltip */}
        {showTooltip && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-medium tracking-wide whitespace-nowrap shadow-md pointer-events-none z-50">
            {activeTooltip}
          </div>
        )}
      </button>
    </div>
  );
};
