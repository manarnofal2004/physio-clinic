import axios from "axios";
import { authToken } from "@/lib/authToken";
import { env } from "@/lib/env";
import { normalizeError } from "./apiError";

let onUnauthorized: (() => void) | null = null;

// AuthProvider registers its logout here, so an expired token ends the session.
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeError(error);
    // Check the code, not the status: a wrong password is also a 401 (INVALID_CREDENTIALS).
    if (apiError.code === "UNAUTHORIZED") onUnauthorized?.();
    return Promise.reject(apiError);
  },
);
