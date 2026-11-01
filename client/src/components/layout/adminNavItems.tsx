import type { ReactNode } from "react";
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
  label: string;
  path: string;
  icon: ReactNode;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard /> },
  { label: "Patients", path: "/admin/patients", icon: <Users /> },
  { label: "Reports", path: "/admin/reports", icon: <ClipboardList /> },
  { label: "Reservations", path: "/admin/reservations", icon: <CalendarDays /> },
  { label: "Therapists", path: "/admin/therapists", icon: <Stethoscope /> },
  { label: "Users", path: "/admin/users", icon: <UserCog /> },
  { label: "Banners", path: "/admin/banners", icon: <Megaphone /> },
];
