import { CalendarDays, ClipboardList, UserRound } from "lucide-react";
import type { PanelNavItem } from "@/components/layout/panelNavItem";

// The patient portal's sidebar.
export const portalNavItems: PanelNavItem[] = [
  { labelKey: "myProfile", path: "/portal/profile", icon: <UserRound /> },
  { labelKey: "myReservations", path: "/portal/reservations", icon: <CalendarDays /> },
  { labelKey: "myReports", path: "/portal/reports", icon: <ClipboardList /> },
];
