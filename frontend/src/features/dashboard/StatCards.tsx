import type { ReactNode } from "react";
import { AvatarGroup, Box, Link, Paper, Stack, Typography, useTheme } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { CalendarClock, ClipboardList, Stethoscope, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import type { Therapist } from "@shared/api-types";
import { TherapistAvatar } from "@/features/therapists/TherapistAvatar";
import { toMinutes } from "@/features/therapists/schedule";
import type { DashboardStats } from "./api";
import { clinicNow } from "./format";

const Card = ({
  icon,
  label,
  value,
  footer,
  aside,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  footer: ReactNode;
  aside?: ReactNode;
}) => (
  <Paper variant="outlined" sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 1.25 }}>
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 36,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          bgcolor: "action.selected",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
        {label}
      </Typography>
    </Stack>
    <Stack direction="row" sx={{ alignItems: "flex-end", justifyContent: "space-between", gap: 1 }}>
      <Typography
        sx={{
          fontFamily: '"Redaction", "El Messiri", serif',
          fontStyle: "italic",
          fontSize: "2.4rem",
          lineHeight: 1,
          color: "primary.dark",
        }}
      >
        {value.toLocaleString("en-US")}
      </Typography>
      {aside}
    </Stack>
    <Typography variant="body2" component="div" color="text.secondary">
      {footer}
    </Typography>
  </Paper>
);

// Who is working at this moment, by the clinic's clock and their weekly hours.
const onDutyNow = (therapists: Therapist[]) => {
  const now = clinicNow();
  return therapists.filter(
    (t) =>
      t.isActive &&
      t.schedule.some(
        (h) =>
          h.day === now.day && toMinutes(h.start) <= now.minutes && now.minutes < toMinutes(h.end),
      ),
  );
};

// The four numbers at the top, each on its own card.
export const StatCards = ({
  stats,
  therapists,
  reservationsPath,
}: {
  stats: DashboardStats;
  /** Every physiotherapist, or nothing if the user may not see them. */
  therapists?: Therapist[];
  reservationsPath?: string;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const thisMonth = stats.reportsOverTime.at(-1)?.count ?? 0;
  const onDuty = therapists ? onDutyNow(therapists) : null;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          lg: `repeat(${onDuty ? 4 : 3}, minmax(0, 1fr))`,
        },
      }}
    >
      <Card
        icon={<Users size={18} />}
        label={t("dashboard.patients")}
        value={stats.totalPatients}
        footer={t("dashboard.activePatients", { count: stats.activePatients })}
      />
      <Card
        icon={<ClipboardList size={18} />}
        label={t("dashboard.reports")}
        value={stats.totalReports}
        footer={t("dashboard.reportsThisMonth", { count: thisMonth })}
        aside={
          // The last 12 months as a small curve: the trend without the numbers.
          <Box inert sx={{ width: 84, height: 34, direction: "ltr" }}>
            <SparkLineChart
              data={stats.reportsOverTime.map((m) => m.count)}
              height={34}
              area
              curve="monotoneX"
              color={theme.palette.primary.main}
              sx={{ "& .MuiAreaElement-root, & [class*='area']": { fillOpacity: 0.18 } }}
            />
          </Box>
        }
      />
      <Card
        icon={<CalendarClock size={18} />}
        label={t("dashboard.pending")}
        value={stats.pendingReservations}
        footer={
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
      {onDuty && (
        <Card
          icon={<Stethoscope size={18} />}
          label={t("dashboard.onDuty")}
          value={onDuty.length}
          footer={t("dashboard.onDutyOf", { count: therapists?.filter((x) => x.isActive).length })}
          aside={
            onDuty.length > 0 && (
              <AvatarGroup
                max={4}
                sx={{ "& .MuiAvatar-root": { borderColor: "background.paper" } }}
              >
                {onDuty.map((th) => (
                  <TherapistAvatar key={th.id} therapist={th} size={30} />
                ))}
              </AvatarGroup>
            )
          }
        />
      )}
    </Box>
  );
};
