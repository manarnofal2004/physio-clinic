import type { ReactNode } from "react";
import type { Privilege } from "@shared/api-types";
import type { Translation } from "@/i18n/locales/en";

export interface PanelNavItem {
  labelKey: keyof Translation["panel"]; // text comes from the "panel" translations
  path: string;
  icon: ReactNode;
  privilege?: Privilege; // the panel hides this link from users without it
}
