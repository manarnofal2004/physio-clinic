import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { ApiPaginated, ApiSuccess, Patient, Report, Reservation } from "@shared/api-types";
import { clinicDay } from "@/features/dashboard/format";
import { ApiError } from "@/lib/api/apiError";
import { apiClient } from "@/lib/api/client";

// The logged-in patient's own data: GET /api/me/... and their GET /api/reservations.
const PORTAL_KEY = ["portal"];

export const MY_REPORTS_PAGE_SIZE = 10;
export const MY_PAST_RESERVATIONS_PAGE_SIZE = 10;

// A missing record or report (NOT_FOUND) will not appear by asking again, so only
// other errors (a dropped connection, a server restart) are retried, up to 3 times.
const retryUnlessNotFound = (failureCount: number, error: Error) =>
  !(error instanceof ApiError && error.status === 404) && failureCount < 3;

// The patient's own record. NOT_FOUND when the account has no patient record, or
// the admin has hidden it.
export const useMyPatient = () =>
  useQuery({
    queryKey: [...PORTAL_KEY, "patient"],
    queryFn: async () => (await apiClient.get<ApiSuccess<Patient>>("/me/patient")).data.data,
    retry: retryUnlessNotFound,
  });

// One page of the patient's reports, newest first.
export const useMyReports = (page: number) =>
  useQuery({
    queryKey: [...PORTAL_KEY, "reports", page],
    queryFn: async () =>
      (
        await apiClient.get<ApiPaginated<Report>>("/me/reports", {
          params: { page, limit: MY_REPORTS_PAGE_SIZE, sort: "-date" },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

// One of the patient's reports. Another patient's report answers NOT_FOUND.
export const useMyReport = (id: string) =>
  useQuery({
    queryKey: [...PORTAL_KEY, "report", id],
    queryFn: async () => (await apiClient.get<ApiSuccess<Report>>(`/me/reports/${id}`)).data.data,
    retry: retryUnlessNotFound,
  });

// A file attached to one of the patient's reports, as a local link. Files need the
// login token, so a plain <img src> or <a href> cannot load them.
export const fetchMyFileUrl = async (id: string) => {
  const { data } = await apiClient.get<Blob>(`/me/files/${id}`, { responseType: "blob" });
  return URL.createObjectURL(data);
};

// Today in the clinic ("2026-11-26"), whatever the computer's time zone.
const todayInClinic = () => clinicDay(new Date());

// The patient's reservations from today on, soonest first. A patient has only a few
// (at most 2 waiting ones), so one request of up to 100 is enough, with no pages.
export const useMyUpcomingReservations = () =>
  useQuery({
    queryKey: [...PORTAL_KEY, "reservations", "upcoming"],
    queryFn: async () =>
      (
        await apiClient.get<ApiPaginated<Reservation>>("/reservations", {
          params: { from: todayInClinic(), sort: "scheduledAt", limit: 100 },
        })
      ).data.data,
  });

// One page of the patient's reservations up to yesterday, newest first.
export const useMyPastReservations = (page: number) =>
  useQuery({
    queryKey: [...PORTAL_KEY, "reservations", "past", page],
    queryFn: async () => {
      const yesterday = dayjs(todayInClinic()).subtract(1, "day").format("YYYY-MM-DD");
      return (
        await apiClient.get<ApiPaginated<Reservation>>("/reservations", {
          params: {
            to: yesterday,
            sort: "-scheduledAt",
            page,
            limit: MY_PAST_RESERVATIONS_PAGE_SIZE,
          },
        })
      ).data;
    },
    placeholderData: keepPreviousData,
  });
