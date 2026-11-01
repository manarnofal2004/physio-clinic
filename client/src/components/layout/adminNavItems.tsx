import type { ReactNode } from "react";
import {
  CalendarDots,
  ClipboardText,
  Megaphone,
  SquaresFour,
  Stethoscope,
  UserGear,
  Users,
} from "@phosphor-icons/react";

export interface AdminNavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <SquaresFour /> },
  { label: "Patients", path: "/admin/patients", icon: <Users /> },
  { label: "Reports", path: "/admin/reports", icon: <ClipboardText /> },
  { label: "Reservations", path: "/admin/reservations", icon: <CalendarDots /> },
  { label: "Therapists", path: "/admin/therapists", icon: <Stethoscope /> },
  { label: "Users", path: "/admin/users", icon: <UserGear /> },
  { label: "Banners", path: "/admin/banners", icon: <Megaphone /> },
];
