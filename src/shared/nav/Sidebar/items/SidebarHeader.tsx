import { type FC, memo } from "react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Tooltip } from "@/shared/ui";
import { headerStyles } from "../styles/sidebar.styles";
import { cn } from "../../../lib/utils";
import type { SidebarHeaderProps } from "../types/types";

export const SidebarHeader: FC<SidebarHeaderProps> = memo(({
  collapsed,
  isHeaderHovered,
  setIsHeaderHovered,
  onToggle,
  logo,
  companyName = "System\nMechatronics",
  side = "left",
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const brandString = typeof companyName === "string" ? companyName : "System Mechatronics";
  const parts = brandString.includes("\n")
    ? brandString.split("\n")
    : brandString.includes(" ")
      ? [brandString.split(" ")[0], brandString.split(" ").slice(1).join(" ")]
      : [brandString, ""];
  const title = parts[0] || brandString;
  const subtitle = parts[1] || "";

  return (
    <div
      className={headerStyles.container(collapsed)}
      onMouseEnter={() => setIsHeaderHovered(true)}
      onMouseLeave={() => setIsHeaderHovered(false)}
    >
      <div className={headerStyles.content(collapsed, side)}>
        {/* Logo & Name Area */}
        <div className={headerStyles.logoArea(collapsed, isHeaderHovered)}>
          {logo ? (
            typeof logo === "string" ? (
              <img
                src={logo}
                alt={typeof companyName === "string" ? companyName.replace("\n", " ") : "Company Logo"}
                className="h-10 w-10 object-contain rounded-xl img-clear shrink-0"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
              />
            ) : (
              <div className="shrink-0 img-clear">{logo}</div>
            )
          ) : (
            <div className={headerStyles.logo}>
              <span className="text-white font-bold text-xl">
                {title.charAt(0) || "S"}
              </span>
            </div>
          )}
          <div className={headerStyles.companyWrapper(collapsed)}>
            <span className={headerStyles.companyTitle}>
              {title}
            </span>
            {subtitle && (
              <span className={headerStyles.companySubtitle}>
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Area: Mobile Close vs Desktop Toggle */}
        <div className="flex items-center gap-1">
          {/* Mobile explicit close button */}
          {isMobileOpen && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className={headerStyles.mobileCloseButton}
              aria-label="Close mobile sidebar"
              title="Close navigation"
            >
              <X size={20} />
            </button>
          )}

          {/* Desktop Toggle Button Area */}
          <div
            className={cn("hidden md:flex", headerStyles.toggleButtonArea(collapsed, isHeaderHovered, side))}
          >
            <Tooltip
              content={collapsed ? "Show sidebar" : "Hide sidebar"}
              placement={side === "left" ? "right" : "left"}
              offset={collapsed ? 20 : 8}
            >
              <button
                type="button"
                onClick={onToggle}
                className={headerStyles.toggleButton}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen size={20} />
                ) : (
                  <PanelLeftClose size={20} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
});

SidebarHeader.displayName = "SidebarHeader";

