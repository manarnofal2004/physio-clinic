import { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { Slot } from "@shared/api-types";
import { Bubble } from "./Bubble";

type Period = "morning" | "midday" | "evening";

// Which part of the day a "HH:MM" clinic time falls in.
const periodOf = (time: string): Period => {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return "morning";
  if (hour < 15) return "midday";
  return "evening";
};

interface TimePickerProps {
  slots: Slot[];
  value: string; // the chosen slot's scheduledAt
  onChange: (scheduledAt: string) => void;
}

// The free times of the chosen day as bubbles, split into morning, midday and evening
// so a long day does not show forty bubbles at once.
export const TimePicker = ({ slots, value, onChange }: TimePickerProps) => {
  const { t } = useTranslation();
  const periods = (["morning", "midday", "evening"] as const).filter((p) =>
    slots.some((slot) => periodOf(slot.time) === p),
  );
  const chosen = slots.find((slot) => slot.scheduledAt === value);
  const [period, setPeriod] = useState<Period | null>(null);
  // The chosen time's period, else the one picked, else the first with free times.
  const current =
    period && periods.includes(period) ? period : chosen ? periodOf(chosen.time) : periods[0];

  return (
    <Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={current}
        onChange={(_, next: Period | null) => next && setPeriod(next)}
        sx={{ mb: 1.25, "& .MuiToggleButton-root": { px: 1.75, py: 0.25, textTransform: "none" } }}
      >
        {periods.map((p) => (
          <ToggleButton key={p} value={p}>
            {t(`booking.periods.${p}`)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {slots
          .filter((slot) => periodOf(slot.time) === current)
          .map((slot) => (
            <Bubble
              key={slot.scheduledAt}
              selected={slot.scheduledAt === value}
              onClick={() => onChange(slot.scheduledAt)}
            >
              {/* Times read left to right in Arabic too. */}
              <bdi dir="ltr">{slot.time}</bdi>
            </Bubble>
          ))}
      </Box>
    </Box>
  );
};
