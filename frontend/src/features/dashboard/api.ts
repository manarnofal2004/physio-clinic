import { useQuery } from "@tanstack/react-query";
import type { ApiPaginated, ApiSuccess, DashboardStats, Reservation } from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

export type { DashboardStats } from "@shared/api-types";

export const DASHBOARD_KEY = ["dashboard"];

// Every number and chart on the dashboard in one call (GET /api/dashboard/stats).
// The server counts only the patients the user may see.
export const useDashboardStats = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<DashboardStats>>("/dashboard/stats");
      return data.data;
    },
  });

// The month's sessions for the calendar ("2026-11"): waiting and confirmed ones,
// by time. A clinic month fits in one page of 100.
export const useMonthSessions = (month: string, enabled: boolean) =>
  useQuery({
    queryKey: ["reservations", "month", month],
    queryFn: async () => {
      const [y = 0, m = 1] = month.split("-").map(Number);
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const { data } = await apiClient.get<ApiPaginated<Reservation>>("/reservations", {
        params: { from: `${month}-01`, to: `${month}-${last}`, limit: 100, sort: "scheduledAt" },
      });
      return data.data.filter((r) => r.status === "pending" || r.status === "accepted");
    },
    enabled,
  });
