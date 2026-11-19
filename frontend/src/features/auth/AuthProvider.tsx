import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginResponse } from "@shared/api-types";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { authToken } from "@/lib/authToken";
import { fetchCurrentUser, googleLoginRequest, loginRequest } from "./api";
import { AuthContext, type AuthApi } from "./authContext";

const ME_QUERY_KEY = ["auth", "me"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // Restores the session on page load. Without a saved token there is nobody to ask about.
  const { data, isPending } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: ({ signal }) => (authToken.get() ? fetchCurrentUser(signal) : null),
    staleTime: Infinity,
  });
  const user = data ?? null;

  const logout = useCallback(() => {
    authToken.clear();
    queryClient.setQueryData(ME_QUERY_KEY, null);
    // The next person to log in on this browser must not see this user's cached data.
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "auth" });
  }, [queryClient]);

  // Both ways of logging in end the same: keep the token and remember the user.
  const startSession = useCallback(
    async (result: LoginResponse) => {
      authToken.set(result.token);
      // A page-load check still running must not overwrite the new user.
      await queryClient.cancelQueries({ queryKey: ME_QUERY_KEY });
      queryClient.setQueryData(ME_QUERY_KEY, result.user);
      return result.user;
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => startSession(await loginRequest(email, password)),
    [startSession],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => startSession(await googleLoginRequest(credential)),
    [startSession],
  );

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const api = useMemo<AuthApi>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading: isPending,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, isPending, login, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
};
