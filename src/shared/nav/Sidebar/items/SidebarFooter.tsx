import { type FC, memo, useState, useEffect, useRef } from "react";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import { Tooltip } from "@/shared/ui";
import { footerStyles } from "../styles/sidebar.styles";
import type { SidebarFooterProps } from "../types/types";

export const SidebarFooter: FC<SidebarFooterProps> = memo(({
  collapsed,
  onLogout,
  user,
  side = "left",
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipPlacement = side === "left" ? "right" : "left";

  const roleDisplay =
    user?.roles && user.roles.length > 0
      ? user.roles.join(", ")
      : user?.role || "";

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  const userAvatarNode = (
    <div className={footerStyles.avatar}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-full w-full object-cover rounded-full img-clear"
          style={{ imageRendering: "-webkit-optimize-contrast" }}
        />
      ) : (
        <UserIcon size={18} />
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={footerStyles.container(collapsed)}>
      {/* Profile Popup Menu */}
      {isProfileOpen && user && (
        <div className={footerStyles.popupMenu(collapsed, side)}>
          <div className={footerStyles.popupHeader}>
            <p className={footerStyles.popupName}>{user.name}</p>
            <p className={footerStyles.popupEmail}>{user.email}</p>
            {roleDisplay && (
              <span className={footerStyles.popupRoleBadge}>
                <Shield size={10} />
                {roleDisplay}
              </span>
            )}
          </div>

          <div className={footerStyles.popupItemGroup}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(false)}
              className={footerStyles.popupItem}
            >
              <UserIcon size={15} className="text-slate-400" />
              My Profile
            </button>
          </div>

          <div className={footerStyles.popupLogoutDivider}>
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(false);
                onLogout();
              }}
              className={footerStyles.popupLogoutItem}
            >
              <LogOut size={15} className="text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {user && (
        <div
          role="button"
          tabIndex={0}
          aria-label="User Profile"
          aria-expanded={isProfileOpen}
          onClick={() => setIsProfileOpen((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsProfileOpen((prev) => !prev);
            }
          }}
          className={footerStyles.userArea(collapsed, side)}
        >
          {collapsed ? (
            !isProfileOpen ? (
              <Tooltip content={user.name} placement={tooltipPlacement} offset={16}>
                {userAvatarNode}
              </Tooltip>
            ) : (
              userAvatarNode
            )
          ) : (
            userAvatarNode
          )}

          {!collapsed && (
            <div
              className={footerStyles.userInfo}
              style={{ textAlign: side === "right" ? "right" : "left" }}
            >
              <p className={footerStyles.userName}>{user.name}</p>
              <p className={footerStyles.userEmail}>{user.email}</p>
              {user.organizationName && (
                <p className={footerStyles.userOrg}>{user.organizationName}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SidebarFooter.displayName = "SidebarFooter";
