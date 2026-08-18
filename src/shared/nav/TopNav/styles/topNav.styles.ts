import { cn } from "@/shared/lib/utils";
import type { TopNavStyleConfig } from "../types/types";

// Main Header Container Styles
export const headerContainerStyles = (
  className?: string,
  styleConfig?: TopNavStyleConfig,
) =>
  cn(
    "h-[64px] w-full bg-white/95 dark:bg-[#061a29]/95 border-b border-[#004066]/15 dark:border-[#004066]/40 px-4 md:px-5 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200 shadow-[0_1px_0_0_rgba(0,64,102,0.05)] dark:shadow-[0_1px_0_0_rgba(235,247,255,0.03)] backdrop-blur-md",
    styleConfig?.container?.bg,
    styleConfig?.container?.border,
    styleConfig?.container?.height,
    styleConfig?.container?.shadow,
    className,
  );

// Title & Subtitle Section Styles
export const titleStyles = {
  container: "flex items-center gap-3",
  mobileButton:
    "md:hidden p-2 rounded-xl text-[#004066]/70 dark:text-[#ebf7ff]/70 hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0077be]",
  textContainer: "flex flex-col gap-0.5",
  titleText: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "text-[15px] md:text-base font-bold text-[#004066] dark:text-[#ebf7ff] tracking-tight leading-tight",
      styleConfig?.title?.textColor,
    ),
  subtitleText: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "text-[11px] text-[#004066]/70 dark:text-[#ebf7ff]/70 font-normal leading-none",
      styleConfig?.title?.subtitleColor,
    ),
};

// Theme Selector Dropdown Styles
export const themeDropdownStyles = {
  container: "relative",
  button: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "p-2 rounded-xl text-[#004066]/70 dark:text-[#ebf7ff]/70 hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40 transition-all duration-150 cursor-pointer flex items-center justify-center",
      styleConfig?.themeDropdown?.buttonHoverBg,
    ),
  backdrop: "fixed inset-0 z-40",
  dropdownMenu: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#061a29] border border-[#004066]/15 dark:border-[#004066]/40 shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150",
      styleConfig?.themeDropdown?.dropdownBg,
      styleConfig?.themeDropdown?.dropdownBorder,
    ),
  headerLabel:
    "px-3 py-1.5 text-[11px] font-bold text-[#004066]/60 dark:text-[#ebf7ff]/60 uppercase tracking-wider",
  item: (isActive: boolean, styleConfig?: TopNavStyleConfig) =>
    cn(
      "w-full px-3 py-2 text-xs font-medium flex items-center justify-between cursor-pointer transition-colors",
      isActive
        ? cn(
          "text-[#0077be] dark:text-[#38bdf8] bg-[#0077be]/10 dark:bg-[#0077be]/25 font-semibold",
          styleConfig?.themeDropdown?.activeItemBg,
          styleConfig?.themeDropdown?.activeItemText,
        )
        : cn(
          "text-[#004066] dark:text-[#ebf7ff] hover:bg-[#0077be]/5 dark:hover:bg-[#0077be]/15",
          styleConfig?.themeDropdown?.itemHoverBg,
        ),
    ),
};

// Notifications Button Styles
export const notificationStyles = {
  container: "relative",
  button: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "p-2 rounded-xl text-[#004066]/70 dark:text-[#ebf7ff]/70 hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40 transition-all duration-150 cursor-pointer relative",
      styleConfig?.notifications?.buttonHoverBg,
      styleConfig?.notifications?.iconColor,
    ),
  indicatorPing: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-[#0077be] ring-[1.5px] ring-white dark:ring-[#061a29] animate-ping",
      styleConfig?.notifications?.badgeColor,
    ),
  indicatorDot: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-[#0077be] ring-[1.5px] ring-white dark:ring-[#061a29]",
      styleConfig?.notifications?.badgeColor,
    ),
};

// User Profile Menu Styles
export const userProfileStyles = {
  container: "relative",
  button: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-[#ebf7ff] dark:hover:bg-[#004066]/40 transition-all duration-150 cursor-pointer border border-transparent focus:outline-none focus:ring-2 focus:ring-[#0077be]/30",
      styleConfig?.userProfile?.buttonHoverBg,
    ),
  avatarImg: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "w-8 h-8 rounded-full object-cover ring-2 ring-[#0077be]/30 img-clear",
      styleConfig?.userProfile?.avatarRing,
    ),
  defaultAvatar:
    "w-8 h-8 rounded-full bg-gradient-to-br from-[#0077be] to-[#004066] text-white font-semibold text-xs flex items-center justify-center shadow-sm shadow-[#0077be]/20",
  userInfoText: "hidden md:flex flex-col text-left",
  userName: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "text-[13px] font-semibold text-[#004066] dark:text-[#ebf7ff] leading-tight",
      styleConfig?.userProfile?.nameColor,
    ),
  userRoleText: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "text-[10.5px] text-[#004066]/70 dark:text-[#ebf7ff]/70 leading-tight",
      styleConfig?.userProfile?.roleColor,
    ),
  chevronIcon: (isOpen: boolean) =>
    cn(
      "text-[#004066]/50 dark:text-[#ebf7ff]/50 transition-transform duration-200 hidden md:block",
      isOpen && "rotate-180 text-[#0077be]",
    ),
  backdrop: "fixed inset-0 z-40",
  dropdownMenu: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#061a29] border border-[#004066]/15 dark:border-[#004066]/40 shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150",
      styleConfig?.userProfile?.dropdownBg,
      styleConfig?.userProfile?.dropdownBorder,
    ),
  header: "px-4 py-2.5 border-b border-[#004066]/10 dark:border-[#004066]/40",
  headerName: "text-xs font-bold text-[#004066] dark:text-[#ebf7ff]",
  headerEmail: "text-[11px] text-[#004066]/70 dark:text-[#ebf7ff]/70 truncate",
  roleBadge:
    "inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-semibold text-[#0077be] dark:text-[#38bdf8] bg-[#0077be]/10 dark:bg-[#0077be]/25 rounded-md",
  itemGroup: "py-1",
  item: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "w-full px-4 py-2 text-xs font-medium text-[#004066] dark:text-[#ebf7ff] hover:bg-[#0077be]/5 dark:hover:bg-[#0077be]/15 flex items-center gap-2.5 cursor-pointer transition-colors",
      styleConfig?.userProfile?.itemHoverBg,
    ),
  logoutDivider: "border-t border-[#004066]/10 dark:border-[#004066]/40 pt-1",
  logoutItem: (styleConfig?: TopNavStyleConfig) =>
    cn(
      "w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 cursor-pointer transition-colors",
      styleConfig?.userProfile?.logoutHoverBg,
      styleConfig?.userProfile?.logoutHoverText,
    ),
};

export const topNavStyles = {
  header: headerContainerStyles,
  title: titleStyles,
  themeDropdown: themeDropdownStyles,
  notifications: notificationStyles,
  userProfile: userProfileStyles,
};
