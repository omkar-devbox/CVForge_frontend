# 📖 Complete Guide to `shared/Sidebar`

> **Target Audience**: Beginners & Senior Engineers alike. This document provides a **100% comprehensive, section-by-section breakdown** of the Sidebar navigation module, explaining *what* each file does, *how* to use it, and *how* to customize it without prior codebase knowledge.

---

## 📌 Table of Contents

1. [🚀 Quick Start (5-Minute Integration)](#1--quick-start-5-minute-integration)
2. [🗺️ Module Architecture & File Map](#2--module-architecture--file-map)
3. [🧩 Section-by-Section Component Deep Dive](#3--section-by-section-component-deep-dive)
   - [Section 3.1: Core Container — `Sidebar.tsx`](#section-31-core-container--sidebartsx)
   - [Section 3.2: Top Branding & Toggle — `SidebarHeader.tsx`](#section-32-top-branding--toggle--sidebarheadertsx)
   - [Section 3.3: Navigation Scroll Container — `SidebarNav.tsx`](#section-33-navigation-scroll-container--sidebarnavtsx)
   - [Section 3.4: Category Section Wrapper — `SidebarSection.tsx`](#section-34-category-section-wrapper--sidebarsectiontsx)
   - [Section 3.5: Nav Links & Nested Submenus — `SidebarItem.tsx`](#section-35-nav-links--nested-submenus--sidebaritemtsx)
   - [Section 3.6: User Profile & Logout Footer — `SidebarFooter.tsx`](#section-36-user-profile--logout-footer--sidebarfootertsx)
   - [Section 3.7: Active Route Engine — `SidebarNavigationModel`](#section-37-active-route-engine--sidebarnavigationmodel)
   - [Section 3.8: Styling Tokens — `sidebar.styles.ts`](#section-38-styling-tokens--sidebarstylests)
   - [Section 3.9: TypeScript Schema & Types — `types.ts`](#section-39-typescript-schema--types--typests)
4. [🛠️ Data Structure Configuration Guide](#4%EF%B8%8F%E2%83%93-data-structure-configuration-guide)
   - [Creating Menu Items (`MenuItem`)](#creating-menu-items-menuitem)
   - [Creating Menu Sections (`MenuSection`)](#creating-menu-sections-menusection)
5. [⚡ Key Built-In Capabilities Explained](#5%EF%B8%8F%E2%83%93-key-built-in-capabilities-explained)
   - [Drag-to-Resize & Width Persistence](#drag-to-resize--width-persistence)
   - [Mobile Drawer Gestures & Overlay](#mobile-drawer-gestures--overlay)
   - [Route Preloading Optimization](#route-preloading-optimization)
   - [Accessibility Features (a11y)](#accessibility-features-a11y)
6. [💡 Real-World Copy-Paste Recipes](#6%EF%B8%8F%E2%83%93-real-world-copy-paste-recipes)
   - [Recipe 1: Full Application Layout Setup](#recipe-1-full-application-layout-setup)
   - [Recipe 2: Dynamic API-Driven Menu Loading](#recipe-2-dynamic-api-driven-menu-loading)
   - [Recipe 3: Role-Based Permission Filtering](#recipe-3-role-based-permission-filtering)
   - [Recipe 4: Subcomponent Direct Composition](#recipe-4-subcomponent-direct-composition)
7. [❓ FAQ & Troubleshooting](#7%EF%B8%8F%E2%83%93-faq--troubleshooting)

---

## 1. 🚀 Quick Start (5-Minute Integration)

If you are new to the project, here is the absolute fastest way to render the Sidebar in your application.

### Step 1: Import the Component Directly

```tsx
// ⚠️ Note: Import directly from the component file! No barrel index.ts files.
import { Sidebar } from "@/shared/nav/Sidebar/Sidebar";
import { useState } from "react";
```

### Step 2: Render in your Page/Layout

```tsx
import React, { useState } from "react";
import { Sidebar } from "@/shared/nav/Sidebar/Sidebar";

export function SimpleApp() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. Render Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        companyName="My Cool App"
        user={{
          name: "John Doe",
          email: "john@example.com",
        }}
        onLogout={() => alert("Logging out!")}
      />

      {/* 2. Main Page Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Welcome to the Dashboard!
        </h1>
      </main>
    </div>
  );
}
```

That's it! You now have a fully responsive, collapsible, resizable sidebar with tooltips and active link tracking.

---

## 2. 🗺️ Module Architecture & File Map

The module is stored under `src/shared/nav/Sidebar/`. All subcomponents are cleanly separated into dedicated files to ensure long-term maintainability.

```
src/shared/nav/Sidebar/
│
├── Sidebar.tsx                  <-- 1. Main orchestrator container & state manager
│
├── items/                       <-- Subcomponents folder (Direct File Imports)
│   ├── SidebarHeader.tsx        <-- 2. Logo, company title, desktop toggle & mobile close
│   ├── SidebarNav.tsx           <-- 3. Scrollable navigation wrapper
│   ├── SidebarSection.tsx       <-- 4. Category group heading & divider line
│   ├── SidebarItem.tsx          <-- 5. Individual link/button & nested submenus
│   └── SidebarFooter.tsx        <-- 6. User profile, avatar fallback & logout button
│
├── styles/
│   └── sidebar.styles.ts        <-- 7. Tailwind styling objects & color themes
│
└── types/
    └── types.ts                 <-- 8. TypeScript interfaces & active route matching model
```

---

## 3. 🧩 Section-by-Section Component Deep Dive

---

### Section 3.1: Core Container — `Sidebar.tsx`

- **File Path**: [Sidebar.tsx](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/Sidebar.tsx)
- **Role**: Main top-level component that manages width resizing, local storage saving, mobile touch gestures, body scroll locking, keyboard resize controls, and passes props down to header, nav, and footer subcomponents.

#### Complete Props Table (`SidebarMainProps`)

| Prop Name | Type | Default Value | Required? | Purpose & Detailed Usage |
| :--- | :--- | :--- | :---: | :--- |
| `collapsed` | `boolean` | — | **Yes** | Controls whether the sidebar is collapsed into icon-only mode (`true`) or expanded (`false`). |
| `setCollapsed` | `(c: boolean) => void` | — | **Yes** | State setter function to change the collapse state. |
| `logo` | `ReactNode \| string` | Default Logo | No | Image URL string or custom SVG/JSX element for company logo. |
| `companyName` | `string` | Default Name | No | Company or application title displayed in header. |
| `user` | `SidebarFooterProps["user"]` | `undefined` | No | Object containing `name`, `email`, `avatar`, and optional `organizationName`. |
| `isMobileOpen` | `boolean` | `false` | No | Controls whether the mobile drawer overlay is open. |
| `onCloseMobile` | `() => void` | `undefined` | No | Callback triggered when user swipes to close or clicks backdrop on mobile. |
| `resizable` | `boolean` | `true` | No | Enables or disables the right edge drag handle for custom width resizing. |
| `defaultWidth` | `number` | `256` | No | Width of sidebar in pixels when expanded (if no saved width in localStorage). |
| `minWidth` | `number` | `200` | No | Minimum allowed width in pixels when resizing. |
| `maxWidth` | `number` | `480` | No | Maximum allowed width in pixels when resizing. |
| `storageKey` | `string` | `"system_mechatronics_sidebar_width"` | No | LocalStorage key name used to save user's custom width. Set to `""` to disable persistence. |
| `onWidthChange` | `(w: number) => void` | `undefined` | No | Listener callback fired whenever user resizes the sidebar. |
| `menu` | `MenuSection[]` | Default Menu | No | Array of sections and items to display in sidebar. |
| `side` | `"left" \| "right"` | `"left"` | No | Sets sidebar placement on left or right side of screen. |
| `onLogout` | `() => void` | `undefined` | No | Callback function when user clicks the Logout button in footer. |

---

### Section 3.2: Top Branding & Toggle — `SidebarHeader.tsx`

- **File Path**: [SidebarHeader.tsx](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/items/SidebarHeader.tsx)
- **Role**: Renders company logo icon, company title, desktop collapse toggle icon button (PanelLeftClose/PanelLeftOpen), and mobile explicit close button (`X`).

#### Component Import & Direct Usage

```tsx
import { SidebarHeader } from "@/shared/nav/Sidebar/items/SidebarHeader";

<SidebarHeader
  collapsed={false}
  isHeaderHovered={false}
  setIsHeaderHovered={(hovered) => console.log(hovered)}
  onToggle={() => console.log("Toggle collapsed")}
  companyName="CVForge"
/>
```

#### Props Breakdown (`SidebarHeaderProps`)

| Prop | Type | Purpose |
| :--- | :--- | :--- |
| `collapsed` | `boolean` | Collapsed state flag. |
| `isHeaderHovered` | `boolean` | Controls hover styling of toggle icon overlay. |
| `setIsHeaderHovered` | `(val: boolean) => void` | Function to set hover state. |
| `onToggle` | `() => void` | Callback when collapse button is clicked. |
| `logo` | `ReactNode \| string` | Custom logo image URL or component. |
| `companyName` | `string` | Company title. Fallback shows first letter avatar if no logo is given. |
| `isMobileOpen` | `boolean` | Shows mobile close (`X`) icon button when `true`. |
| `onCloseMobile` | `() => void` | Callback when mobile close button is pressed. |

---

### Section 3.3: Navigation Scroll Container — `SidebarNav.tsx`

- **File Path**: [SidebarNav.tsx](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/items/SidebarNav.tsx)
- **Role**: Contains the scrollable middle section of the sidebar. Iterates over the `menu` section list and renders `SidebarSection` for each category.

#### Props Breakdown (`SidebarNavProps`)

```ts
interface SidebarNavProps {
  menu: MenuSection[];          // Array of menu sections
  collapsed: boolean;           // Collapsed state
  onExpand: () => void;         // Expands sidebar if collapsed item is clicked
  side?: "left" | "right";      // Alignment
  onCloseMobile?: () => void;   // Mobile close handler
}
```

---

### Section 3.4: Category Section Wrapper — `SidebarSection.tsx`

- **File Path**: [SidebarSection.tsx](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/items/SidebarSection.tsx)
- **Role**: Groups related navigation items under an uppercase category heading (e.g., `MAIN NAVIGATION`). In collapsed mode, hides text and displays a subtle divider line.

#### Props Breakdown (`SidebarSectionProps`)

| Prop | Type | Purpose |
| :--- | :--- | :--- |
| `section` | `MenuSection` | The section data object containing `id`, `label`, and `items`. |
| `collapsed` | `boolean` | Collapsed state. |
| `onExpand` | `() => void` | Expands sidebar if user clicks a collapsed item in this section. |

---

### Section 3.5: Nav Links & Nested Submenus — `SidebarItem.tsx`

- **File Path**: [SidebarItem.tsx](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/items/SidebarItem.tsx)
- **Role**: Renders individual navigation links. Handles route preloading on hover, automatic active link highlighting, dropdown chevron animation for submenus, nested recursive rendering for multi-level menus, and tooltips in collapsed mode.

#### Key Features inside `SidebarItem`:
1. **Active Matching**: Uses `SidebarNavigationModel.isActive(item, pathname)` to check if the current page matches this item's path or any of its child paths.
2. **Submenu Expansion**: Manages internal `isOpen` dropdown state. Automatically opens dropdown if a child route is active.
3. **Route Preloading**: Invokes `window.__preloadRoute(item.path)` on mouse enter or focus.
4. **Keyboard Accessibility**: Supports `Enter` and `Space` keys to expand/collapse submenus.

---

### Section 3.6: User Profile & Logout Footer — `SidebarFooter.tsx`

- **File Path**: [SidebarFooter.tsx](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/items/SidebarFooter.tsx)
- **Role**: Positioned at the bottom of the sidebar. Shows user avatar (or initial icon fallback), user full name, user email, organization name, and a stylized Logout button. Shows tooltips in collapsed mode.

#### Direct Usage Example

```tsx
import { SidebarFooter } from "@/shared/nav/Sidebar/items/SidebarFooter";

<SidebarFooter
  collapsed={false}
  user={{
    name: "Jane Smith",
    email: "jane@company.com",
    avatar: "https://i.pravatar.cc/100",
    organizationName: "Engineering Team",
  }}
  onLogout={() => console.log("User logged out")}
/>
```

---

### Section 3.7: Active Route Engine — `SidebarNavigationModel`

- **File Path**: [types.ts](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/types/types.ts#L44)
- **Role**: Pure utility class providing static methods to evaluate active routes.

```ts
export class SidebarNavigationModel {
  // Checks if any child in a recursive menu tree matches current URL path
  static isChildActive(children: MenuItem[], currentPath: string): boolean;

  // Determines if an item (or any of its children) is active for current URL path
  static isActive(item: MenuItem, currentPath: string): boolean;
}
```

---

### Section 3.8: Styling Tokens — `sidebar.styles.ts`

- **File Path**: [sidebar.styles.ts](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/styles/sidebar.styles.ts)
- **Role**: Contains all Tailwind CSS style objects. Designed for high readability, easy maintenance, smooth transition animations, and dark mode support (`dark:` classes).

Key exported style objects:
- `asideStyles`: Dynamic generator function for `<aside>` root wrapper.
- `headerStyles`: Styles for logo, company name, toggle button, and mobile close button.
- `navStyles`: Main navigation scrollbar area container styles.
- `sectionStyles`: Category labels and divider styles.
- `itemStyles`: Navigation links, icons, active indicators, submenus, vertical branch lines, and dot fallback indicators.
- `footerStyles`: User avatar, info block, and logout button styles.
- `resizeStyles`: Drag handle and resize indicator line styles.

---

### Section 3.9: TypeScript Schema & Types — `types.ts`

- **File Path**: [types.ts](file:///home/omkar/Documents/system_mechatronics/CVForge/code/CVForge_frontend/src/shared/nav/Sidebar/types/types.ts)
- **Role**: Centralized source of truth for all TypeScript types.

---

## 4. 🛠️ Data Structure Configuration Guide

Understanding how menu data is structured makes adding new pages or submenus trivial.

### Creating Menu Items (`MenuItem`)

A `MenuItem` represents a single page link or a parent item with a dropdown sub-menu.

```ts
import type { MenuItem } from "@/shared/nav/Sidebar/types/types";
import { LayoutDashboard, Settings, FileText } from "lucide-react";

// 1. Simple Single Page Link
const dashboardItem: MenuItem = {
  id: "dashboard-link",
  key: "dashboard",
  label: "Dashboard Overview",
  icon: LayoutDashboard,
  path: "/dashboard",
};

// 2. Parent Item with Nested Children (Submenu)
const documentsItem: MenuItem = {
  id: "docs-link",
  key: "docs",
  label: "Documents",
  icon: FileText,
  children: [
    {
      id: "resumes-link",
      key: "resumes",
      label: "My Resumes",
      path: "/documents/resumes",
    },
    {
      id: "cover-letters-link",
      key: "cover-letters",
      label: "Cover Letters",
      path: "/documents/cover-letters",
    },
  ],
};
```

---

### Creating Menu Sections (`MenuSection`)

A `MenuSection` groups related items under a category heading.

```ts
import type { MenuSection } from "@/shared/nav/Sidebar/types/types";
import { LayoutDashboard, UserCheck, ShieldAlert } from "lucide-react";

export const MY_APP_MENU: MenuSection[] = [
  {
    id: "main-section",
    label: "MAIN NAVIGATION",
    items: [
      {
        id: "home",
        key: "home",
        label: "Home Dashboard",
        icon: LayoutDashboard,
        path: "/home",
      },
    ],
  },
  {
    id: "admin-section",
    label: "ADMINISTRATION",
    items: [
      {
        id: "users",
        key: "users",
        label: "User Management",
        icon: UserCheck,
        path: "/admin/users",
      },
      {
        id: "roles",
        key: "roles",
        label: "Roles & Access",
        icon: ShieldAlert,
        path: "/admin/roles",
      },
    ],
  },
];
```

---

## 5. ⚡ Key Built-In Capabilities Explained

### Drag-to-Resize & Width Persistence

- **How to Resize**: Mouse-down on the right border of the sidebar and drag left/right.
- **Keyboard Control**: Focus the handle using `Tab` key, then press `ArrowLeft` or `ArrowRight` to adjust width by 10px. Press `Home` for min width, `End` for max width, or `Enter`/`Space` to reset.
- **Double Click**: Double-click the resize handle to instantly reset to default width (`256px`).
- **Persistence**: Saved automatically into browser `localStorage` under `system_mechatronics_sidebar_width`.

---

### Mobile Drawer Gestures & Overlay

- On screen widths below `md` (`768px`), pass `isMobileOpen={true}` to activate the mobile drawer mode.
- **Swipe-to-close**: Touch swipe left (for left sidebar) automatically triggers `onCloseMobile()`.
- **Backdrop Overlay**: Dark translucent backdrop locks body scroll (`overflow: hidden`).
- **Escape Key**: Pressing `Escape` key automatically closes mobile drawer.

---

### Route Preloading Optimization

Hovering or focusing over any sidebar link executes:
```ts
window.__preloadRoute(item.path);
```
If your application uses route chunk preloading, lazy-loaded components are fetched *before* the user even clicks the link, eliminating page load delay!

---

### Accessibility Features (a11y)

- `role="navigation"` on the main nav wrapper.
- `role="region"` with `aria-label` for sections.
- `aria-expanded` and `aria-current="page"` for links.
- `role="separator"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on resize handle.

---

## 6. 💡 Real-World Copy-Paste Recipes

### Recipe 1: Full Application Layout Setup

```tsx
import React, { useState } from "react";
import { Sidebar } from "@/shared/nav/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentUser = {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    organizationName: "TechCorp Inc.",
  };

  const handleLogout = () => {
    // Implement your auth logout here
    alert("Logging out...");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 justify-between">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium"
          >
            ☰ Menu
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            CVForge Application
          </span>
        </header>

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

### Recipe 2: Dynamic API-Driven Menu Loading

If your sidebar menu comes from a backend API response:

```tsx
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/shared/nav/Sidebar/Sidebar";
import type { MenuSection } from "@/shared/nav/Sidebar/types/types";

export function ApiSidebarWrapper() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/navigation-menu")
      .then((res) => res.json())
      .then((data: MenuSection[]) => {
        setMenuSections(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="w-64 h-screen bg-slate-900 animate-pulse" />;
  }

  return (
    <Sidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      menu={menuSections}
    />
  );
}
```

---

### Recipe 3: Role-Based Permission Filtering

Filtering out items based on logged-in user permissions:

```tsx
import React, { useState, useMemo } from "react";
import { Sidebar } from "@/shared/nav/Sidebar/Sidebar";
import { SIDEBAR_MENU } from "@/app/menu/menuItems";
import type { MenuSection } from "@/shared/nav/Sidebar/types/types";

export function PermissionFilteredSidebar({ userPermissions }: { userPermissions: string[] }) {
  const [collapsed, setCollapsed] = useState(false);

  // Filter sections & items based on permission check
  const allowedMenu = useMemo(() => {
    return SIDEBAR_MENU.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true; // Public item
        // Check if user has required module permission
        return Object.entries(item.permission).some(([module, actions]) =>
          actions.some((action) => userPermissions.includes(`${module}:${action}`))
        );
      }),
    })).filter((section) => section.items.length > 0);
  }, [userPermissions]);

  return (
    <Sidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      menu={allowedMenu}
    />
  );
}
```

---

### Recipe 4: Subcomponent Direct Composition

If you want to construct your own custom drawer without using the root `Sidebar` wrapper:

```tsx
import React, { useState } from "react";
import { SidebarHeader } from "@/shared/nav/Sidebar/items/SidebarHeader";
import { SidebarNav } from "@/shared/nav/Sidebar/items/SidebarNav";
import { SidebarFooter } from "@/shared/nav/Sidebar/items/SidebarFooter";
import { SIDEBAR_MENU } from "@/app/menu/menuItems";

export function CustomComposedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  return (
    <aside className="h-screen w-64 bg-slate-900 text-white flex flex-col justify-between">
      {/* 1. Custom Header */}
      <SidebarHeader
        collapsed={collapsed}
        isHeaderHovered={isHeaderHovered}
        setIsHeaderHovered={setIsHeaderHovered}
        onToggle={() => setCollapsed(!collapsed)}
        companyName="Custom Build"
      />

      {/* 2. Custom Navigation Body */}
      <SidebarNav
        menu={SIDEBAR_MENU}
        collapsed={collapsed}
        onExpand={() => setCollapsed(false)}
      />

      {/* 3. Custom Footer */}
      <SidebarFooter
        collapsed={collapsed}
        onLogout={() => alert("Logout")}
        user={{
          name: "Admin User",
          email: "admin@system.com",
        }}
      />
    </aside>
  );
}
```

---

## 7. ❓ FAQ & Troubleshooting

### Q1: Why are subcomponents imported directly instead of `index.ts`?
> **Answer**: Direct imports guarantee tree-shaking, eliminate circular dependencies, prevent bundle pollution, and make code tracing explicit for developers.

### Q2: Why is my route active state not updating when I click a link?
> **Answer**: Ensure your component is wrapped inside a React Router provider (`BrowserRouter`, `RouterProvider`, etc.). `SidebarItem` relies on `useLocation()` to detect current path changes.

### Q3: How do I disable width resizing?
> **Answer**: Pass `resizable={false}` to `<Sidebar />`.

### Q4: How do I change default sidebar width?
> **Answer**: Pass `defaultWidth={300}` (or any pixel numeric value).

### Q5: How do I clear saved sidebar width in localStorage?
> **Answer**: Pass `storageKey=""` to disable reading/writing to localStorage, or clear the storage key `"system_mechatronics_sidebar_width"` in browser developer tools.
