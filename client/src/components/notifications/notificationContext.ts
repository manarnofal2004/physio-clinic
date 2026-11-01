import { createContext } from "react";

export type NotifySeverity = "success" | "error" | "info" | "warning";

export interface NotifyApi {
  notify: (message: string, severity?: NotifySeverity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

export const NotificationContext = createContext<NotifyApi | null>(null);
