import { useQuery } from "@tanstack/react-query";
import type { ApiPaginated, ApiSuccess, DashboardStats, Reservation } from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

export type { DashboardStats } from "@shared/api-types";

export const DASHBOARD_KEY = ["dashboard"];

// The numbers change while the page stays open (a new booking, a session that
// starts), so the dashboard asks again every minute.
const REFRESH_MS = 60_000;

// Every number and chart on the dashboard in one call (GET /api/dashboard/stats).
// The server counts only the patients the user may see.
export const useDashboardStats = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<DashboardStats>>("/dashboard/stats");
      return data.data;
    },
    refetchInterval: REFRESH_MS,
  });

// Every page of one kind of reservation in the month. The server sends at most 100
// at a time, so a busy month takes more than one request.
const allPages = async (params: Record<string, string | number>) => {
  const list: Reservation[] = [];
  for (let page = 1; ; page++) {
    const { data } = await apiClient.get<ApiPaginated<Reservation>>("/reservations", {
      params: { ...params, page, limit: 100, sort: "scheduledAt" },
    });
    list.push(...data.data);
    if (page >= data.meta.totalPages) return list;
  }
};

// The month's sessions for the calendar ("2026-11"): waiting and confirmed ones,
// by time. Rejected and cancelled ones are never asked for, so they can't push
// real sessions out of the list.
export const useMonthSessions = (month: string, enabled: boolean) =>
  useQuery({
    queryKey: ["reservations", "month", month],
    queryFn: async () => {
      const [y = 0, m = 1] = month.split("-").map(Number);
      const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const range = { from: `${month}-01`, to: `${month}-${last}` };
      const [waiting, confirmed] = await Promise.all([
        allPages({ ...range, status: "pending" }),
        allPages({ ...range, status: "accepted" }),
      ]);
      return [...waiting, ...confirmed].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    },
    enabled,
    refetchInterval: REFRESH_MS,
  });
