import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiPaginated, ApiSuccess, Therapist, TherapistInput } from "@shared/api-types";
import { ApiError } from "@/lib/api/apiError";
import { apiClient } from "@/lib/api/client";

const THERAPISTS_KEY = ["therapists"];

// Every physiotherapist, active or not, by name. A clinic has a handful.
export const useTherapists = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: [...THERAPISTS_KEY, "admin"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPaginated<Therapist>>("/therapists", {
        params: { limit: 100, sort: "fullName" },
      });
      return data.data;
    },
  });

// The photo as an object URL. The photo is behind the login, so <img> cannot load
// it by itself; photoId is in the key, so a new photo is fetched once and kept.
export const useTherapistPhoto = (therapist: Pick<Therapist, "id" | "photoId">) =>
  useQuery({
    queryKey: [...THERAPISTS_KEY, "photo", therapist.id, therapist.photoId],
    queryFn: async () => {
      const { data } = await apiClient.get<Blob>(`/therapists/${therapist.id}/photo`, {
        params: { v: therapist.photoId },
        responseType: "blob",
      });
      return URL.createObjectURL(data);
    },
    enabled: Boolean(therapist.photoId),
    staleTime: Infinity,
  });

// The photo of a physiotherapist known only by id: the logged-in therapist, or the
// one who wrote a report. Without the photoId we can't tell if there is a photo, so
// we ask; "no photo" (404) gives null and the initials show instead.
export const useTherapistPhotoById = (therapistId: string | null | undefined) =>
  useQuery({
    queryKey: [...THERAPISTS_KEY, "photo-by-id", therapistId],
    queryFn: async () => {
      try {
        // The server lets the browser cache the photo for a day, so a fresh `t` makes sure a
        // replaced photo shows. staleTime keeps React Query from fetching it again.
        const { data } = await apiClient.get<Blob>(`/therapists/${therapistId}/photo`, {
          responseType: "blob",
          params: { t: Date.now() },
        });
        return URL.createObjectURL(data);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(therapistId),
    staleTime: Infinity,
    retry: false,
  });

// Add a physiotherapist or replace one's details (PUT sends the whole profile), and
// set or remove their photo.
export const useTherapistMutations = () => {
  const queryClient = useQueryClient();
  const onSettled = () => queryClient.invalidateQueries({ queryKey: THERAPISTS_KEY });
  return {
    create: useMutation({
      mutationFn: (input: TherapistInput) =>
        apiClient.post<ApiSuccess<Therapist>>("/therapists", input),
      onSettled,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: TherapistInput }) =>
        apiClient.put<ApiSuccess<Therapist>>(`/therapists/${id}`, input),
      onSettled,
    }),
    setPhoto: useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) => {
        const form = new FormData();
        form.append("photo", file);
        // The client sends JSON by default; a file needs multipart.
        return apiClient.put(`/therapists/${id}/photo`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      },
      onSettled,
    }),
    removePhoto: useMutation({
      mutationFn: (id: string) => apiClient.delete(`/therapists/${id}/photo`),
      onSettled,
    }),
  };
};

// The profile as the form and the PUT request need it.
export const toInput = (t: Therapist): TherapistInput => ({
  fullName: t.fullName,
  ...(t.phone && { phone: t.phone }),
  ...(t.specialty && { specialty: t.specialty }),
  isActive: t.isActive,
  schedule: t.schedule,
});
