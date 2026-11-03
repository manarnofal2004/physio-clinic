import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { homePathFor } from "@/features/auth/homePath";
import { useAuth } from "@/features/auth/useAuth";

// Shown inside the panel layout when the user lacks the privilege for a page.
export const ForbiddenPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <EmptyState
      title={t("forbidden.title")}
      description={t("forbidden.description")}
      action={
        <Button component={Link} to={user ? homePathFor(user.role) : "/"} variant="contained">
          {t("forbidden.backHome")}
        </Button>
      }
    />
  );
};
