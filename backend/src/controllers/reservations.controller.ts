import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { currentUser } from "../middleware/auth.js";
import { Reservation } from "../models/reservation.model.js";
import { Therapist } from "../models/therapist.model.js";
import {
  createReservation,
  findReservationFor,
  reservationAccessFilter,
  toReservationDto,
} from "../services/reservations.service.js";
import { assertBookableTime, isTherapistFree } from "../services/schedule.service.js";
import { AppError } from "../utils/app-error.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import { dayRangeFilter } from "../utils/time.js";
import type {
  ListReservationsQuery,
  ReservationBody,
  UpdateReservationBody,
} from "../validators/reservations.validators.js";

export const listReservations: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const query = req.query as unknown as ListReservationsQuery;
  const range = dayRangeFilter(query.from, query.to, env.CLINIC_TIMEZONE);

  const filter = {
    $and: [
      reservationAccessFilter(user),
      query.status ? { status: query.status } : {},
      query.therapistId ? { therapistId: query.therapistId } : {},
      query.mine ? { therapistId: user.therapistId } : {},
      Object.keys(range).length > 0 ? { scheduledAt: range } : {},
    ],
  };
  const [reservations, total] = await Promise.all([
    Reservation.find(filter)
      .sort(query.sort)
      .skip(getSkip(query.page, query.limit))
      .limit(query.limit),
    Reservation.countDocuments(filter),
  ]);
  sendSuccess(
    res,
    reservations.map((r) => toReservationDto(r, user)),
    { meta: buildPaginationMeta(query.page, query.limit, total) },
  );
};

// Reservations moved on a given clinic day, for the "rescheduling news" component.
export const listReschedules: RequestHandler = async (req, res) => {
  const { date } = req.query as { date: string };
  const moved = await Reservation.find({
    rescheduledAt: dayRangeFilter(date, date, env.CLINIC_TIMEZONE),
  }).sort({ rescheduledAt: -1 });

  sendSuccess(
    res,
    moved.map((r) => ({
      reservationId: r.id as string,
      previousScheduledAt: r.previousScheduledAt,
      scheduledAt: r.scheduledAt,
      rescheduledAt: r.rescheduledAt,
    })),
  );
};

export const getReservation: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const reservation = await findReservationFor(user, req.params.id as string);
  sendSuccess(res, toReservationDto(reservation, user));
};

export const postReservation: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const reservation = await createReservation(req.body as ReservationBody, user);
  sendSuccess(res, toReservationDto(reservation, user), { status: 201 });
};

// A therapist accepts a pending request for themselves.
export const takeReservation: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  if (!user.therapistId) {
    throw new AppError(400, "VALIDATION_ERROR", "Only therapist accounts can take reservations");
  }
  // Anyone who can take requests may see pending ones. If someone else took it first,
  // say so (CONFLICT) instead of FORBIDDEN, so the screen can explain what happened.
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError(404, "NOT_FOUND", "Reservation not found");
  if (reservation.status !== "pending") {
    throw new AppError(409, "CONFLICT", "This reservation is no longer pending");
  }
  if (reservation.scheduledAt <= new Date()) {
    throw new AppError(409, "SLOT_UNAVAILABLE", "This time has already passed");
  }
  if (!(await isTherapistFree(user.therapistId, reservation.scheduledAt, reservation.id))) {
    throw new AppError(409, "SLOT_UNAVAILABLE", "You are not free at this time");
  }

  const { adminNotes } = req.body as { adminNotes?: string | null };
  reservation.set({
    status: "accepted",
    therapistId: user.therapistId,
    reviewedAt: new Date(),
    ...(adminNotes !== undefined && { adminNotes }),
  });
  await reservation.save();
  sendSuccess(res, toReservationDto(reservation, user));
};

// Staff with reservations.manage: accept, reject, cancel, assign a therapist, reschedule.
export const updateReservation: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const reservation = await findReservationFor(user, req.params.id as string);
  const body = req.body as UpdateReservationBody;
  const now = new Date();

  const scheduledAt = body.scheduledAt ?? reservation.scheduledAt;
  const status = body.status ?? reservation.status;
  const therapistId = body.therapistId === undefined ? reservation.therapistId : body.therapistId;
  const moved = scheduledAt.getTime() !== reservation.scheduledAt.getTime();

  // Rescheduling follows the same rules as booking.
  if (moved) assertBookableTime(scheduledAt, now);

  if (therapistId && !(await Therapist.exists({ _id: therapistId }))) {
    throw new AppError(404, "NOT_FOUND", "Therapist not found");
  }
  if (status === "accepted") {
    if (!therapistId) {
      throw new AppError(400, "VALIDATION_ERROR", "Choose a therapist to accept this reservation", [
        { field: "body.therapistId", message: "Required when accepting" },
      ]);
    }
    const needsCheck = moved || reservation.status !== "accepted" || body.therapistId !== undefined;
    if (needsCheck && !(await isTherapistFree(therapistId, scheduledAt, reservation.id))) {
      throw new AppError(409, "SLOT_UNAVAILABLE", "This therapist is not free at this time");
    }
  }

  if (status !== reservation.status) reservation.reviewedAt = now;
  if (moved) {
    reservation.previousScheduledAt = reservation.scheduledAt;
    reservation.rescheduledAt = now;
  }
  reservation.set({
    scheduledAt,
    status,
    therapistId,
    ...(body.adminNotes !== undefined && { adminNotes: body.adminNotes }),
  });
  await reservation.save();
  sendSuccess(res, toReservationDto(reservation, user));
};
