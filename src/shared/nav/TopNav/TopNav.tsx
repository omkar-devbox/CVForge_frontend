import { type FC, memo } from "react";
import type { TopNavProps } from "./types/types";
import { headerContainerStyles } from "./styles/topNav.styles";
import { TopNavTitle } from "./items/TopNavTitle";
import { TopNavThemeDropdown } from "./items/TopNavThemeDropdown";
import { TopNavNotifications } from "./items/TopNavNotifications";
import { TopNavUserProfile } from "./items/TopNavUserProfile";

export const TopNav: FC<TopNavProps> = memo(
  ({
    title = "Dashboard",
    subtitle,
    user = {
      name: "John Doe",
      email: "john.doe@systemmechatronics.com",
      role: "System Admin",
    },
    onToggleSidebar,
    onMobileMenuOpen,
    onLogout,
    className,
    styleConfig,
  }) => {
    return (
      <header className={headerContainerStyles(className, styleConfig)}>
        {/* Left Side: Sidebar Toggle & Page Title */}
        <TopNavTitle
          title={title}
          subtitle={subtitle}
          onMobileMenuOpen={onMobileMenuOpen}
          onToggleSidebar={onToggleSidebar}
          styleConfig={styleConfig}
        />

        {/* Right Side: Theme Dropdown, Notifications & User Profile */}
        <div className="flex items-center gap-1 md:gap-1.5">
          {/* Theme Selector */}
          <TopNavThemeDropdown styleConfig={styleConfig} />

          {/* Notifications Button */}
          <TopNavNotifications styleConfig={styleConfig} />

          {/* Divider */}
          <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-700/60 mx-0.5" />

          {/* User Profile */}
          <TopNavUserProfile
            user={user}
            onLogout={onLogout}
            styleConfig={styleConfig}
          />
        </div>
      </header>
    );
  },
);

TopNav.displayName = "TopNav";
