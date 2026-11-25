import type { ReactNode } from "react";
import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Section } from "@/features/patients/PatientDetailsPage";
import { formatDay } from "@/features/reports/format";
import { ApiError } from "@/lib/api/apiError";
import { useMyPatient } from "./api";

// "My profile": the patient's own record, read only. The staff notes are left out,
// because they are written for the clinic, not for the patient.
export const MyProfilePage = () => {
  const { t, i18n } = useTranslation();
  const patient = useMyPatient();

  let body: ReactNode;
  if (patient.isPending) {
    body = <LoadingState label={t("common.loading")} />;
  } else if (patient.isError) {
    // NOT_FOUND: no patient record is linked to this account, or the clinic hid it.
    // Trying again would not help, so that message has no button.
    const noRecord = patient.error instanceof ApiError && patient.error.status === 404;
    body = noRecord ? (
      <ErrorState title={t("portal.errors.noRecord")} />
    ) : (
      <ErrorState
        title={t("portal.errors.profile")}
        retryLabel={t("portal.retry")}
        onRetry={() => void patient.refetch()}
      />
    );
  } else {
    const p = patient.data;
    body = (
      <Section title={p.fullName}>
        <Box sx={{ mb: 2.5 }}>
          <Chip
            size="small"
            variant="outlined"
            color={p.status === "active" ? "primary" : "default"}
            label={t(`patientsAdmin.statuses.${p.status}`)}
          />
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          <Field label={t("patientsAdmin.phone")}>
            <span dir="ltr">{p.phone}</span>
          </Field>
          <Field label={t("patientsAdmin.age")}>{p.age}</Field>
          <Field label={t("patientsAdmin.gender")}>{t(`patientsAdmin.genders.${p.gender}`)}</Field>
          <Field label={t("patientsAdmin.lastVisit")}>
            {p.lastVisit ? formatDay(p.lastVisit, i18n.language) : t("patientsAdmin.noVisit")}
          </Field>
          <Field label={t("portal.profile.since")}>{formatDay(p.createdAt, i18n.language)}</Field>
          {p.address && <Field label={t("patientsAdmin.address")}>{p.address}</Field>}
          <Field label={t("patientsAdmin.condition")} wide>
            {p.condition}
          </Field>
        </Box>
      </Section>
    );
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      <PageHeader title={t("portal.profile.title")} subtitle={t("portal.profile.subtitle")} />
      {body}
    </Box>
  );
};
