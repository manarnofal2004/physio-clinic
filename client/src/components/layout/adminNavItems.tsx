import type { ReactNode } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

export interface AdminNavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
  { label: "Patients", path: "/admin/patients", icon: <PeopleIcon /> },
  { label: "Reports", path: "/admin/reports", icon: <AssignmentIcon /> },
  { label: "Reservations", path: "/admin/reservations", icon: <EventIcon /> },
  { label: "Therapists", path: "/admin/therapists", icon: <MedicalServicesIcon /> },
  { label: "Users", path: "/admin/users", icon: <ManageAccountsIcon /> },
  { label: "Banners", path: "/admin/banners", icon: <CampaignIcon /> },
];
