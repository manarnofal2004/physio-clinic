import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiPaginated, Therapist, TherapistInput } from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

const THERAPISTS_KEY = ["therapists"];

// Every physiotherapist, active or not, by name. A clinic has a handful.
export const useTherapists = () =>
  useQuery({
    queryKey: [...THERAPISTS_KEY, "admin"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPaginated<Therapist>>("/therapists", {
        params: { limit: 100, sort: "fullName" },
      });
      return data.data;
    },
  });

// Add a physiotherapist or replace one's details (PUT sends the whole profile).
export const useTherapistMutations = () => {
  const queryClient = useQueryClient();
  const onSettled = () => queryClient.invalidateQueries({ queryKey: THERAPISTS_KEY });
  return {
    create: useMutation({
      mutationFn: (input: TherapistInput) => apiClient.post("/therapists", input),
      onSettled,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: TherapistInput }) =>
        apiClient.put(`/therapists/${id}`, input),
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
