import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { zonedTime } from "../utils/time.js";
import { createReservation, toReservationDto } from "../services/reservations.service.js";
import { availableSlots, dateOptions, todayOverview } from "../services/schedule.service.js";
import { sendSuccess } from "../utils/response.js";
import type { ReservationBody } from "../validators/reservations.validators.js";

export const getDateOptions: RequestHandler = async (_req, res) => {
  sendSuccess(res, await dateOptions(new Date()));
};

// Each free slot comes with its exact moment, so the client books with `scheduledAt`
// as given and never converts clinic time to UTC itself (daylight saving included).
export const getAvailability: RequestHandler = async (req, res) => {
  const { date } = req.query as { date: string };
  const times = await availableSlots(date, new Date());
  const slots = times.map((time) => ({
    time,
    scheduledAt: zonedTime(date, time, env.CLINIC_TIMEZONE),
  }));
  sendSuccess(res, { date, slots });
};

export const getToday: RequestHandler = async (_req, res) => {
  sendSuccess(res, await todayOverview(new Date()));
};

// Guests book without logging in; a valid patient token links the request to that user.
export const postPublicReservation: RequestHandler = async (req, res) => {
  const reservation = await createReservation(req.body as ReservationBody, req.user);
  sendSuccess(res, toReservationDto(reservation, req.user), { status: 201 });
};
