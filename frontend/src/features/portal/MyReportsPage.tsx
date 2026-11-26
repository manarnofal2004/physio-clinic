import type { ReactNode } from "react";
import { Box, ButtonBase, Pagination, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressChip } from "@/features/reports/ProgressChip";
import { formatDay } from "@/features/reports/format";
import { useMyReports } from "./api";

// "My reports": the patient's session reports, newest first, one card each. A card
// opens the full report.
export const MyReportsPage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = useTheme().direction === "rtl";
  const [searchParams, setSearchParams] = useSearchParams();
  // The page number lives in the address (?page=2), so coming back from a report
  // returns to the same page. A missing or broken value means page 1.
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const reports = useMyReports(page);
  // The arrow points the way the page reads: right in English, left in Arabic.
  const Arrow = isRtl ? ChevronLeft : ChevronRight;

  let body: ReactNode;
  if (reports.isPending) {
    body = <LoadingState label={t("common.loading")} />;
  } else if (reports.isError) {
    body = (
      <ErrorState
        title={t("portal.errors.reports")}
        retryLabel={t("portal.retry")}
        onRetry={() => void reports.refetch()}
      />
    );
  } else if (reports.data.data.length === 0) {
    body = (
      <EmptyState title={t("portal.reports.none")} description={t("portal.reports.noneHint")} />
    );
  } else {
    const { data: list, meta } = reports.data;
    body = (
      <>
        <Stack spacing={1.5}>
          {list.map((r) => (
            <ButtonBase
              key={r.id}
              component={RouterLink}
              to={`/portal/reports/${r.id}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
                p: 2.5,
                textAlign: "start",
                borderRadius: 3,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                transition: "border-color 150ms ease",
                "&:hover": { borderColor: "primary.main" },
                "&.Mui-focusVisible": { outline: 2, outlineColor: "primary.main" },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5, mb: 0.75 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {formatDay(r.date, i18n.language)}
                  </Typography>
                  {r.therapistName && (
                    <Typography color="text.secondary">· {r.therapistName}</Typography>
                  )}
                  <ProgressChip progress={r.progress} />
                </Stack>
                <Typography color="text.secondary" noWrap>
                  {r.diagnosis}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  display: { xs: "none", sm: "block" },
                  color: "primary.main",
                  fontWeight: 600,
                }}
              >
                {t("portal.reports.open")}
              </Typography>
              <Box sx={{ display: "flex", color: "primary.main" }}>
                <Arrow size={20} />
              </Box>
            </ButtonBase>
          ))}
        </Stack>
        {meta.totalPages > 1 && (
          <Pagination
            count={meta.totalPages}
            page={page}
            onChange={(_, value) => setSearchParams({ page: String(value) })}
            color="primary"
            sx={{ mt: 3, "& ul": { justifyContent: "center" } }}
          />
        )}
      </>
    );
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      <PageHeader title={t("portal.reports.title")} subtitle={t("portal.reports.subtitle")} />
      {body}
    </Box>
  );
};
