import { useState } from "react";
import { Box, Button, ButtonBase, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useNotify } from "@/components/notifications/useNotify";
import { useAuth } from "@/features/auth/useAuth";
import { useTherapistOptions } from "@/features/users/api";
import { fetchFileUrl, useReport, useReportMutations } from "./api";
import { AttachmentThumb } from "./FileUploader";
import { ProgressChip } from "./ProgressChip";
import { ReportDialog } from "./ReportDialog";
import { formatDay } from "./format";

// A labelled block of the report's text, keeping the line breaks it was written with.
const Part = ({ label, text }: { label: string; text: string }) => (
  <Box>
    <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: 700, mb: 0.5 }}>
      {label}
    </Typography>
    <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>{text}</Typography>
  </Box>
);

// One report: patient, day, physiotherapist and progress at the top, then the
// diagnosis, treatment plan and notes, and the attached files, each opening in a new
// tab. Users with "write reports" can edit or delete it.
export const ReportDetailsPage = () => {
  const { id = "" } = useParams();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = useTheme().direction === "rtl";
  const navigate = useNavigate();
  const notify = useNotify();
  const { user } = useAuth();
  const canEdit = Boolean(user?.privileges.includes("reports.edit"));
  const report = useReport(id);
  const therapists = useTherapistOptions();
  const { remove } = useReportMutations();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // The list this report was opened from (/admin/reports or /therapist/reports).
  const listPath = pathname.replace(/\/[^/]+$/, "");
  const Back = isRtl ? ArrowRight : ArrowLeft;

  if (report.isPending) return <LoadingState label={t("common.loading")} />;
  if (report.isError)
    return (
      <ErrorState
        title={t("reportsAdmin.errors.notFound")}
        retryLabel={t("reportsAdmin.backToList")}
        onRetry={() => navigate(listPath)}
      />
    );

  const r = report.data;
  const therapist = therapists.data?.find((x) => x.id === r.therapistId);
  const open = (fileId: string) => {
    // Open the tab now (browsers block tabs opened later), then fill it with the file.
    const tab = window.open("", "_blank");
    void fetchFileUrl(fileId)
      .then((url) => {
        if (tab) tab.location.href = url;
      })
      .catch(() => {
        tab?.close();
        notify.error(t("reportsAdmin.errors.failed"));
      });
  };

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Button component={RouterLink} to={listPath} startIcon={<Back size={18} />} sx={{ mb: 2 }}>
        {t("reportsAdmin.backToList")}
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" }, mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: "primary.dark" }}>
            {r.patient.fullName}
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 1, alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
          >
            <Typography color="text.secondary">{formatDay(r.date, i18n.language)}</Typography>
            {therapist && <Typography color="text.secondary">· {therapist.fullName}</Typography>}
            <ProgressChip progress={r.progress} />
          </Stack>
        </Box>
        {canEdit && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Pencil size={16} />}
              onClick={() => setEditing(true)}
            >
              {t("reportsAdmin.editAction")}
            </Button>
            <Button
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => setDeleting(true)}
            >
              {t("reportsAdmin.deleteAction")}
            </Button>
          </Stack>
        )}
      </Stack>

      <Stack
        spacing={3}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Part label={t("reportsAdmin.diagnosis")} text={r.diagnosis} />
        <Part label={t("reportsAdmin.plan")} text={r.treatmentPlan} />
        {r.sessionNotes && <Part label={t("reportsAdmin.notes")} text={r.sessionNotes} />}

        {r.attachments.length > 0 && (
          <Box>
            <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: 700, mb: 1 }}>
              {t("reportsAdmin.files.title")}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 1.5,
              }}
            >
              {r.attachments.map((file) => (
                <ButtonBase
                  key={file.id}
                  onClick={() => open(file.id)}
                  sx={{
                    display: "block",
                    textAlign: "start",
                    borderRadius: 2,
                    "&:hover img": { opacity: 0.9 },
                  }}
                >
                  <AttachmentThumb file={file} size={130} />
                  <Typography variant="body2" noWrap dir="ltr" sx={{ mt: 0.5, maxWidth: 130 }}>
                    {file.filename}
                  </Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        )}
      </Stack>

      {editing && (
        <ReportDialog
          report={r}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            notify.success(t("reportsAdmin.saved"));
          }}
        />
      )}
      <ConfirmDialog
        open={deleting}
        title={t("reportsAdmin.deleteTitle")}
        message={t("reportsAdmin.deleteMessage")}
        confirmLabel={t("reportsAdmin.deleteAction")}
        cancelLabel={t("reportsAdmin.cancel")}
        destructive
        loading={remove.isPending}
        onCancel={() => setDeleting(false)}
        onConfirm={() =>
          remove.mutate(r.id, {
            onSuccess: () => {
              notify.success(t("reportsAdmin.deleted"));
              navigate(listPath);
            },
            onError: () => notify.error(t("reportsAdmin.errors.failed")),
          })
        }
      />
    </Box>
  );
};
