import type { ReactNode } from "react";
import type { Privilege } from "@shared/api-types";
import type { Translation } from "@/i18n/locales/en";
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  labelKey: keyof Translation["admin"]; // text comes from the "admin" translations
  path: string;
  icon: ReactNode;
  privilege?: Privilege; // the panel hides this link from users without it
}

export const adminNavItems: AdminNavItem[] = [
  { labelKey: "dashboard", path: "/admin", icon: <LayoutDashboard /> },
  { labelKey: "patients", path: "/admin/patients", icon: <Users /> },
  { labelKey: "reports", path: "/admin/reports", icon: <ClipboardList /> },
  { labelKey: "reservations", path: "/admin/reservations", icon: <CalendarDays /> },
  { labelKey: "therapists", path: "/admin/therapists", icon: <Stethoscope /> },
  { labelKey: "users", path: "/admin/users", icon: <UserCog /> },
  { labelKey: "banners", path: "/admin/banners", icon: <Megaphone /> },
];
