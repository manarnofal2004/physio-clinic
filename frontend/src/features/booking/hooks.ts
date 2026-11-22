import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReservation, fetchAvailability, fetchDateOptions, fetchTodayOverview } from "./api";

const RESERVATIONS_KEY = ["public", "reservations"];

export const useDateOptions = () =>
  useQuery({ queryKey: [...RESERVATIONS_KEY, "date-options"], queryFn: fetchDateOptions });

export const useAvailability = (date: string) =>
  useQuery({
    queryKey: [...RESERVATIONS_KEY, "availability", date],
    queryFn: () => fetchAvailability(date),
    enabled: Boolean(date),
  });

// Refreshed every minute, so "running now" stays true while the page is open.
export const useTodayOverview = () =>
  useQuery({
    queryKey: [...RESERVATIONS_KEY, "today"],
    queryFn: fetchTodayOverview,
    refetchInterval: 60_000,
  });

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReservation,
    // Also after a failure: "slot taken" means the times on screen are out of date.
    onSettled: () => queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY }),
  });
};
