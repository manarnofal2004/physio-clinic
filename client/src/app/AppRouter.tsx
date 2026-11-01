import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { NotFoundPage } from "@/routes/NotFoundPage";

// Placeholder until the landing page (6.11) is built.
const HomePlaceholder = () => {
  const { t } = useTranslation();
  return <Typography variant="h5">{t("brand.fullName")}</Typography>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [{ index: true, element: <HomePlaceholder /> }],
  },
  { path: "/admin", element: <AdminLayout />, children: [] },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
