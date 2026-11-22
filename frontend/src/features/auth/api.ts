import type { ApiSuccess, LoginResponse, User } from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

export const loginRequest = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await apiClient.post<ApiSuccess<LoginResponse>>("/auth/login", {
    email,
    password,
  });
  return data.data;
};

export const fetchCurrentUser = async (signal?: AbortSignal): Promise<User> => {
  const { data } = await apiClient.get<ApiSuccess<User>>("/auth/me", { signal });
  return data.data;
};
