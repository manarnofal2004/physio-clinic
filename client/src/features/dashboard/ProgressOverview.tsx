import { Box, Stack, Typography } from "@mui/material";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ReportProgress } from "@shared/api-types";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { DashboardStats } from "./api";

// Each state has its own row with a name and an arrow, so it never depends on
// colour alone: red and honey look the same to many colour-blind readers.
const ROWS: { key: ReportProgress; color: string; icon: ReactNode }[] = [
  { key: "improving", color: "primary.main", icon: <TrendingUp size={18} /> },
  { key: "stable", color: "warning.main", icon: <Minus size={18} /> },
  { key: "worse", color: "error.main", icon: <TrendingDown size={18} /> },
];

export const ProgressOverview = ({ counts }: { counts: DashboardStats["progressCounts"] }) => {
  const { t } = useTranslation();
  const total = counts.improving + counts.stable + counts.worse;

  if (total === 0) return <EmptyState title={t("dashboard.progress.empty")} />;

  const percent = (n: number) => Math.round((n / total) * 100);

  return (
    <Stack spacing={2.5}>
      {/* The headline: one number for the whole picture. */}
      <Box>
        <Typography
          component="p"
          sx={{
            fontFamily: '"Redaction", "El Messiri", serif',
            fontStyle: "italic",
            fontSize: "2.6rem",
            lineHeight: 1.1,
            color: "primary.dark",
          }}
        >
          {percent(counts.improving)}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.progress.headline")}
        </Typography>
      </Box>

      <Stack component="ul" spacing={1.75} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {ROWS.map(({ key, color, icon }) => (
          <Box component="li" key={key}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 0.75 }}>
              <Box sx={{ color, display: "flex" }} aria-hidden>
                {icon}
              </Box>
              <Typography sx={{ flex: 1 }}>{t(`reportsAdmin.progress.${key}`)}</Typography>
              <Typography sx={{ fontWeight: 600 }}>{counts[key]}</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: "3.2em", textAlign: "end" }}
              >
                {percent(counts[key])}%
              </Typography>
            </Stack>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  width: `${percent(counts[key])}%`,
                  minWidth: counts[key] ? 4 : 0,
                  bgcolor: color,
                  borderRadius: 4,
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
};
