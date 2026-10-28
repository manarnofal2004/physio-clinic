import type { RequestHandler } from "express";
import { createReservation, toReservationDto } from "../services/reservations.service.js";
import { availableSlots, dateOptions, todayOverview } from "../services/schedule.service.js";
import { sendSuccess } from "../utils/response.js";
import type { ReservationBody } from "../validators/reservations.validators.js";

export const getDateOptions: RequestHandler = async (_req, res) => {
  sendSuccess(res, await dateOptions(new Date()));
};

export const getAvailability: RequestHandler = async (req, res) => {
  const { date } = req.query as { date: string };
  sendSuccess(res, { date, slots: await availableSlots(date, new Date()) });
};

export const getToday: RequestHandler = async (_req, res) => {
  sendSuccess(res, await todayOverview(new Date()));
};

// Guests book without logging in; a valid patient token links the request to that user.
export const postPublicReservation: RequestHandler = async (req, res) => {
  const reservation = await createReservation(req.body as ReservationBody, req.user);
  sendSuccess(res, toReservationDto(reservation, req.user), { status: 201 });
};
