import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Privilege, Role } from "@shared/api-types";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ForbiddenPage } from "@/routes/ForbiddenPage";
import { homePathFor } from "./homePath";
import { useAuth } from "./useAuth";

interface RequireAuthProps {
  /** Roles that may enter. Leave out to allow anyone who is logged in. */
  roles?: readonly Role[];
  /** Privilege the page needs. Users without it see the 403 page. */
  privilege?: Privilege;
}

// Guards its child routes. The server still checks every request; this only decides what to show.
export const RequireAuth = ({ roles, privilege }: RequireAuthProps) => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the page-load check, or a refresh would send logged-in users to /login.
  if (isLoading) return <LoadingState label={t("common.loading")} minHeight="100vh" />;

  // "from" lets the login page send the user back here afterwards.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;

  if (privilege && !user.privileges.includes(privilege)) return <ForbiddenPage />;

  return <Outlet />;
};
