import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAuth } from "@/features/auth/useAuth";

export const TherapistHomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <EmptyState
      title={t("therapist.welcome", { name: user?.fullName })}
      description={t("therapist.welcomeText")}
    />
  );
};
