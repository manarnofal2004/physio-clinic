import { Typography } from "@mui/material";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { NotFoundPage } from "@/routes/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Typography variant="h5">Physiotherapy Clinic</Typography> },
    ],
  },
  { path: "/admin", element: <AdminLayout />, children: [] },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
