import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";

// Stands in for a therapist page until its screen is built.
export const PageNotReady = () => {
  const { t } = useTranslation();

  return <EmptyState title={t("therapist.pageNotReady")} />;
};
