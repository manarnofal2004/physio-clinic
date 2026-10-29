import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`));
};

function isJsonSyntaxError(err: unknown): boolean {
  return err instanceof SyntaxError && "type" in err && err.type === "entity.parse.failed";
}

// Every error leaves the API in the same shape:
// { success: false, error: { code, message, details? } }.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let appError: AppError;
  if (err instanceof AppError) {
    appError = err;
  } else if (isJsonSyntaxError(err)) {
    appError = new AppError(400, "INVALID_JSON", "Request body is not valid JSON");
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
