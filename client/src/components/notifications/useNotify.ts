import { useContext } from "react";
import { NotificationContext, type NotifyApi } from "./notificationContext";

export const useNotify = (): NotifyApi => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotify must be used inside NotificationProvider");
  }
  return context;
};
