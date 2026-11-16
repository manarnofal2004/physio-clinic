import { useQuery } from "@tanstack/react-query";
import type { ApiSuccess, DashboardStats } from "@shared/api-types";
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
