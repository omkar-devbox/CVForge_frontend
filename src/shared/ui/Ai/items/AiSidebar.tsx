import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { motion } from "framer-motion";
import { AiChat } from "./AiChat";
import { aiSidebarStyles } from "../styles/aiSidebar.styles";
import type { AiSidebarProps } from "../types";
import { local } from "@/shared/lib/Storage/localstorage";

export const AiSidebar = ({
  isOpen,
  onClose,
  resizable = true,
  side = "right",
  defaultWidth = 400,
  minWidth = 320,
  maxWidth = 700,
  storageKey = "cvforge_ai_sidebar_width",
  styleConfig,
}: AiSidebarProps) => {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = local.get<number>(storageKey);
      if (saved !== null && saved >= minWidth && saved <= maxWidth) {
        return saved;
      }
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setWidth(newWidth);
      if (typeof window !== "undefined" && storageKey) {
        local.set(storageKey, newWidth);
      }
    },
    [storageKey],
  );

  const startResizing = useCallback(
    (e: ReactMouseEvent | ReactTouchEvent) => {
      e.preventDefault();
      setIsResizing(true);
    },
    [],
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !resizable) return;

      const clientX =
        "touches" in e && e.touches.length > 0
          ? e.touches[0].clientX
          : (e as MouseEvent).clientX;

      let newWidth =
        side === "left" ? clientX : window.innerWidth - clientX;

      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;

      handleWidthChange(newWidth);
    },
    [isResizing, resizable, side, minWidth, maxWidth, handleWidthChange],
  );

  const handleResetWidth = useCallback(() => {
    handleWidthChange(defaultWidth);
  }, [defaultWidth, handleWidthChange]);

  const handleKeyDownResize = (e: React.KeyboardEvent) => {
    if (!resizable || !isOpen) return;
    let delta = 0;
    if (e.key === "ArrowLeft") delta = side === "left" ? -10 : 10;
    if (e.key === "ArrowRight") delta = side === "left" ? 10 : -10;

    if (delta !== 0) {
      e.preventDefault();
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, width + delta),
      );
      handleWidthChange(newWidth);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleWidthChange(minWidth);
    } else if (e.key === "End") {
      e.preventDefault();
      handleWidthChange(maxWidth);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleResetWidth();
    }
  };

  // User selection & cursor locking during drag
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  // Global mouse & touch listeners
  useEffect(() => {
    if (!isResizing || !resizable) return;

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener("touchmove", resize);
    window.addEventListener("touchend", stopResizing);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("touchmove", resize);
      window.removeEventListener("touchend", stopResizing);
    };
  }, [isResizing, resize, stopResizing, resizable]);

  // Escape key press to close sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const sidebarStyle = useMemo(
    () => ({
      backgroundColor: styleConfig?.sidebar?.bg,
      borderColor: styleConfig?.sidebar?.border,
    }),
    [styleConfig],
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-[#000000] bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{
          width: isOpen ? width : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={
          isResizing
            ? { duration: 0 }
            : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
        }
        className={aiSidebarStyles.aside(isResizing, side)}
        style={sidebarStyle}
      >
        <div
          style={{ width: `${width}px` }}
          className="flex h-full flex-col relative overflow-hidden shrink-0"
        >
          {/* Resizable handle */}
          {resizable && isOpen && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize AI sidebar width"
              aria-valuenow={width}
              aria-valuemin={minWidth}
              aria-valuemax={maxWidth}
              tabIndex={0}
              onMouseDown={startResizing}
              onTouchStart={startResizing}
              onDoubleClick={handleResetWidth}
              onKeyDown={handleKeyDownResize}
              className={aiSidebarStyles.resizeHandle(isResizing, side)}
              title="Drag or use arrow keys to resize AI sidebar. Double-click to reset."
            >
              <div className={aiSidebarStyles.resizeIndicator(isResizing, side)} />
            </div>
          )}

          {/* Chat Interface Content */}
          {isOpen && (
            <AiChat
              onClose={onClose}
              showCloseButton
              title="AI Co-pilot"
              subtitle="Enhanced v2.0"
              styleConfig={styleConfig}
            />
          )}
        </div>
      </motion.aside>
    </>
  );
};
