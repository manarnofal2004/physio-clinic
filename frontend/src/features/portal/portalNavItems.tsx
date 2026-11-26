import { ClipboardList, UserRound } from "lucide-react";
import type { PanelNavItem } from "@/components/layout/panelNavItem";

// The patient portal's sidebar. 5.8 adds "My reservations" here.
export const portalNavItems: PanelNavItem[] = [
  { labelKey: "myProfile", path: "/portal/profile", icon: <UserRound /> },
  { labelKey: "myReports", path: "/portal/reports", icon: <ClipboardList /> },
];
