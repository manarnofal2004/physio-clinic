import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Bubble } from "./Bubble";

const PER_PAGE = 5; // one clinic week (Sunday to Thursday) at a time

interface DayPickerProps {
  days: string[]; // "YYYY-MM-DD", only the days open for booking
  value: string;
  onChange: (day: string) => void;
}

// A short day label such as "Sun 8" (UTC, so the calendar date never shifts).
const shortDay = (date: string, language: string) => {
  const day = new Date(`${date}T00:00:00Z`);
  const locale = language === "ar" ? "ar-u-nu-latn" : "en-GB";
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
    day,
  );
  return `${weekday} ${day.getUTCDate()}`;
};

// The open days as bubbles, five at a time, with arrows to the earlier and later ones.
export const DayPicker = ({ days, value, onChange }: DayPickerProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = useTheme().direction === "rtl";
  // Start on the page that holds the chosen day.
  const [page, setPage] = useState(() => Math.max(0, Math.floor(days.indexOf(value) / PER_PAGE)));
  const pages = Math.ceil(days.length / PER_PAGE);
  const shown = days.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const Prev = isRtl ? ChevronRight : ChevronLeft;
  const Next = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <IconButton
        size="small"
        aria-label={t("booking.earlierDays")}
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
      >
        <Prev size={18} />
      </IconButton>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
        {shown.map((day) => (
          <Bubble key={day} selected={day === value} onClick={() => onChange(day)}>
            {shortDay(day, i18n.language)}
          </Bubble>
        ))}
      </Box>
      <IconButton
        size="small"
        aria-label={t("booking.laterDays")}
        disabled={page >= pages - 1}
        onClick={() => setPage((p) => p + 1)}
      >
        <Next size={18} />
      </IconButton>
    </Box>
  );
};
