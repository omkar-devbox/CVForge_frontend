import type { LucideIcon } from "lucide-react";

export interface MenuItemBadge {
  text: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export interface MenuItem {
  id: string;
  key: string;
  label: string;
  icon?: LucideIcon;
  path?: string;
  children?: MenuItem[];
  permission?: Record<string, string[]>;
  badge?: MenuItemBadge;
  tooltip?: string;
  hidden?: boolean;
  disabled?: boolean;
  external?: boolean;
  target?: "_blank" | "_self";
}

export interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  permission?: Record<string, string[]>;
  badge?: MenuItemBadge;
  hidden?: boolean;
  description?: string;
}

export interface SidebarConfig {
  companyName: string;
  logo?: React.ReactNode;
  menu: MenuSection[];
}

/**
 * Class to handle navigation logic for the Sidebar.
 * Encapsulates tree traversal and active state detection.
 */
export class SidebarNavigationModel {
  /**
   * Checks if any child of a menu item is currently active.
   */
  static isChildActive(children: MenuItem[], currentPath: string): boolean {
    return children.some((child) => {
      if (child.path === currentPath) return true;
      if (child.children)
        return this.isChildActive(child.children, currentPath);
      return false;
    });
  }

  /**
   * Determines if a menu item is active based on the current path.
   */
  static isActive(item: MenuItem, currentPath: string): boolean {
    if (item.path === currentPath) return true;
    if (item.children && item.children.length > 0) {
      return this.isChildActive(item.children, currentPath);
    }
    return false;
  }
}

export interface SidebarStyleConfig {
  container?: {
    bg?: string;
    border?: string;
    width?: string;
    collapsedWidth?: string;
  };
  header?: {
    bg?: string;
    height?: string;
    logoBg?: string;
    logoBorder?: string;
    textColor?: string;
    toggleBg?: string;
    toggleBorder?: string;
    toggleIcon?: string;
  };
  section?: {
    labelColor?: string;
    dividerColor?: string;
  };
  item?: {
    activeBg?: string;
    activeText?: string;
    hoverBg?: string;
    hoverText?: string;
    inactiveText?: string;
    iconColor?: string;
    dotColor?: string;
    chevronColor?: string;
  };
  footer?: {
    bg?: string;
    border?: string;
    userNameColor?: string;
    userEmailColor?: string;
    avatarBg?: string;
    logoutHoverBg?: string;
    logoutHoverText?: string;
  };
}

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  styleConfig?: SidebarStyleConfig;
  side?: "left" | "right";
  onCloseMobile?: () => void;
}

export interface SidebarHeaderProps {
  collapsed: boolean;
  isHeaderHovered: boolean;
  setIsHeaderHovered: (hovered: boolean) => void;
  onToggle: () => void;
  logo?: React.ReactNode;
  companyName?: string;
  side?: "left" | "right";
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export interface SidebarFooterProps {
  collapsed: boolean;
  onLogout: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    roles?: string[];
    organizationName?: string | null;
  };
  side?: "left" | "right";
}

export interface SidebarMainProps extends SidebarProps {
  logo?: React.ReactNode;
  companyName?: string;
  user?: SidebarFooterProps["user"];
  isMobileOpen?: boolean;
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
  onWidthChange?: (width: number) => void;
  menu?: MenuSection[];
  side?: "left" | "right";
  onLogout?: () => void;
  onCloseMobile?: () => void;
}

export interface SidebarSectionProps {
  section: MenuSection;
  collapsed: boolean;
  onExpand: () => void;
  side?: "left" | "right";
  onCloseMobile?: () => void;
}

export interface SidebarItemProps {
  item: MenuItem;
  collapsed?: boolean;
  depth?: number;
  onExpand?: () => void;
  side?: "left" | "right";
  onCloseMobile?: () => void;
}
