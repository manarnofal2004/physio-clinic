import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

function limiter(limit: number, windowMinutes: number) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    handler: (_req, _res, next) => {
      next(new AppError(429, "TOO_MANY_REQUESTS", "Too many attempts, try again later"));
    },
  });
}

// Per IP. Both are off in tests.
export const loginLimiter = limiter(10, 15);
export const bookingLimiter = limiter(5, 60);
