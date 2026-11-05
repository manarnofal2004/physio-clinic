import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export type BannerType = "announcement" | "schedule_update";

export interface Banner {
  id: string;
  type: BannerType;
  messageEn: string;
  messageAr: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// The active banners for the public site (GET /api/public/banners), already in
// display order.
export const usePublicBanners = () =>
  useQuery({
    queryKey: ["banners", "public"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: true; data: Banner[] }>("/public/banners");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
