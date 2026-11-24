import { useState, type ReactNode } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, CircleCheck, Eye, EyeOff, Pencil, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { formatDay } from "@/features/reports/format";
import { usePatient, usePatientMutations } from "./api";
import { PatientDialog } from "./PatientDialog";

// One item of the profile: a small label above its value. "wide" takes the full row.
const Field = ({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) => (
  <Box sx={wide ? { gridColumn: "1 / -1" } : undefined}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>
      {label}
    </Typography>
    <Typography component="div" sx={{ fontWeight: 500, whiteSpace: "pre-wrap" }}>
      {children}
    </Typography>
  </Box>
);

// A white card with a heading, used for the profile and the reports.
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box
    sx={{
      p: { xs: 2.5, md: 3.5 },
      borderRadius: 3,
      bgcolor: "background.paper",
      border: 1,
      borderColor: "divider",
    }}
  >
    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Box>
);

// One patient: name and status at the top, then the profile and, from Phase 4, their
// reports. Users with "edit patients" can edit the profile here.
export const PatientDetailsPage = () => {
  const { id = "" } = useParams();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = useTheme().direction === "rtl";
  const navigate = useNavigate();
  const notify = useNotify();
  const { user } = useAuth();
  const canEdit = Boolean(user?.privileges.includes("patients.edit"));
  const patient = usePatient(id);
  const [editing, setEditing] = useState(false);
  const [hiding, setHiding] = useState(false);
  const { setStatus, setHidden } = usePatientMutations();
  const isAdmin = user?.role === "admin";
  // The list this patient was opened from (/admin/patients or /therapist/patients).
  const listPath = pathname.replace(/\/[^/]+$/, "");
  const Back = isRtl ? ArrowRight : ArrowLeft;

  if (patient.isPending) return <LoadingState label={t("common.loading")} />;
  // The server answers 404 for a patient outside the user's scope, too.
  if (patient.isError)
    return (
      <ErrorState
        title={t("patientsAdmin.errors.notFound")}
        retryLabel={t("patientsAdmin.backToList")}
        onRetry={() => navigate(listPath)}
      />
    );

  const p = patient.data;
  const isActive = p.status === "active";

  // The button works both ways: a completed patient can come back to treatment.
  const toggleStatus = () =>
    setStatus.mutate(
      { id: p.id, status: isActive ? "completed" : "active" },
      {
        onSuccess: () => notify.success(t("patientsAdmin.statusChanged")),
        onError: () => notify.error(t("patientsAdmin.errors.failed")),
      },
    );

  // Hiding asks first (the dialog below); showing again does not, it is harmless.
  const changeHidden = (isHidden: boolean) =>
    setHidden.mutate(
      { id: p.id, isHidden },
      {
        onSuccess: () => {
          setHiding(false);
          notify.success(t(isHidden ? "patientsAdmin.hiddenDone" : "patientsAdmin.shownDone"));
        },
        onError: () => notify.error(t("patientsAdmin.errors.failed")),
      },
    );

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Button component={RouterLink} to={listPath} startIcon={<Back size={18} />} sx={{ mb: 2 }}>
        {t("patientsAdmin.backToList")}
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" }, mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: "primary.dark" }}>
            {p.fullName}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
            <Chip
              size="small"
              variant="outlined"
              color={p.status === "active" ? "primary" : "default"}
              label={t(`patientsAdmin.statuses.${p.status}`)}
            />
            {p.isHidden && (
              <Chip size="small" color="warning" label={t("patientsAdmin.hiddenChip")} />
            )}
            {p.hasAccount && <Chip size="small" label={t("patientsAdmin.hasAccount")} />}
          </Stack>
        </Box>
        {canEdit && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: "wrap", rowGap: 1, alignSelf: { xs: "flex-start", sm: "auto" } }}
          >
            <Button
              variant="outlined"
              startIcon={<Pencil size={16} />}
              onClick={() => setEditing(true)}
            >
              {t("patientsAdmin.editAction")}
            </Button>
            <Button
              variant="outlined"
              startIcon={isActive ? <CircleCheck size={16} /> : <RotateCcw size={16} />}
              onClick={toggleStatus}
              disabled={setStatus.isPending}
            >
              {t(isActive ? "patientsAdmin.markCompleted" : "patientsAdmin.markActive")}
            </Button>
            {isAdmin && (
              <Button
                color={p.isHidden ? "primary" : "error"}
                startIcon={p.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                onClick={() => (p.isHidden ? changeHidden(false) : setHiding(true))}
                disabled={setHidden.isPending}
              >
                {t(p.isHidden ? "patientsAdmin.unhide" : "patientsAdmin.hide")}
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      <Stack spacing={3}>
        <Section title={t("patientsAdmin.profile")}>
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
            <Field label={t("patientsAdmin.gender")}>
              {t(`patientsAdmin.genders.${p.gender}`)}
            </Field>
            <Field label={t("patientsAdmin.lastVisit")}>
              {p.lastVisit ? formatDay(p.lastVisit, i18n.language) : t("patientsAdmin.noVisit")}
            </Field>
            <Field label={t("patientsAdmin.createdAt")}>
              {formatDay(p.createdAt, i18n.language)}
            </Field>
            {p.address && <Field label={t("patientsAdmin.address")}>{p.address}</Field>}
            <Field label={t("patientsAdmin.condition")} wide>
              {p.condition}
            </Field>
            {p.notes && (
              <Field label={t("patientsAdmin.notes")} wide>
                {p.notes}
              </Field>
            )}
          </Box>
        </Section>

        <Section title={t("patientsAdmin.reports")}>
          <EmptyState title={t("patientsAdmin.reportsSoon")} />
        </Section>
      </Stack>

      {editing && (
        <PatientDialog
          patient={p}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            notify.success(t("patientsAdmin.saved"));
          }}
        />
      )}
      <ConfirmDialog
        open={hiding}
        title={t("patientsAdmin.hideTitle")}
        message={t("patientsAdmin.hideMessage")}
        confirmLabel={t("patientsAdmin.hide")}
        cancelLabel={t("patientsAdmin.cancel")}
        destructive
        loading={setHidden.isPending}
        onCancel={() => setHiding(false)}
        onConfirm={() => changeHidden(true)}
      />
    </Box>
  );
};
