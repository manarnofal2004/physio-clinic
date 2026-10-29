import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";
import { NotificationContext, type NotifyApi, type NotifySeverity } from "./notificationContext";

interface Notification {
  message: string;
  severity: NotifySeverity;
  key: number;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback((message: string, severity: NotifySeverity = "info") => {
    setCurrent({ message, severity, key: Date.now() });
    setOpen(true);
  }, []);

  const api = useMemo<NotifyApi>(
    () => ({
      notify,
      success: (message) => notify(message, "success"),
      error: (message) => notify(message, "error"),
    }),
    [notify],
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <Snackbar
        key={current?.key}
        open={open}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setOpen(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={current?.severity ?? "info"}
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{ width: "100%" }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
