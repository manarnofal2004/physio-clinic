import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ReportProgress } from "@shared/api-types";

// How the patient is doing: olive when improving, honey when stable, a muted red when
// worse.
const COLORS: Record<ReportProgress, string> = {
  improving: "primary.main",
  stable: "warning.main",
  worse: "error.main",
};

export const ProgressChip = ({
  progress,
  dotOnly,
}: {
  progress: ReportProgress;
  dotOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const dot = (
    <Box
      component="span"
      sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: COLORS[progress] }}
    />
  );
  if (dotOnly) return dot;
  return (
    <Chip
      size="small"
      icon={<Box sx={{ display: "flex", paddingInlineStart: "8px" }}>{dot}</Box>}
      label={t(`reportsAdmin.progress.${progress}`)}
      variant="outlined"
      sx={{ borderColor: "divider" }}
    />
  );
};
