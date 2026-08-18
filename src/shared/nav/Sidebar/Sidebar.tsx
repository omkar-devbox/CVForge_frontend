import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type FC,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  memo,
} from "react";
import { useLocation } from "react-router-dom";
import { SidebarHeader } from "./items/SidebarHeader";
import { SidebarFooter } from "./items/SidebarFooter";
import { SidebarNav } from "./items/SidebarNav";
import {
  asideStyles,
  backdropStyles,
  resizeStyles,
} from "./styles/sidebar.styles";
import type { SidebarMainProps, MenuSection } from "./types/types";
import { SIDEBAR_CONFIG, SIDEBAR_MENU } from "@/app/menu/menuItems";
import { local } from "@/shared/lib/Storage/localstorage";

// Default Sidebar Configuration
export const DEFAULT_SIDEBAR_MENU: MenuSection[] = SIDEBAR_MENU;

export const DEFAULT_SIDEBAR_CONFIG = SIDEBAR_CONFIG;

export const Sidebar: FC<SidebarMainProps> = memo(({
  collapsed,
  setCollapsed,
  logo = DEFAULT_SIDEBAR_CONFIG.logo,
  companyName = DEFAULT_SIDEBAR_CONFIG.companyName,
  user,
  isMobileOpen = false,
  resizable = true,
  defaultWidth = 256,
  minWidth = 200,
  maxWidth = 480,
  storageKey = "system_mechatronics_sidebar_width",
  onWidthChange,
  menu = DEFAULT_SIDEBAR_CONFIG.menu,
  side = "left",
  onLogout,
  onCloseMobile,
}) => {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const saved = local.get<number>(storageKey);
      if (saved !== null && saved >= minWidth && saved <= maxWidth) {
        return saved;
      }
    }
    return defaultWidth;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Safe fallback for location if used outside Router context
  let locationPathname = "/dashboard";
  try {
    const loc = useLocation();
    locationPathname = loc.pathname;
  } catch {
    // Router context missing in static preview
  }

  const touchStartX = useRef<number | null>(null);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setSidebarWidth(newWidth);
      if (typeof window !== "undefined" && storageKey) {
        local.set(storageKey, newWidth);
      }
      onWidthChange?.(newWidth);
    },
    [storageKey, onWidthChange],
  );

  const handleMobileClose = useCallback(() => {
    if (onCloseMobile) {
      onCloseMobile();
    } else {
      setCollapsed(false);
    }
  }, [onCloseMobile, setCollapsed]);

  // Lock body scroll when mobile sidebar drawer is active
  useEffect(() => {
    if (!isMobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobileOpen) {
      handleMobileClose();
    }
  }, [locationPathname]);

  // Close mobile sidebar on Escape key press
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleMobileClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, handleMobileClose]);

  // Touch Swipe to close drawer gesture on mobile
  const handleTouchStart = (e: ReactTouchEvent) => {
    if (!isMobileOpen) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: ReactTouchEvent) => {
    if (!isMobileOpen || touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    // Swipe left (or right for right-sided sidebar) to close drawer
    if (side === "left" && deltaX < -50) {
      handleMobileClose();
    } else if (side === "right" && deltaX > 50) {
      handleMobileClose();
    }
    touchStartX.current = null;
  };

  // Resize Mouse & Touch Handlers
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
    if (!resizable || collapsed) return;
    let delta = 0;
    if (e.key === "ArrowLeft") delta = side === "left" ? -10 : 10;
    if (e.key === "ArrowRight") delta = side === "left" ? 10 : -10;

    if (delta !== 0) {
      e.preventDefault();
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, sidebarWidth + delta),
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

  // Global userSelect & cursor override while dragging
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

  useEffect(() => {
    if (!resizable) return;

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
  }, [resize, stopResizing, resizable]);

  // Filtered Menu Computation
  const filteredMenu = useMemo(() => {
    return menu.filter((section: MenuSection) => section.items.length > 0);
  }, [menu]);

  // On mobile drawer, sidebar must always render fully expanded (never icon-only collapsed)
  const isEffectiveCollapsed = isMobileOpen ? false : collapsed;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className={backdropStyles}
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={asideStyles(
          collapsed,
          resizable,
          isResizing,
          isMobileOpen,
          side,
        )}
        style={
          resizable && !collapsed && !isMobileOpen
            ? { width: `${sidebarWidth}px` }
            : undefined
        }
      >
        <SidebarHeader
          collapsed={isEffectiveCollapsed}
          isHeaderHovered={isHeaderHovered}
          setIsHeaderHovered={setIsHeaderHovered}
          onToggle={() => setCollapsed(!collapsed)}
          logo={logo}
          companyName={companyName}
          side={side}
          isMobileOpen={isMobileOpen}
          onCloseMobile={handleMobileClose}
        />

        <SidebarNav
          menu={filteredMenu}
          collapsed={isEffectiveCollapsed}
          onExpand={() => setCollapsed(false)}
          side={side}
          onCloseMobile={handleMobileClose}
        />

        <SidebarFooter
          collapsed={isEffectiveCollapsed}
          onLogout={onLogout || (() => console.log("Logout clicked"))}
          user={user}
          side={side}
        />

        {/* Resize Handle */}
        {resizable && !collapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar width"
            aria-valuenow={sidebarWidth}
            aria-valuemin={minWidth}
            aria-valuemax={maxWidth}
            tabIndex={0}
            onMouseDown={startResizing}
            onTouchStart={startResizing}
            onDoubleClick={handleResetWidth}
            onKeyDown={handleKeyDownResize}
            className={resizeStyles.handle(isResizing, side)}
            title="Drag or use arrow keys to resize sidebar. Double-click to reset."
          >
            <div className={resizeStyles.indicator(isResizing, side)} />
          </div>
        )}
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";
