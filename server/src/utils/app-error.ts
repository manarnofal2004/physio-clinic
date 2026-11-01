// Mirrors ERROR_CODES in shared/api-types.ts.
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "ACCOUNT_DISABLED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SLOT_UNAVAILABLE"
  | "PENDING_LIMIT_REACHED"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "TOO_MANY_FILES"
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
