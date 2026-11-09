import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiPaginated, ApiSuccess, Banner, BannerInput, BannerPatch } from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

export type { Banner, BannerInput, BannerType } from "@shared/api-types";

const BANNERS_KEY = ["banners"];

// The active banners for the public site (GET /api/public/banners), already in
// display order.
export const usePublicBanners = () =>
  useQuery({
    queryKey: [...BANNERS_KEY, "public"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiSuccess<Banner[]>>("/public/banners");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

// Every banner, on or off, in display order, for the admin page. A clinic has a
// handful, so one page of 100 holds them all.
export const useAdminBanners = () =>
  useQuery({
    queryKey: [...BANNERS_KEY, "admin"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPaginated<Banner>>("/banners", {
        params: { limit: 100, sort: "order" },
      });
      return data.data;
    },
  });

// Create, replace, change or delete a banner; afterwards both lists load again, so
// the bar on the public site shows the change too.
export const useBannerMutations = () => {
  const queryClient = useQueryClient();
  const onSettled = () => queryClient.invalidateQueries({ queryKey: BANNERS_KEY });

  return {
    create: useMutation({
      mutationFn: (input: BannerInput) => apiClient.post("/banners", input),
      onSettled,
    }),
    replace: useMutation({
      mutationFn: ({ id, input }: { id: string; input: BannerInput }) =>
        apiClient.put(`/banners/${id}`, input),
      onSettled,
    }),
    patch: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: BannerPatch }) =>
        apiClient.patch(`/banners/${id}`, patch),
      onSettled,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/banners/${id}`),
      onSettled,
    }),
  };
};
