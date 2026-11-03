import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import type { PanelNavItem } from "./panelNavItem";

export const adminNavItems: PanelNavItem[] = [
  { labelKey: "dashboard", path: "/admin", icon: <LayoutDashboard /> },
  { labelKey: "patients", path: "/admin/patients", icon: <Users /> },
  { labelKey: "reports", path: "/admin/reports", icon: <ClipboardList /> },
  { labelKey: "reservations", path: "/admin/reservations", icon: <CalendarDays /> },
  { labelKey: "therapists", path: "/admin/therapists", icon: <Stethoscope /> },
  { labelKey: "users", path: "/admin/users", icon: <UserCog /> },
  { labelKey: "banners", path: "/admin/banners", icon: <Megaphone /> },
];
