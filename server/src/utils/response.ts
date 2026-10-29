import type { Response } from "express";

// Every successful response has the same shape: { success: true, data, meta? }.
// `meta` carries extra info such as pagination.
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { status?: number; meta?: Record<string, unknown> } = {},
) {
  const { status = 200, meta } = options;
  res.status(status).json(meta ? { success: true, data, meta } : { success: true, data });
}
