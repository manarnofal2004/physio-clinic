import type { ApiSuccess, LoginResponse, User } from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

export const loginRequest = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await apiClient.post<ApiSuccess<LoginResponse>>("/auth/login", {
    email,
    password,
  });
  return data.data;
};

// The ID token from the "Sign in with Google" button; the answer is the same as a login.
export const googleLoginRequest = async (credential: string): Promise<LoginResponse> => {
  const { data } = await apiClient.post<ApiSuccess<LoginResponse>>("/auth/google", { credential });
  return data.data;
};

export const fetchCurrentUser = async (signal?: AbortSignal): Promise<User> => {
  const { data } = await apiClient.get<ApiSuccess<User>>("/auth/me", { signal });
  return data.data;
};
