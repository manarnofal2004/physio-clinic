import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type {
  ApiPaginated,
  ApiSuccess,
  Patient,
  PatientInput,
  PatientStatus,
} from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

const PATIENTS_KEY = ["patients"];

export interface PatientsFilter {
  page: number; // one-based
  limit: number;
  search: string;
  status: PatientStatus | "";
  hidden: boolean; // admin only: list the hidden patients instead
  sort: string; // "fullName", "-lastVisit", ... ("-" means newest or largest first)
}

// Only the filters that are set, as the API's query params.
const params = (f: Omit<PatientsFilter, "page" | "limit">) => ({
  sort: f.sort,
  ...(f.search && { search: f.search }),
  ...(f.status && { status: f.status }),
  ...(f.hidden && { hidden: true }),
});

// One page of patients. The old page stays on screen while the next one loads.
export const usePatients = (filter: PatientsFilter) =>
  useQuery({
    queryKey: [...PATIENTS_KEY, "list", filter],
    queryFn: async () =>
      (
        await apiClient.get<ApiPaginated<Patient>>("/patients", {
          params: { page: filter.page, limit: filter.limit, ...params(filter) },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export const usePatient = (id: string) =>
  useQuery({
    queryKey: [...PATIENTS_KEY, "one", id],
    queryFn: async () => (await apiClient.get<ApiSuccess<Patient>>(`/patients/${id}`)).data.data,
  });

// Create, edit, change status or hide. Afterwards the patients load again, and so do
// the reports and the dashboard, because a hidden patient disappears from both.
export const usePatientMutations = () => {
  const queryClient = useQueryClient();
  const onSettled = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["reports"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
  return {
    create: useMutation({
      mutationFn: async (input: PatientInput) =>
        (await apiClient.post<ApiSuccess<Patient>>("/patients", input)).data.data,
      onSettled,
    }),
    update: useMutation({
      mutationFn: async ({ id, input }: { id: string; input: PatientInput }) =>
        (await apiClient.put<ApiSuccess<Patient>>(`/patients/${id}`, input)).data.data,
      onSettled,
    }),
    setStatus: useMutation({
      mutationFn: async ({ id, status }: { id: string; status: PatientStatus }) =>
        (await apiClient.patch<ApiSuccess<Patient>>(`/patients/${id}/status`, { status })).data
          .data,
      onSettled,
    }),
    setHidden: useMutation({
      mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) =>
        (await apiClient.patch<ApiSuccess<Patient>>(`/patients/${id}/hide`, { isHidden })).data
          .data,
      onSettled,
    }),
  };
};

// The CSV needs the login token, so it is fetched as data and saved through a
// temporary link instead of a plain <a href>.
export const downloadPatientsCsv = async (filter: Omit<PatientsFilter, "page" | "limit">) => {
  const { data } = await apiClient.get<Blob>("/patients/export", {
    params: params(filter),
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `patients-${dayjs().format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
