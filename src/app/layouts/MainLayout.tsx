import { useState, type FC, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar, TopNav } from "@/shared/ui";
import { local } from "@/shared/lib/Storage/localstorage";

// ==================== Main Layout ====================

export interface MainLayoutProps {
  children?: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  resizableSidebar?: boolean;
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    roles?: string[];
  };
  onLogout?: () => void;
}

// ==================== Layout Component ====================

export const MainLayout: FC<MainLayoutProps> = ({
  children,
  pageTitle = "Dashboard",
  pageSubtitle,
  resizableSidebar = true,
  user: customUser,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Clear local session data and redirect the user after logout.
  const handleLogout = () => {
    local.clear();
    if (onLogout) onLogout();
    navigate("/", { replace: true });
  };

  // Build the display role from multiple roles or fallback to the single role.
  const displayRole = (() => {
    if (!customUser?.roles) return customUser?.role || "";
    return customUser.roles.join(", ");
  })();

  // Normalize user data before passing it to layout components.
  const currentUser = {
    name: customUser?.name || "",
    email: customUser?.email || "",
    avatar: customUser?.avatar,
    role: displayRole,
    roles: customUser?.roles,
  };

  return (
    // ==================== Application Shell ====================
    <div className="h-screen w-screen bg-[#ebf7ff] dark:bg-[#03131e] text-[#004066] dark:text-[#ebf7ff] flex flex-row overflow-hidden font-sans antialiased selection:bg-[#0077be] selection:text-white">

      {/* ==================== Sidebar ==================== */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        resizable={resizableSidebar}
        user={{
          name: currentUser.name || "",
          email: currentUser.email || "",
          avatar: currentUser.avatar,
          role: currentUser.role,
          roles: currentUser.roles,
        }}
        onLogout={handleLogout}
        side="left"
      />

      {/* ==================== Main Content ==================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">

        {/* ==================== Top Navigation ==================== */}
        <TopNav
          title={pageTitle}
          subtitle={pageSubtitle}
          user={{
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
            role: currentUser.role,
          }}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          onMobileMenuOpen={() => setIsMobileOpen(true)}
          onLogout={handleLogout}
        />

        {/* ==================== Page Content ==================== */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-2 scrollbar-thin animate-in fade-in duration-200">
          <div className="w-full max-w-screen mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};