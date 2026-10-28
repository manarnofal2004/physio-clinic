import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";

// Error with an HTTP status, thrown from routes and services.
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Every error leaves the API in the same shape: { error: { message } }.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status === 500) console.error(err);

  const message =
    status === 500 && env.NODE_ENV === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";

  res.status(status).json({ error: { message } });
};
