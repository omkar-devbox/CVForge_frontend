import { useState, useEffect, useRef, memo, type FC } from "react";
import { ChevronDown, User, LogOut, Shield } from "lucide-react";
import type { TopNavUserProfileProps } from "../types/types";
import { userProfileStyles } from "../styles/topNav.styles";

export const TopNavUserProfile: FC<TopNavUserProfileProps> = memo(
  ({
    user = {
      name: "John Doe",
      email: "john.doe@systemmechatronics.com",
      role: "System Admin",
    },
    onLogout,
    styleConfig,
  }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    return (
      <div ref={containerRef} className={userProfileStyles.container}>
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={userProfileStyles.button(styleConfig)}
          aria-expanded={isProfileOpen}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User Avatar"}
              className={userProfileStyles.avatarImg(styleConfig)}
              style={{ imageRendering: "-webkit-optimize-contrast" }}
            />
          ) : (
            <div className={userProfileStyles.defaultAvatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div className={userProfileStyles.userInfoText}>
            <span className={userProfileStyles.userName(styleConfig)}>
              {user.name}
            </span>
            <span className={userProfileStyles.userRoleText(styleConfig)}>
              {user.role || "User"}
            </span>
          </div>

          <ChevronDown
            size={13}
            className={userProfileStyles.chevronIcon(isProfileOpen)}
          />
        </button>

        {/* Profile Dropdown Menu */}
        {isProfileOpen && (
          <div className={userProfileStyles.dropdownMenu(styleConfig)}>
            <div className={userProfileStyles.header}>
              <p className={userProfileStyles.headerName}>{user.name}</p>
              <p className={userProfileStyles.headerEmail}>{user.email}</p>
              {user.role && (
                <span className={userProfileStyles.roleBadge}>
                  <Shield size={10} />
                  {user.role}
                </span>
              )}
            </div>

            <div className={userProfileStyles.itemGroup}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className={userProfileStyles.item(styleConfig)}
              >
                <User size={15} className="text-slate-400" />
                My Profile
              </button>
            </div>

            <div className={userProfileStyles.logoutDivider}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onLogout) onLogout();
                }}
                className={userProfileStyles.logoutItem(styleConfig)}
              >
                <LogOut size={15} className="text-red-500" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

TopNavUserProfile.displayName = "TopNavUserProfile";
