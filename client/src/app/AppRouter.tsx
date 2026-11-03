import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PanelLayout } from "@/components/layout/PanelLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { adminNavItems } from "@/components/layout/adminNavItems";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { LandingPage } from "@/features/landing/LandingPage";
import { PageNotReady } from "@/features/therapist/PageNotReady";
import { TherapistHomePage } from "@/features/therapist/TherapistHomePage";
import { TherapistLayout } from "@/features/therapist/TherapistLayout";
import { therapistNavItems } from "@/features/therapist/therapistNavItems";
import { NotFoundPage } from "@/routes/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
  {
    element: <RequireAuth roles={["admin"]} />,
    children: [{ path: "/admin", element: <PanelLayout navItems={adminNavItems} />, children: [] }],
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
              children: [{ path: item.path, element: <PageNotReady /> }],
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
