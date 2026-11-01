export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR";

export interface FieldError {
  field: string;
  message: string;
}

// Error with an HTTP status and a stable code the client can translate.
// Throw it from controllers and services; the error handler turns it into JSON.
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: FieldError[],
  ) {
    super(message);
  }
}
