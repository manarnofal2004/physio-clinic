import type { ReactNode } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { PanelLayout } from "@/components/layout/PanelLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { adminNavItems } from "@/components/layout/adminNavItems";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { PrivacyPage } from "@/features/privacy/PrivacyPage";
import { BannersPage } from "@/features/banners/BannersPage";
import { PatientsPage } from "@/features/patients/PatientsPage";
import { PatientDetailsPage } from "@/features/patients/PatientDetailsPage";
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
import { MyProfilePage } from "@/features/portal/MyProfilePage";
import { MyReportDetailsPage } from "@/features/portal/MyReportDetailsPage";
import { MyReportsPage } from "@/features/portal/MyReportsPage";
import { portalNavItems } from "@/features/portal/portalNavItems";
import { NotFoundPage } from "@/routes/NotFoundPage";

// Therapist pages that are built; the rest show "not ready yet".
const readyPages: Record<string, ReactNode> = {
  "/therapist/dashboard": <DashboardPage />,
  "/therapist/reports": <ReportsPage />,
  "/therapist/patients": <PatientsPage />,
  "/therapist/banners": <BannersPage />,
};

// Admin pages that are built ("/admin" is the dashboard).
const builtAdminPages = [
  "/admin",
  "/admin/users",
  "/admin/therapists",
  "/admin/patients",
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
      { path: "privacy", element: <PrivacyPage /> },
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
          { path: "patients", element: <PatientsPage /> },
          { path: "patients/:id", element: <PatientDetailsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "reports/:id", element: <ReportDetailsPage /> },
          // Pages in the menu that are not built yet say so, instead of "not found".
          { index: true, element: <DashboardPage /> },
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
                // A patient opened from the therapist's patients list.
                ...(item.path === "/therapist/patients"
                  ? [{ path: "/therapist/patients/:id", element: <PatientDetailsPage /> }]
                  : []),
              ],
            })),
        ],
      },
    ],
  },
  {
    element: <RequireAuth roles={["patient"]} />,
    children: [
      {
        path: "/portal",
        element: <PanelLayout navItems={portalNavItems} />,
        children: [
          // "/portal" alone opens the profile.
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <MyProfilePage /> },
          { path: "reports", element: <MyReportsPage /> },
          { path: "reports/:id", element: <MyReportDetailsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
