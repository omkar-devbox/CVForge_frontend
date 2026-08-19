import { lazy, Suspense, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { Loader2 } from "lucide-react";
import { SIDEBAR_MENU } from "../menu/menuItems";

// Lazy loading page components
const GenericPage = lazy(() => import("@/shared/pages/GenericPage/GenericPage"));
const JobsPage = lazy(() => import("@/features/recruitment/jobs/jobs"));
const ApplicationsPage = lazy(() => import("@/features/recruitment/applications/application"));
const AllCandidatesPage = lazy(() => import("@/features/candidates/allcandidates/allcandidates"));
const TalentPoolPage = lazy(() => import("@/features/candidates/talentpool/talentpool"));
const UpcomingInterviewsPage = lazy(() => import("@/features/interviews/upcoming/upcoming"));
const UnauthorizedPage = lazy(() =>
  import("@/shared/pages/unauthorized/UnauthorizedPage")
);
const NotFoundPage = lazy(() =>
  import("@/shared/pages/notfound/NotFoundPage")
);

/**
 * Fallback loader shown while lazy loaded chunks are being fetched
 */
function PageLoader() {
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
      <span className="text-xs font-semibold tracking-wide uppercase">Loading Page Module...</span>
    </div>
  );
}

export function AppRouter() {
  // Memoized dynamic sidebar module & settings routes
  const moduleRoutes = useMemo(() => {
    return SIDEBAR_MENU.flatMap((section) =>
      section.items.flatMap((item) => {
        const routes: { path: string; title: string; subtitle: string }[] = [];

        const addRoute = (p?: string, label?: string, tooltip?: string) => {
          if (!p || p === "/") return;
          routes.push({
            path: p,
            title: label || "Module Page",
            subtitle: tooltip || `Manage ${label || "module details"}`,
          });
          // Settings sub-route
          const settingsPath = p.endsWith("/batches")
            ? `${p}/batches-form-settings`
            : `${p}/settings`;
          routes.push({
            path: settingsPath,
            title: `${label || "Module"} Settings`,
            subtitle: `Configure form fields & settings for ${label || "module"}`,
          });
        };

        addRoute(item.path, item.label, item.tooltip);

        if (item.children) {
          item.children.forEach((child) => {
            addRoute(child.path, child.label, child.tooltip);
          });
        }

        return routes;
      })
    );
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <MainLayout pageTitle="Dashboard" pageSubtitle="Overview & Analytics Dashboard">
              <GenericPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <MainLayout pageTitle="Dashboard" pageSubtitle="Overview & Analytics Dashboard">
              <GenericPage />
            </MainLayout>
          }
        />

        {/* Recruitment Jobs Route */}
        <Route
          path="/recruitment/jobs"
          element={
            <MainLayout pageTitle="Jobs" pageSubtitle="Manage Job Openings & Hiring Pipeline">
              <JobsPage />
            </MainLayout>
          }
        />

        {/* Recruitment Applications Route */}
        <Route
          path="/recruitment/applications"
          element={
            <MainLayout pageTitle="Applications" pageSubtitle="Candidate Applications & Hiring Stages">
              <ApplicationsPage />
            </MainLayout>
          }
        />

        {/* All Candidates Routes */}
        <Route
          path="/candidates/all"
          element={
            <MainLayout pageTitle="All Candidates" pageSubtitle="Manage Candidate Profiles & Talent Database">
              <AllCandidatesPage />
            </MainLayout>
          }
        />
        <Route
          path="/candidates/allcandidates"
          element={
            <MainLayout pageTitle="All Candidates" pageSubtitle="Manage Candidate Profiles & Talent Database">
              <AllCandidatesPage />
            </MainLayout>
          }
        />

        {/* Talent Pool Routes */}
        <Route
          path="/candidates/talent-pool"
          element={
            <MainLayout pageTitle="Talent Pool" pageSubtitle="Curate, organize, and fast-track high-potential pre-vetted candidates">
              <TalentPoolPage />
            </MainLayout>
          }
        />
        <Route
          path="/candidates/talentpool"
          element={
            <MainLayout pageTitle="Talent Pool" pageSubtitle="Curate, organize, and fast-track high-potential pre-vetted candidates">
              <TalentPoolPage />
            </MainLayout>
          }
        />

        {/* Upcoming Interviews Route */}
        <Route
          path="/interviews/upcoming"
          element={
            <MainLayout pageTitle="Upcoming Interviews" pageSubtitle="Schedule, manage, and conduct upcoming candidate interviews">
              <UpcomingInterviewsPage />
            </MainLayout>
          }
        />

        {/* Dynamic Sidebar Module & Settings Routes */}
        {moduleRoutes
          .filter(
            (route) =>
              route.path !== "/recruitment/jobs" &&
              route.path !== "/recruitment/applications" &&
              route.path !== "/candidates/all" &&
              route.path !== "/candidates/allcandidates" &&
              route.path !== "/candidates/talent-pool" &&
              route.path !== "/candidates/talentpool" &&
              route.path !== "/interviews/upcoming"
          )
          .map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <MainLayout pageTitle={route.title} pageSubtitle={route.subtitle}>
                  <GenericPage />
                </MainLayout>
              }
            />
          ))}

        {/* Unauthorized Route */}
        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* Fallback 404 Route */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
}

