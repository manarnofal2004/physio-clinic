import type { ReactNode } from "react";
import { Box, Button, ButtonBase, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useNotify } from "@/components/notifications/useNotify";
import { AttachmentThumb } from "@/features/reports/FileUploader";
import { ProgressChip } from "@/features/reports/ProgressChip";
import { Part } from "@/features/reports/ReportDetailsPage";
import { formatDay } from "@/features/reports/format";
import { ApiError } from "@/lib/api/apiError";
import { fetchMyFileUrl, useMyReport } from "./api";

// One of the patient's reports: day, physiotherapist and progress at the top, then
// the diagnosis, plan, notes and files. Read only.
export const MyReportDetailsPage = () => {
  const { id = "" } = useParams();
  const { t, i18n } = useTranslation();
  const isRtl = useTheme().direction === "rtl";
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const report = useMyReport(id);
  const Back = isRtl ? ArrowRight : ArrowLeft;

  // Opened from the list: step back to it, on the same page (?page=2). Opened from a
  // saved link or a new tab, there is nothing to step back to, so go to the list.
  const goBack = () => {
    if (location.key === "default") navigate("/portal/reports");
    else navigate(-1);
  };

  // Open the tab at the click (browsers block tabs opened later), then fill it with
  // the file once it has arrived.
  const openFile = (fileId: string) => {
    const tab = window.open("", "_blank");
    void fetchMyFileUrl(fileId)
      .then((url) => {
        if (tab) tab.location.href = url;
      })
      .catch(() => {
        tab?.close();
        notify.error(t("reportsAdmin.errors.failed"));
      });
  };

  let body: ReactNode;
  if (report.isPending) {
    body = <LoadingState label={t("common.loading")} />;
  } else if (report.isError) {
    // NOT_FOUND: not one of this patient's reports (or a wrong link).
    const notFound = report.error instanceof ApiError && report.error.status === 404;
    body = notFound ? (
      <ErrorState
        title={t("portal.errors.report")}
        retryLabel={t("portal.reports.backToList")}
        onRetry={() => navigate("/portal/reports")}
      />
    ) : (
      <ErrorState
        title={t("portal.errors.reports")}
        retryLabel={t("portal.retry")}
        onRetry={() => void report.refetch()}
      />
    );
  } else {
    const r = report.data;
    body = (
      <>
        <Typography variant="h4" component="h1" sx={{ color: "primary.dark" }}>
          {formatDay(r.date, i18n.language)}
        </Typography>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mt: 1, mb: 3, alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
        >
          {r.therapistName && <Typography color="text.secondary">{r.therapistName}</Typography>}
          <ProgressChip progress={r.progress} />
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
                    onClick={() => openFile(file.id)}
                    sx={{
                      display: "block",
                      textAlign: "start",
                      borderRadius: 2,
                      "&:hover img": { opacity: 0.9 },
                    }}
                  >
                    <AttachmentThumb file={file} size={130} load={fetchMyFileUrl} />
                    <Typography variant="body2" noWrap dir="ltr" sx={{ mt: 0.5, maxWidth: 130 }}>
                      {file.filename}
                    </Typography>
                  </ButtonBase>
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      </>
    );
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Button onClick={goBack} startIcon={<Back size={18} />} sx={{ mb: 2 }}>
        {t("portal.reports.backToList")}
      </Button>
      {body}
    </Box>
  );
};
