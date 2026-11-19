import type { Types } from "mongoose";
import { env } from "../config/env.js";
import {
  BOOKING_DAYS_AHEAD,
  CLINIC_CLOSES,
  CLINIC_OPENS,
  SESSION_MINUTES,
  SLOT_MINUTES,
  WORK_DAYS,
} from "../constants.js";
import { Reservation } from "../models/reservation.model.js";
import { Therapist, type TherapistDocument } from "../models/therapist.model.js";
import { AppError } from "../utils/app-error.js";
import {
  addDays,
  clinicDayAndTime,
  fromMinutes,
  toMinutes,
  weekdayOf,
  zonedTime,
} from "../utils/time.js";

// Booking rules, all in clinic time (see docs/api/reservations.md):
// - Sunday to Thursday, from today up to 30 days ahead.
// - A start time every 15 minutes; a session lasts 45 minutes and must end by closing time.
// - A therapist can take a session if it fits inside their working hours and no accepted
//   session of theirs starts less than 45 minutes before or after it.
// - A time is free when at least one active therapist can take it. Pending requests block nothing.

const tz = () => env.CLINIC_TIMEZONE;
const SESSION_MS = SESSION_MINUTES * 60_000;

export function clinicToday(now: Date): string {
  return clinicDayAndTime(now, tz()).day;
}

// Every start time of a clinic day: 08:00, 08:15, ... 18:15.
export function slotTimes(): string[] {
  const times: string[] = [];
  const last = toMinutes(CLINIC_CLOSES) - SESSION_MINUTES;
  for (let m = toMinutes(CLINIC_OPENS); m <= last; m += SLOT_MINUTES) times.push(fromMinutes(m));
  return times;
}

function isWorkDay(day: string): boolean {
  return (WORK_DAYS as readonly number[]).includes(weekdayOf(day));
}

function withinBookingWindow(day: string, now: Date): boolean {
  const today = clinicToday(now);
  return day >= today && day <= addDays(today, BOOKING_DAYS_AHEAD);
}

function worksAt(therapist: TherapistDocument, day: string, time: string): boolean {
  const start = toMinutes(time);
  const end = start + SESSION_MINUTES;
  return therapist.schedule.some(
    (block) =>
      block.day === weekdayOf(day) &&
      toMinutes(block.start) <= start &&
      end <= toMinutes(block.end),
  );
}

// Start times of accepted sessions per therapist, around the given moments.
async function acceptedSessions(from: Date, to: Date, excludeReservationId?: string) {
  const sessions = await Reservation.find(
    {
      status: "accepted",
      therapistId: { $ne: null },
      scheduledAt: {
        $gt: new Date(from.getTime() - SESSION_MS),
        $lt: new Date(to.getTime() + SESSION_MS),
      },
      ...(excludeReservationId && { _id: { $ne: excludeReservationId } }),
    },
    "therapistId scheduledAt",
  );
  const byTherapist = new Map<string, number[]>();
  for (const s of sessions) {
    const key = String(s.therapistId);
    byTherapist.set(key, [...(byTherapist.get(key) ?? []), s.scheduledAt.getTime()]);
  }
  return byTherapist;
}

function isBusy(starts: number[] | undefined, at: Date): boolean {
  return (starts ?? []).some((start) => Math.abs(start - at.getTime()) < SESSION_MS);
}

// Throws SLOT_UNAVAILABLE unless the moment is a real bookable start time (ignores therapists).
export function assertBookableTime(at: Date, now: Date): { day: string; time: string } {
  const { day, time } = clinicDayAndTime(at, tz());
  const onGrid =
    at.getUTCSeconds() === 0 && at.getUTCMilliseconds() === 0 && slotTimes().includes(time);
  if (!onGrid || !isWorkDay(day) || !withinBookingWindow(day, now) || at <= now) {
    throw new AppError(409, "SLOT_UNAVAILABLE", "This time cannot be booked");
  }
  return { day, time };
}

// Active therapists who can take a session at that moment.
export async function freeTherapists(
  at: Date,
  excludeReservationId?: string,
): Promise<TherapistDocument[]> {
  const { day, time } = clinicDayAndTime(at, tz());
  const [therapists, busy] = await Promise.all([
    Therapist.find({ isActive: true }).sort({ fullName: 1 }),
    acceptedSessions(at, at, excludeReservationId),
  ]);
  return therapists.filter((t) => worksAt(t, day, time) && !isBusy(busy.get(t.id as string), at));
}

export async function isTherapistFree(
  therapistId: Types.ObjectId | string,
  at: Date,
  excludeReservationId?: string,
): Promise<boolean> {
  const free = await freeTherapists(at, excludeReservationId);
  return free.some((t) => t._id.equals(therapistId));
}

// Bookable days: Sunday to Thursday within the window, on which at least one therapist works.
export async function dateOptions(now: Date): Promise<string[]> {
  const workingDays = new Set<number>(
    (await Therapist.find({ isActive: true }, "schedule")).flatMap((t) =>
      t.schedule.map((block) => block.day),
    ),
  );
  const today = clinicToday(now);
  const days: string[] = [];
  for (let i = 0; i <= BOOKING_DAYS_AHEAD; i++) {
    const day = addDays(today, i);
    if (isWorkDay(day) && workingDays.has(weekdayOf(day))) days.push(day);
  }
  return days;
}

// Free start times on a clinic day. Taken times are left out, not flagged.
export async function availableSlots(day: string, now: Date): Promise<string[]> {
  if (!isWorkDay(day) || !withinBookingWindow(day, now)) return [];

  const dayStart = zonedTime(day, CLINIC_OPENS, tz());
  const dayEnd = zonedTime(day, CLINIC_CLOSES, tz());
  const [therapists, busy] = await Promise.all([
    Therapist.find({ isActive: true }),
    acceptedSessions(dayStart, dayEnd),
  ]);

  return slotTimes().filter((time) => {
    const at = zonedTime(day, time, tz());
    if (at <= now) return false;
    return therapists.some((t) => worksAt(t, day, time) && !isBusy(busy.get(t.id as string), at));
  });
}

// For the landing page: today's accepted sessions without any personal data.
export async function todayOverview(now: Date) {
  const day = clinicToday(now);
  const sessions = await Reservation.find(
    {
      status: "accepted",
      scheduledAt: {
        $gte: zonedTime(day, "00:00", tz()),
        $lt: zonedTime(addDays(day, 1), "00:00", tz()),
      },
    },
    "scheduledAt",
  ).sort({ scheduledAt: 1 });

  const items = sessions.map(({ scheduledAt }) => {
    const endsAt = new Date(scheduledAt.getTime() + SESSION_MS);
    const state = endsAt <= now ? "done" : scheduledAt <= now ? "running" : "upcoming";
    return { startsAt: scheduledAt, endsAt, state };
  });

  return {
    date: day,
    now,
    runningNow: items.filter((s) => s.state === "running").length,
    sessions: items,
    availableSlotsLeft: (await availableSlots(day, now)).length,
  };
}
