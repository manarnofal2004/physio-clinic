import {
  CalendarDays,
  ClipboardList,
  House,
  LayoutDashboard,
  Megaphone,
  Users,
} from "lucide-react";
import type { AdminNavItem } from "@/components/layout/adminNavItems";

// A page without a privilege is open to every therapist.
export const therapistNavItems: AdminNavItem[] = [
  { labelKey: "home", path: "/therapist", icon: <House /> },
  {
    labelKey: "dashboard",
    path: "/therapist/dashboard",
    icon: <LayoutDashboard />,
    privilege: "dashboard.view",
  },
  {
    labelKey: "patients",
    path: "/therapist/patients",
    icon: <Users />,
    privilege: "patients.view",
  },
  {
    labelKey: "reports",
    path: "/therapist/reports",
    icon: <ClipboardList />,
    privilege: "reports.view",
  },
  {
    labelKey: "reservations",
    path: "/therapist/reservations",
    icon: <CalendarDays />,
    privilege: "reservations.view",
  },
  {
    labelKey: "banners",
    path: "/therapist/banners",
    icon: <Megaphone />,
    privilege: "banners.manage",
  },
];
