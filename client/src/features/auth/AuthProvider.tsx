import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { authToken } from "@/lib/authToken";
import { fetchCurrentUser, loginRequest } from "./api";
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

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password);
      authToken.set(result.token);
      // A page-load check still running must not overwrite the new user.
      await queryClient.cancelQueries({ queryKey: ME_QUERY_KEY });
      queryClient.setQueryData(ME_QUERY_KEY, result.user);
      return result.user;
    },
    [queryClient],
  );

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const api = useMemo<AuthApi>(
    () => ({ user, isAuthenticated: user !== null, isLoading: isPending, login, logout }),
    [user, isPending, login, logout],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
};
