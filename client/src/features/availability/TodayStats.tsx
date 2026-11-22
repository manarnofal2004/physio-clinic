import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Activity, CalendarCheck, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TodayOverview } from "@shared/api-types";
import { clinicTime } from "./clinicTime";

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  highlight?: boolean;
}

// One big number with its label under it.
const StatCard = ({ icon, value, label, highlight }: StatCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: 3,
      display: "flex",
      flexDirection: "column",
      gap: 1,
      bgcolor: "background.paper",
      outline: highlight ? 2 : 0,
      outlineColor: "primary.main",
    }}
  >
    <Box sx={{ display: "flex", color: "warning.main" }}>{icon}</Box>
    <Typography
      sx={{
        fontSize: { xs: "2rem", md: "2.5rem" },
        fontWeight: 700,
        lineHeight: 1.1,
        color: "primary.dark",
      }}
    >
      {value}
    </Typography>
    <Typography color="text.secondary">{label}</Typography>
  </Paper>
);

// Three numbers about today: sessions running now, when the next one ends (or
// starts), and how many free times are left to book.
export const TodayStats = ({ overview }: { overview: TodayOverview }) => {
  const { t } = useTranslation();
  // Sessions come sorted by start time and all last 45 minutes,
  // so the first running one is the one that ends first.
  const firstRunning = overview.sessions.find((session) => session.state === "running");
  const nextUpcoming = overview.sessions.find((session) => session.state === "upcoming");

  // What the second card says depends on where the day is.
  let timeCard: { label: string; time: string };
  if (firstRunning) {
    timeCard = { label: t("availability.endsAt"), time: clinicTime(firstRunning.endsAt) };
  } else if (nextUpcoming) {
    timeCard = { label: t("availability.nextAt"), time: clinicTime(nextUpcoming.startsAt) };
  } else if (overview.sessions.length === 0) {
    // Nothing booked yet today, though free times may be left.
    timeCard = { label: t("availability.nothingBooked"), time: "--:--" };
  } else {
    timeCard = { label: t("availability.nothingLeft"), time: "--:--" };
  }

  return (
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
      <StatCard
        icon={<Activity />}
        value={overview.runningNow}
        label={t("availability.runningNow")}
        highlight={overview.runningNow > 0}
      />
      <StatCard
        icon={<Clock />}
        // Times read left to right in Arabic too.
        value={<bdi dir="ltr">{timeCard.time}</bdi>}
        label={timeCard.label}
      />
      <StatCard
        icon={<CalendarCheck />}
        value={overview.availableSlotsLeft}
        label={t("availability.freeLeft")}
      />
    </Box>
  );
};
