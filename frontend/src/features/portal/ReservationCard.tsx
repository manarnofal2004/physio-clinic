import { Box, Chip, Stack, Typography } from "@mui/material";
import { CalendarClock, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Reservation, ReservationStatus } from "@shared/api-types";
import { clinicTime } from "@/features/dashboard/format";

// The chip colour for each status: honey while waiting, olive when confirmed, red when
// declined, grey when cancelled.
const STATUS_COLORS: Record<ReservationStatus, "warning" | "primary" | "error" | "default"> = {
  pending: "warning",
  accepted: "primary",
  rejected: "error",
  cancelled: "default",
};

// "Sun 30 Nov 2026": the clinic day a session falls on, in the page language with
// Latin digits.
const clinicDayLabel = (iso: string, language: string) =>
  new Intl.DateTimeFormat(language === "ar" ? "ar-u-nu-latn" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Hebron",
  }).format(new Date(iso));

// One of the patient's reservations: day and time in clinic time, its status, the old
// time if the clinic moved it, and the note the patient wrote when booking.
export const ReservationCard = ({ reservation: r }: { reservation: Reservation }) => {
  const { t, i18n } = useTranslation();
  const when = (iso: string) => `${clinicDayLabel(iso, i18n.language)}, ${clinicTime(iso)}`;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
      >
        <Box sx={{ display: "flex" }}>
          <CalendarClock size={20} />
        </Box>
        <Typography sx={{ fontWeight: 700 }}>{when(r.scheduledAt)}</Typography>
        <Chip
          size="small"
          variant="outlined"
          color={STATUS_COLORS[r.status]}
          label={t(`portal.reservations.statuses.${r.status}`)}
        />
      </Stack>

      {r.previousScheduledAt && (
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
          <Box sx={{ display: "flex" }}>
            <History size={16} />
          </Box>
          <Typography variant="body2" sx={{ color: "warning.dark" }}>
            {t("portal.reservations.movedFrom", { when: when(r.previousScheduledAt) })}
          </Typography>
        </Stack>
      )}

      {r.notes && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {t("portal.reservations.yourNote")}:
          </Box>{" "}
          {r.notes}
        </Typography>
      )}
    </Box>
  );
};
