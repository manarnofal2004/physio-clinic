// Clinic-time helpers. Days ("YYYY-MM-DD") and clock times ("HH:mm") are in the
// clinic timezone; everything stored in the database is a UTC Date.

// Minutes the zone is ahead of UTC at that moment (Asia/Hebron: +120 or +180).
function zoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return Math.round((asUtc - date.getTime()) / 60_000);
}

// The UTC moment of a clinic-time day and clock time: ("2026-11-02", "08:00") -> 06:00Z.
export function zonedTime(day: string, time: string, timeZone: string): Date {
  const naive = new Date(`${day}T${time}:00Z`);
  const offset = zoneOffsetMinutes(naive, timeZone);
  const guess = new Date(naive.getTime() - offset * 60_000);
  // Around a daylight-saving change the offset at the real moment can differ.
  const corrected = zoneOffsetMinutes(guess, timeZone);
  return corrected === offset ? guess : new Date(naive.getTime() - corrected * 60_000);
}

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Filter for a Date field between two clinic days, both included.
export function dayRangeFilter(from: string | undefined, to: string | undefined, timeZone: string) {
  if (!from && !to) return {};
  return {
    ...(from && { $gte: zonedTime(from, "00:00", timeZone) }),
    ...(to && { $lt: zonedTime(addDays(to, 1), "00:00", timeZone) }),
  };
}
