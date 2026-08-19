export interface TopNavUser {
  name?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface TopNavStyleConfig {
  container?: {
    bg?: string;
    border?: string;
    height?: string;
    shadow?: string;
  };
  title?: {
    textColor?: string;
    subtitleColor?: string;
  };
  themeDropdown?: {
    buttonHoverBg?: string;
    dropdownBg?: string;
    dropdownBorder?: string;
    itemHoverBg?: string;
    activeItemBg?: string;
    activeItemText?: string;
  };
  notifications?: {
    buttonHoverBg?: string;
    badgeColor?: string;
    iconColor?: string;
  };
  userProfile?: {
    buttonHoverBg?: string;
    avatarRing?: string;
    nameColor?: string;
    roleColor?: string;
    dropdownBg?: string;
    dropdownBorder?: string;
    itemHoverBg?: string;
    logoutHoverBg?: string;
    logoutHoverText?: string;
  };
}

export interface TopNavProps {
  title?: string;
  subtitle?: string;
  user?: TopNavUser;
  collapsed?: boolean;
  onToggleSidebar?: () => void;
  onMobileMenuOpen?: () => void;
  onToggleAi?: () => void;
  isAiOpen?: boolean;
  onLogout?: () => void;
  className?: string;
  styleConfig?: TopNavStyleConfig;
}

export interface TopNavTitleProps {
  title?: string;
  subtitle?: string;
  onMobileMenuOpen?: () => void;
  onToggleSidebar?: () => void;
  styleConfig?: TopNavStyleConfig;
}

export interface TopNavThemeDropdownProps {
  styleConfig?: TopNavStyleConfig;
}

export interface TopNavNotificationsProps {
  hasUnread?: boolean;
  onNotificationClick?: () => void;
  styleConfig?: TopNavStyleConfig;
}

export interface TopNavUserProfileProps {
  user?: TopNavUser;
  onLogout?: () => void;
  styleConfig?: TopNavStyleConfig;
}
