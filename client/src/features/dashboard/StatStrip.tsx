import type { ReactNode } from "react";
import { Box, Link, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { DashboardStats } from "./api";

const Stat = ({ label, value, note }: { label: string; value: number; note: ReactNode }) => (
  <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    {/* The big numbers use the site's italic heading face, like the section titles. */}
    <Typography
      sx={{
        fontFamily: '"Redaction", "El Messiri", serif',
        fontStyle: "italic",
        fontSize: { xs: "2.4rem", md: "2.8rem" },
        lineHeight: 1.15,
        color: "primary.dark",
        fontVariantNumeric: "lining-nums",
      }}
    >
      {value.toLocaleString("en-US")}
    </Typography>
    <Typography variant="body2" component="div" color="text.secondary">
      {note}
    </Typography>
  </Box>
);

// The three numbers at the top, side by side on one sheet with thin lines between
// them (stacked on phones).
export const StatStrip = ({
  stats,
  reservationsPath,
}: {
  stats: DashboardStats;
  /** Where "open reservations" goes, or nothing if the user cannot see them. */
  reservationsPath?: string;
}) => {
  const { t } = useTranslation();
  const thisMonth = stats.reportsOverTime.at(-1)?.count ?? 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
        // Thin lines between the numbers: across on phones, upright on wider screens.
        // The colour goes in each value, or the responsive border loses it.
        "& > * + *": (th) => ({
          borderTop: `1px solid ${th.palette.divider}`,
          [th.breakpoints.up("sm")]: {
            borderTop: "none",
            borderInlineStart: `1px solid ${th.palette.divider}`,
          },
        }),
      }}
    >
      <Stat
        label={t("dashboard.patients")}
        value={stats.totalPatients}
        note={t("dashboard.activePatients", { count: stats.activePatients })}
      />
      <Stat
        label={t("dashboard.reports")}
        value={stats.totalReports}
        note={t("dashboard.reportsThisMonth", { count: thisMonth })}
      />
      <Stat
        label={t("dashboard.pending")}
        value={stats.pendingReservations}
        note={
          stats.pendingReservations === 0 ? (
            t("dashboard.pendingNone")
          ) : reservationsPath ? (
            <Link component={RouterLink} to={reservationsPath} underline="hover">
              {t("dashboard.pendingOpen")}
            </Link>
          ) : (
            t("dashboard.pendingHint")
          )
        }
      />
    </Paper>
  );
};
