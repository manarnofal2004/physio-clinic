import { Router } from "express";
import {
  getReservation,
  listReservations,
  listReschedules,
  postReservation,
  takeReservation,
  updateReservation,
} from "../controllers/reservations.controller.js";
import { authenticate, authorize, requirePrivilege } from "../middleware/auth.js";
import { bookingLimiter } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import {
  dayQuery,
  listReservationsQuery,
  reservationBody,
  takeReservationBody,
  updateReservationBody,
} from "../validators/reservations.validators.js";

// Who sees what is decided per request (patients: their own; staff: by privilege).
export const reservationsRouter = Router();

reservationsRouter.use(authenticate);

reservationsRouter.get("/", validate({ query: listReservationsQuery }), listReservations);
reservationsRouter.get(
  "/reschedules",
  requirePrivilege("reservations.view"),
  validate({ query: dayQuery }),
  listReschedules,
);
reservationsRouter.get("/:id", validate({ params: idParams }), getReservation);
reservationsRouter.post(
  "/",
  authorize("patient"),
  bookingLimiter,
  validate({ body: reservationBody }),
  postReservation,
);
reservationsRouter.post(
  "/:id/take",
  requirePrivilege("reservations.take"),
  validate({ params: idParams, body: takeReservationBody }),
  takeReservation,
);
reservationsRouter.put(
  "/:id",
  requirePrivilege("reservations.manage"),
  validate({ params: idParams, body: updateReservationBody }),
  updateReservation,
);
