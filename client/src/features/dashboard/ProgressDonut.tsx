import { Box, Stack, Typography, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ReportProgress } from "@shared/api-types";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { DashboardStats } from "./api";

// A ring with the share of improving reports in its middle, and beside it one row
// per state. Red and honey look alike to many colour-blind readers, so every slice
// is named in its row with an arrow, its count and its share: colour is never the
// only clue. A gap separates the slices.
export const ProgressDonut = ({ counts }: { counts: DashboardStats["progressCounts"] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const total = counts.improving + counts.stable + counts.worse;

  if (total === 0) return <EmptyState title={t("dashboard.progress.empty")} />;

  const rows: { key: ReportProgress; color: string; icon: ReactNode }[] = [
    { key: "improving", color: theme.palette.primary.main, icon: <TrendingUp size={16} /> },
    { key: "stable", color: theme.palette.warning.main, icon: <Minus size={16} /> },
    { key: "worse", color: theme.palette.error.main, icon: <TrendingDown size={16} /> },
  ];
  const percent = (n: number) => Math.round((n / total) * 100);

  return (
    <Stack
      direction={{ xs: "column", sm: "row", md: "column", xl: "row" }}
      sx={{ alignItems: "center", gap: 2.5 }}
    >
      <Box sx={{ position: "relative", width: 156, height: 156, flexShrink: 0 }}>
        <PieChart
          width={156}
          height={156}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          hideLegend
          series={[
            {
              data: rows.map((r) => ({
                id: r.key,
                value: counts[r.key],
                label: t(`reportsAdmin.progress.${r.key}`),
                color: r.color,
              })),
              innerRadius: 54,
              outerRadius: 76,
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: { fade: "global", highlight: "item" },
            },
          ]}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeContent: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Redaction", "El Messiri", serif',
              fontStyle: "italic",
              fontSize: "1.75rem",
              lineHeight: 1,
              color: "primary.dark",
            }}
          >
            {percent(counts.improving)}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("reportsAdmin.progress.improving")}
          </Typography>
        </Box>
      </Box>

      <Stack component="ul" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0, width: "100%" }}>
        {rows.map(({ key, color, icon }) => (
          <Stack component="li" key={key} direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Box
              aria-hidden
              sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: color, flexShrink: 0 }}
            />
            <Box aria-hidden sx={{ display: "flex", color: "text.secondary" }}>
              {icon}
            </Box>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {t(`reportsAdmin.progress.${key}`)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {counts[key]}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: "3em", textAlign: "end" }}
            >
              {percent(counts[key])}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
