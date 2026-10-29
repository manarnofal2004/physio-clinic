import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/queryClient";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { ColorModeProvider } from "@/theme/ColorModeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  );
}
