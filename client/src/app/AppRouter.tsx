import type { ReactNode } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PanelLayout } from "@/components/layout/PanelLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { adminNavItems } from "@/components/layout/adminNavItems";
import { LoginPage } from "@/features/auth/LoginPage";
import { BannersPage } from "@/features/banners/BannersPage";
import { ReportDetailsPage } from "@/features/reports/ReportDetailsPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { TherapistsPage } from "@/features/therapists/TherapistsPage";
import { UsersPage } from "@/features/users/UsersPage";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { LandingPage } from "@/features/landing/LandingPage";
import { PageNotReady } from "@/features/therapist/PageNotReady";
import { TherapistHomePage } from "@/features/therapist/TherapistHomePage";
import { TherapistLayout } from "@/features/therapist/TherapistLayout";
import { therapistNavItems } from "@/features/therapist/therapistNavItems";
import { NotFoundPage } from "@/routes/NotFoundPage";

// Therapist pages that are built; the rest show "not ready yet".
const readyPages: Record<string, ReactNode> = {
  "/therapist/reports": <ReportsPage />,
  "/therapist/banners": <BannersPage />,
};

// Admin pages that are built (the dashboard at "/admin" is not yet).
const builtAdminPages = [
  "/admin",
  "/admin/users",
  "/admin/therapists",
  "/admin/reports",
  "/admin/banners",
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  {
    element: <RequireAuth roles={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <PanelLayout navItems={adminNavItems} />,
        children: [
          // Managing accounts is for admins only, and this whole branch is admin-only.
          { path: "users", element: <UsersPage /> },
          { path: "therapists", element: <TherapistsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "reports/:id", element: <ReportDetailsPage /> },
          // Pages in the menu that are not built yet say so, instead of "not found".
          { index: true, element: <PageNotReady /> },
          ...adminNavItems
            .filter((item) => !builtAdminPages.includes(item.path))
            .map((item) => ({ path: item.path, element: <PageNotReady /> })),
          {
            element: <RequireAuth privilege="banners.manage" />,
            children: [{ path: "banners", element: <BannersPage /> }],
          },
        ],
      },
    ],
  },
  {
    element: <RequireAuth roles={["therapist"]} />,
    children: [
      {
        path: "/therapist",
        element: <TherapistLayout />,
        children: [
          { index: true, element: <TherapistHomePage /> },
          // Each page checks its own privilege, so a typed URL cannot get around the menu.
          ...therapistNavItems
            .filter((item) => item.privilege)
            .map((item) => ({
              element: <RequireAuth privilege={item.privilege} />,
              children: [
                { path: item.path, element: readyPages[item.path] ?? <PageNotReady /> },
                // A report opened from the therapist's reports list.
                ...(item.path === "/therapist/reports"
                  ? [{ path: "/therapist/reports/:id", element: <ReportDetailsPage /> }]
                  : []),
              ],
            })),
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
