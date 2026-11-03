import { useContext } from "react";
import { AuthContext, type AuthApi } from "./authContext";

export const useAuth = (): AuthApi => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
