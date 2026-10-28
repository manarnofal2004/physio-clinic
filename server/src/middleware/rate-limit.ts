import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

// 10 login attempts per IP every 15 minutes. Off in tests.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  handler: (_req, _res, next) => {
    next(new AppError(429, "TOO_MANY_REQUESTS", "Too many attempts, try again later"));
  },
});
