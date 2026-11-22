// The clinic's time zone (see the note at the top of shared/api-types.ts).
const CLINIC_TIME_ZONE = "Asia/Hebron";

const formatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: CLINIC_TIME_ZONE,
});

// A UTC moment from the server as "HH:MM" in clinic time,
// e.g. "2026-11-02T06:45:00.000Z" -> "08:45".
export const clinicTime = (iso: string) => formatter.format(new Date(iso));

// Minutes since midnight in clinic time, e.g. "08:45" -> 525.
// Used to place a session on the day's timeline.
export const clinicMinutes = (iso: string) => {
  const [hours = 0, minutes = 0] = clinicTime(iso).split(":").map(Number);
  return hours * 60 + minutes;
};
