// Helpers for the dashboard: month names, round chart tops and the clinic's clock.

const locale = (language: string) => (language === "ar" ? "ar-u-nu-latn" : "en-GB");

// "2026-10" → "Oct" / "October 2026", in the page language with Latin digits.
export const monthLabel = (month: string, language: string, long = false) =>
  new Intl.DateTimeFormat(locale(language), {
    month: long ? "long" : "short",
    ...(long && { year: "numeric" }),
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));

// The top of a chart's scale: a round number at or above the largest value
// (5, 10, 20, 50, 100...), so the grid lines read as plain numbers.
export const niceMax = (value: number) => {
  if (value <= 5) return 5;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * step >= value) return m * step;
  return 10 * step;
};

// The hour in the clinic (Asia/Hebron), whatever the computer's time zone.
export const clinicHour = (now = new Date()) =>
  Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Hebron",
    }).format(now),
  );

// The weekday (0 = Sunday) and minutes since midnight in the clinic right now.
export const clinicNow = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
    timeZone: "Asia/Hebron",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    day: days.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

// "09:30" for a session, in clinic time.
export const clinicTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Hebron",
  }).format(new Date(iso));

// "2026-11-16" for the clinic day a moment falls on.
export const clinicDay = (iso: string | Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Hebron" }).format(new Date(iso));

// "Monday, 16 November" in the clinic's time zone.
export const clinicToday = (language: string, now = new Date()) =>
  new Intl.DateTimeFormat(locale(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Hebron",
  }).format(now);

// Hidden from the eye but read by screen readers: the data tables behind the charts.
export const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;
