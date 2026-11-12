import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiPaginated,
  ApiSuccess,
  Attachment,
  Report,
  ReportInput,
  ReportProgress,
} from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

const REPORTS_KEY = ["reports"];

export interface ReportsFilter {
  page: number; // one-based
  limit: number;
  search: string;
  progress: ReportProgress | "";
  from: string; // "YYYY-MM-DD" or ""
  to: string;
  patientId: string;
}

// Only the filters that are set, as the API's query params.
const params = (f: Omit<ReportsFilter, "page" | "limit">) => ({
  sort: "-date",
  ...(f.search && { search: f.search }),
  ...(f.progress && { progress: f.progress }),
  ...(f.from && { from: f.from }),
  ...(f.to && { to: f.to }),
  ...(f.patientId && { patientId: f.patientId }),
});

// One page of reports, newest first.
export const useReports = (filter: ReportsFilter) =>
  useQuery({
    queryKey: [...REPORTS_KEY, "list", filter],
    queryFn: async () =>
      (
        await apiClient.get<ApiPaginated<Report>>("/reports", {
          params: { page: filter.page, limit: filter.limit, ...params(filter) },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export const useReport = (id: string) =>
  useQuery({
    queryKey: [...REPORTS_KEY, "one", id],
    queryFn: async () => (await apiClient.get<ApiSuccess<Report>>(`/reports/${id}`)).data.data,
  });

// Create, replace or delete a report; the lists load again afterwards (and the
// patients too, because a report changes a patient's last visit).
export const useReportMutations = () => {
  const queryClient = useQueryClient();
  const onSettled = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: REPORTS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["patients"] }),
    ]);
  return {
    create: useMutation({
      mutationFn: async (input: ReportInput) =>
        (await apiClient.post<ApiSuccess<Report>>("/reports", input)).data.data,
      onSettled,
    }),
    update: useMutation({
      mutationFn: async ({ id, input }: { id: string; input: ReportInput }) =>
        (await apiClient.put<ApiSuccess<Report>>(`/reports/${id}`, input)).data.data,
      onSettled,
    }),
    remove: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/reports/${id}`),
      onSettled,
    }),
  };
};

// Upload up to 5 files (images or PDF, 5 MB each); returns them as attachments.
export const uploadFiles = async (files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  const { data } = await apiClient.post<ApiSuccess<Attachment[]>>("/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

// Files and the CSV export need the login token, so they are fetched as data and
// turned into a local link instead of a plain <img src> or <a href>.
export const fetchFileUrl = async (id: string) => {
  const { data } = await apiClient.get<Blob>(`/uploads/${id}`, { responseType: "blob" });
  return URL.createObjectURL(data);
};

export const downloadReportsCsv = async (filter: Omit<ReportsFilter, "page" | "limit">) => {
  const { data } = await apiClient.get<Blob>("/reports/export", {
    params: params(filter),
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
