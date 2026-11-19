import type { WorkDay } from "@shared/api-types";

export const DAYS: WorkDay[] = [0, 1, 2, 3, 4]; // Sunday to Thursday
export const OPEN = "08:00";
export const CLOSE = "19:00";

// Every quarter hour the clinic is open, for the start and end selects.
export const TIMES = Array.from({ length: (19 - 8) * 4 + 1 }, (_, i) => {
  const minutes = 8 * 60 + i * 15;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

export const toMinutes = (time: string) => {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
};

// Where a time sits across the clinic day, from 0 (opening) to 1 (closing).
export const position = (time: string) =>
  (toMinutes(time) - toMinutes(OPEN)) / (toMinutes(CLOSE) - toMinutes(OPEN));

// A day's name in the page language (4 January 2026 was a Sunday).
export const dayName = (day: number, language: string, width: "short" | "long") =>
  new Intl.DateTimeFormat(language, { weekday: width, timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, 0, 4 + day)),
  );
