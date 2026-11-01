import type { ReactNode } from "react";
import type { Translation } from "@/i18n/locales/en";
import {
  BannersIcon,
  DashboardIcon,
  PatientsIcon,
  ReportsIcon,
  ReservationsIcon,
  TherapistsIcon,
  UsersAndPrivilegesIcon,
} from "@/components/icons/icons";

export interface AdminNavItem {
  labelKey: keyof Translation["admin"]; // text comes from the "admin" translations
  path: string;
  icon: ReactNode;
}

export const adminNavItems: AdminNavItem[] = [
  { labelKey: "dashboard", path: "/admin", icon: <DashboardIcon /> },
  { labelKey: "patients", path: "/admin/patients", icon: <PatientsIcon /> },
  { labelKey: "reports", path: "/admin/reports", icon: <ReportsIcon /> },
  { labelKey: "reservations", path: "/admin/reservations", icon: <ReservationsIcon /> },
  { labelKey: "therapists", path: "/admin/therapists", icon: <TherapistsIcon /> },
  { labelKey: "users", path: "/admin/users", icon: <UsersAndPrivilegesIcon /> },
  { labelKey: "banners", path: "/admin/banners", icon: <BannersIcon /> },
];
