import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError, type FieldError } from "../utils/app-error.js";

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

// Validates the request with zod and replaces each part with the parsed value,
// so controllers get trimmed, coerced and defaulted data.
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    const details: FieldError[] = [];

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          details.push({ field: [part, ...issue.path].join("."), message: issue.message });
        }
        continue;
      }

      // req.query is a read-only getter in Express 5, so redefine it.
      Object.defineProperty(req, part, {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    if (details.length > 0) {
      next(new AppError(400, "VALIDATION_ERROR", "Validation failed", details));
      return;
    }
    next();
  };
}
