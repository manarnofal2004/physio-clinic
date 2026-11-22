import axios from "axios";

interface ErrorBody {
  message?: string;
  code?: string;
  details?: unknown;
  error?: { message?: string; code?: string; details?: unknown };
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status: number | null, code: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError<ErrorBody>(error)) {
    if (!error.response) {
      return new ApiError(error.message, null, "NETWORK_ERROR");
    }
    const body = error.response.data;
    return new ApiError(
      body?.error?.message ?? body?.message ?? error.message,
      error.response.status,
      body?.error?.code ?? body?.code ?? "UNKNOWN_ERROR",
      body?.error?.details ?? body?.details,
    );
  }
  return new ApiError(
    error instanceof Error ? error.message : "Unknown error",
    null,
    "UNKNOWN_ERROR",
  );
}
