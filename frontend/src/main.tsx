import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/theme/fonts";
import "@/i18n";
import { AppProviders } from "@/app/AppProviders";
import { AppRouter } from "@/app/AppRouter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
