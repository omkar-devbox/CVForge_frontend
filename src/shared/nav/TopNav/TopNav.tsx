import { type FC, memo } from "react";
import type { TopNavProps } from "./types/types";
import { headerContainerStyles } from "./styles/topNav.styles";
import { TopNavTitle } from "./items/TopNavTitle";
import { TopNavThemeDropdown } from "./items/TopNavThemeDropdown";
import { TopNavNotifications } from "./items/TopNavNotifications";
import { TopNavUserProfile } from "./items/TopNavUserProfile";
import { Sparkles } from "lucide-react";

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
    onToggleAi,
    isAiOpen = false,
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

        {/* Right Side: AI Co-pilot, Theme Dropdown, Notifications & User Profile */}
        <div className="flex items-center gap-1 md:gap-1.5">
          {/* AI Co-pilot Button */}
          {onToggleAi && (
            <button
              onClick={onToggleAi}
              title={isAiOpen ? "Close AI Co-pilot" : "Open AI Co-pilot"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
                isAiOpen
                  ? "bg-[#0077be] text-white ring-2 ring-[#0077be]/40 shadow-md"
                  : "bg-[#0077be]/10 text-[#0077be] dark:bg-[#0077be]/20 dark:text-[#38bdf8] hover:bg-[#0077be]/20 dark:hover:bg-[#0077be]/30"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAiOpen ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">AI Co-pilot</span>
              {isAiOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          )}

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
