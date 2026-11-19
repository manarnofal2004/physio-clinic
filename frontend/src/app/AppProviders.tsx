import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/queryClient";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { DatesProvider } from "@/i18n/DatesProvider";
import { ColorModeProvider } from "@/theme/ColorModeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <DatesProvider>
          <NotificationProvider>
            <AuthProvider>{children}</AuthProvider>
          </NotificationProvider>
        </DatesProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  );
}
