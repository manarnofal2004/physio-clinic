import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
};

// Errors from express.json() carry a "type" such as "entity.parse.failed" or "entity.too.large".
function bodyParserType(err: unknown): string | null {
  return err instanceof Error && "type" in err && typeof err.type === "string" ? err.type : null;
}

// MongoDB rejects a second document with the same unique value (email, account link).
function isDuplicateKeyError(err: unknown): boolean {
  return err instanceof Error && "code" in err && err.code === 11000;
}

// Every error leaves the API in the same shape:
// { success: false, error: { code, message, details? } }.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let appError: AppError;
  const bodyError = bodyParserType(err);
  if (err instanceof AppError) {
    appError = err;
  } else if (bodyError === "entity.parse.failed") {
    appError = new AppError(400, "INVALID_JSON", "Request body is not valid JSON");
  } else if (bodyError === "entity.too.large") {
    appError = new AppError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  } else if (bodyError) {
    appError = new AppError(400, "VALIDATION_ERROR", "Request body could not be read");
  } else if (isDuplicateKeyError(err)) {
    appError = new AppError(409, "CONFLICT", "This value is already in use");
  } else {
    console.error(err);
    const message =
      env.NODE_ENV !== "production" && err instanceof Error ? err.message : "Internal server error";
    appError = new AppError(500, "INTERNAL_ERROR", message);
  }

  const { status, code, message, details } = appError;
  res.status(status).json({
    success: false,
    error: details ? { code, message, details } : { code, message },
  });
};
