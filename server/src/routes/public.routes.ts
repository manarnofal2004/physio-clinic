import { Router } from "express";
import { listPublicBanners } from "../controllers/banners.controller.js";
import {
  getAvailability,
  getDateOptions,
  getToday,
  postPublicReservation,
} from "../controllers/public-reservations.controller.js";
import { optionalAuthenticate } from "../middleware/auth.js";
import { bookingLimiter } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { dayQuery, reservationBody } from "../validators/reservations.validators.js";

// No login needed.
export const publicRouter = Router();

publicRouter.get("/banners", listPublicBanners);

publicRouter.get("/reservations/date-options", getDateOptions);
publicRouter.get("/reservations/availability", validate({ query: dayQuery }), getAvailability);
publicRouter.get("/reservations/today", getToday);
publicRouter.post(
  "/reservations",
  bookingLimiter,
  optionalAuthenticate,
  validate({ body: reservationBody }),
  postPublicReservation,
);
