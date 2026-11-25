import { useState } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import dayjs, { type Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import type { Reservation, Therapist } from "@shared/api-types";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { TherapistAvatar } from "@/features/therapists/TherapistAvatar";
import { useMonthSessions } from "./api";
import { clinicDay, clinicTime } from "./format";

// A day in the calendar, with a small honey dot when it has sessions.
const DayWithDot = (props: PickerDayProps & { marked?: Set<string> }) => {
  const { marked, day, outsideCurrentMonth, ...other } = props;
  const has =
    !outsideCurrentMonth && Boolean(marked?.has(dayjs(day as Dayjs).format("YYYY-MM-DD")));
  return (
    <PickerDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      sx={{
        position: "relative",
        // A small honey dot under the number.
        ...(has && {
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: "warning.main",
          },
          "&.Mui-selected::after": { bgcolor: "primary.contrastText" },
        }),
      }}
    />
  );
};

const Session = ({ r, therapist }: { r: Reservation; therapist?: Therapist }) => {
  const { t } = useTranslation();
  const waiting = r.status === "pending";
  return (
    <Stack
      component="li"
      direction="row"
      sx={{
        gap: 1.25,
        alignItems: "center",
        py: 1,
        "& + &": { borderTop: 1, borderColor: "divider" },
      }}
    >
      <Typography
        dir="ltr"
        sx={{
          fontWeight: 600,
          minWidth: "3.2em",
          color: "primary.dark",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {clinicTime(r.scheduledAt)}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {r.fullName}
        </Typography>
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, mt: 0.25 }}>
          {therapist ? (
            <>
              <TherapistAvatar therapist={therapist} size={20} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {therapist.fullName}
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t("dashboard.schedule.noTherapist")}
            </Typography>
          )}
        </Stack>
      </Box>
      <Chip
        size="small"
        label={waiting ? t("dashboard.schedule.waiting") : t("dashboard.schedule.confirmed")}
        sx={{
          fontWeight: 500,
          bgcolor: waiting ? "transparent" : "action.selected",
          color: waiting ? "warning.dark" : "primary.dark",
          border: waiting ? 1 : 0,
          borderColor: "warning.main",
        }}
      />
    </Stack>
  );
};

// The clinic's calendar and the sessions of the chosen day: waiting requests and
// confirmed sessions, each with its physiotherapist.
export const ScheduleRail = ({ therapists }: { therapists: Therapist[] }) => {
  const { t, i18n } = useTranslation();
  const [day, setDay] = useState<Dayjs>(() => dayjs(clinicDay(new Date())));
  const [month, setMonth] = useState(() => day.format("YYYY-MM"));
  const sessions = useMonthSessions(month, true);

  const byDay = new Map<string, Reservation[]>();
  for (const r of sessions.data ?? []) {
    const key = clinicDay(r.scheduledAt);
    byDay.set(key, [...(byDay.get(key) ?? []), r]);
  }
  const chosen = byDay.get(day.format("YYYY-MM-DD")) ?? [];
  const therapistById = new Map(therapists.map((th) => [th.id, th]));
  const dayTitle = new Intl.DateTimeFormat(i18n.language === "ar" ? "ar-u-nu-latn" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(day.toDate());

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="dash-schedule"
      sx={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}
    >
      <DateCalendar
        value={day}
        onChange={(d) => d && setDay(d)}
        onMonthChange={(m) => setMonth(m.format("YYYY-MM"))}
        // The clinic is closed on Fridays and Saturdays.
        shouldDisableDate={(d) => d.day() === 5 || d.day() === 6}
        slots={{ day: DayWithDot }}
        // The dot needs the days with sessions; MUI passes extra day props through.
        slotProps={{ day: { marked: new Set(byDay.keys()) } as unknown as PickerDayProps }}
        sx={{
          width: "100%",
          maxWidth: 340,
          height: "auto",
          mx: "auto",
          "& .MuiDayCalendar-slideTransition": { minHeight: 220 },
        }}
      />

      <Box sx={{ px: 2.25, pb: 2, borderTop: 1, borderColor: "divider", pt: 1.75 }}>
        <Typography
          id="dash-schedule"
          component="h2"
          sx={{ fontSize: "1.05rem", fontWeight: 600, color: "primary.dark" }}
        >
          {t("dashboard.schedule.title", { day: dayTitle })}
        </Typography>
        {sessions.isPending ? (
          <LoadingState label={t("common.loading")} minHeight={120} />
        ) : sessions.isError && !sessions.data ? (
          // Without this, a failed request would read as "no sessions on this day".
          <Box sx={{ mt: 1 }}>
            <ErrorState
              title={t("dashboard.schedule.error")}
              retryLabel={t("dashboard.retry")}
              onRetry={() => void sessions.refetch()}
            />
          </Box>
        ) : chosen.length === 0 ? (
          <EmptyState title={t("dashboard.schedule.empty")} />
        ) : (
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 1 }}>
            {chosen.map((r) => (
              <Session
                key={r.id}
                r={r}
                therapist={r.therapistId ? therapistById.get(r.therapistId) : undefined}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};
