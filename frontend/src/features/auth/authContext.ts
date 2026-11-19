import { createContext } from "react";
import type { User } from "@shared/api-types";

export interface AuthApi {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the saved token is being checked on page load. */
  isLoading: boolean;
  /** Rejects with an ApiError, so the login form can show the reason. */
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthApi | null>(null);
