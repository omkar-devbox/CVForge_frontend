import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Sparkles,
  CalendarCheck2,
  CalendarClock,
  CalendarCheck,
  BarChart3,
  Settings,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import type { MenuSection, MenuItem } from "@/shared/nav/Sidebar/types/types";

// ==================== Sidebar Menu ====================

export const SIDEBAR_MENU: MenuSection[] = [
  {
    id: "overview-section",
    label: "Overview",
    description: "Main overview & metrics",
    items: [
      {
        id: "dashboard",
        key: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
        tooltip: "Overview & Analytics Dashboard",
      },
    ],
  },
  {
    id: "recruitment-section",
    label: "Recruitment",
    description: "Recruitment & candidate pipeline",
    items: [
      // {
      //   id: "recruitment",
      //   key: "recruitment",
      //   label: "Recruitment",
      //   icon: Briefcase,
      //   tooltip: "Recruitment & hiring workflow",
      //   children: [
      //     {
      //       id: "recruitment-jobs",
      //       key: "jobs",
      //       label: "Jobs",
      //       icon: Briefcase,
      //       path: "/recruitment/jobs",
      //       tooltip: "Manage Job Openings",
      //     },
      //     {
      //       id: "recruitment-applications",
      //       key: "applications",
      //       label: "Applications",
      //       icon: FileText,
      //       path: "/recruitment/applications",
      //       tooltip: "Candidate Applications",
      //     },
      //   ],
      // },
      {
        id: "candidates",
        key: "candidates",
        label: "Candidates",
        icon: Users,
        tooltip: "Candidate Management",
        children: [
          {
            id: "candidates-all",
            key: "all-candidates",
            label: "All Candidates",
            icon: Users,
            path: "/candidates/all",
            tooltip: "All Candidates Database",
          },
          // {
          //   id: "candidates-talent-pool",
          //   key: "talent-pool",
          //   label: "Talent Pool",
          //   icon: Sparkles,
          //   path: "/candidates/talent-pool",
          //   tooltip: "Curated Talent Pool",
          // },
        ],
      },
      // {
      //   id: "interviews",
      //   key: "interviews",
      //   label: "Interviews",
      //   icon: CalendarCheck2,
      //   tooltip: "Interview Scheduling & Tracking",
      //   children: [
      //     {
      //       id: "interviews-upcoming",
      //       key: "upcoming",
      //       label: "Upcoming",
      //       icon: CalendarClock,
      //       path: "/interviews/upcoming",
      //       tooltip: "Scheduled Upcoming Interviews",
      //     },
      //     {
      //       id: "interviews-completed",
      //       key: "completed",
      //       label: "Completed",
      //       icon: CalendarCheck,
      //       path: "/interviews/completed",
      //       tooltip: "Completed Interview Logs & Feedback",
      //     },
      //   ],
      // },
    ],
  },
  // {
  //   id: "management-section",
  //   label: "Management",
  //   description: "Analytics & system settings",
  //   items: [
  //     {
  //       id: "reports",
  //       key: "reports",
  //       label: "Reports",
  //       icon: BarChart3,
  //       path: "/reports",
  //       tooltip: "Analytics, Metrics & Reports",
  //     },
  //     {
  //       id: "settings",
  //       key: "settings",
  //       label: "Settings",
  //       icon: Settings,
  //       tooltip: "System Configurations & Preferences",
  //       children: [
  //         {
  //           id: "settings-users",
  //           key: "users",
  //           label: "Users",
  //           icon: UserCog,
  //           path: "/settings/users",
  //           tooltip: "User Management & Accounts",
  //         },
  //         {
  //           id: "settings-roles",
  //           key: "roles-permissions",
  //           label: "Roles & Permissions",
  //           icon: ShieldCheck,
  //           path: "/settings/roles-permissions",
  //           tooltip: "Access Control & Permissions",
  //         },
  //       ],
  //     },
  //   ],
  // },
];

// ==================== Sidebar Configuration ====================

export const SIDEBAR_CONFIG = {
  companyName: "System\nMechatronics",
  logo: null,
  menu: SIDEBAR_MENU,
};

// ==================== Menu Customization ====================

export function customizeMenu(
  originalMenu: MenuSection[] = SIDEBAR_MENU,
  options?: {
    hiddenSectionIds?: string[];
    hiddenItemKeys?: string[];
    customSections?: MenuSection[];
  }
): MenuSection[] {
  if (!options) return originalMenu;

  let result = originalMenu;

  // Filter hidden sections from the menu.
  if (options.hiddenSectionIds?.length) {
    result = result.filter(
      (section) => !options.hiddenSectionIds?.includes(section.id) && !section.hidden
    );
  }

  // Filter hidden items from each section.
  if (options.hiddenItemKeys?.length) {
    result = result.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !options.hiddenItemKeys?.includes(item.key) && !item.hidden
      ),
    }));
  }

  // Append custom sections to the existing menu.
  if (options.customSections?.length) {
    result = [...result, ...options.customSections];
  }

  return result;
}

// ==================== Route Access Control ====================

export function hasAccessToRoute(
  pathname: string,
  _user: any,
  hasPermission: (res: string, act?: string) => boolean
): boolean {
  // Normalize the requested pathname.
  const cleanPath = pathname.replace(/\/$/, "");

  // Allow unauthenticated access to public routes.
  const PUBLIC_ROUTES = ["/unauthorized", "/login", "/auth/login"];

  if (PUBLIC_ROUTES.includes(cleanPath)) {
    return true;
  }

  // Find the menu item associated with the requested route.
  const findItemByPath = (searchPath: string): { item: MenuItem; parent?: MenuItem } | null => {
    for (const section of SIDEBAR_MENU) {
      for (const item of section.items) {
        if (item.path?.replace(/\/$/, "") === searchPath) {
          return { item };
        }

        // Check nested child menu items.
        if (item.children) {
          for (const child of item.children) {
            if (child.path?.replace(/\/$/, "") === searchPath) {
              return { item: child, parent: item };
            }
          }
        }
      }
    }

    return null;
  };

  const match = findItemByPath(cleanPath);

  // Validate permissions for the matched route.
  if (match) {
    const checkPermissions = (permission?: Record<string, string[]>) => {
      if (!permission) return true;

      // Grant access when any configured action is permitted.
      return Object.entries(permission).every(([res, actions]) =>
        actions.some((act) => hasPermission(res, act))
      );
    };

    return checkPermissions(match.parent?.permission) && checkPermissions(match.item.permission);
  }

  // Allow routes that are not registered in the sidebar.
  return true;
}