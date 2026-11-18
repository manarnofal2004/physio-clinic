import type {
  ApiSuccess,
  Availability,
  Reservation,
  ReservationInput,
  TodayOverview,
} from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

export const fetchDateOptions = async (): Promise<string[]> => {
  const { data } = await apiClient.get<ApiSuccess<string[]>>("/public/reservations/date-options");
  return data.data;
};

export const fetchAvailability = async (date: string): Promise<Availability> => {
  const { data } = await apiClient.get<ApiSuccess<Availability>>(
    "/public/reservations/availability",
    { params: { date } },
  );
  return data.data;
};

export const createReservation = async (input: ReservationInput): Promise<Reservation> => {
  const { data } = await apiClient.post<ApiSuccess<Reservation>>("/public/reservations", input);
  return data.data;
};

// Today at the clinic: sessions done, running and upcoming, and free times left.
// No names or phone numbers come back.
export const fetchTodayOverview = async (): Promise<TodayOverview> => {
  const { data } = await apiClient.get<ApiSuccess<TodayOverview>>("/public/reservations/today");
  return data.data;
};
