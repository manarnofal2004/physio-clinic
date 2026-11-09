import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiPaginated,
  ApiSuccess,
  CreateUserRequest,
  Patient,
  Role,
  Therapist,
  UpdateUserAccessRequest,
  User,
} from "@shared/api-types";
import { apiClient } from "@/lib/api/client";

const USERS_KEY = ["users"];

export interface UsersFilter {
  page: number; // one-based, as the API expects
  limit: number;
  search: string;
  role: Role | "";
  isActive: "" | "true" | "false";
}

// One page of accounts for the admin's table, with the total for paging.
export const useUsers = (filter: UsersFilter) =>
  useQuery({
    queryKey: [...USERS_KEY, filter],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPaginated<User>>("/users", {
        params: {
          page: filter.page,
          limit: filter.limit,
          sort: "fullName",
          ...(filter.search && { search: filter.search }),
          ...(filter.role && { role: filter.role }),
          ...(filter.isActive && { isActive: filter.isActive }),
        },
      });
      return data;
    },
    // Keep the old page on screen while the next one loads, so the table does not jump.
    placeholderData: keepPreviousData,
  });

// Therapist profiles, to link a new therapist account to one.
export const useTherapistOptions = () =>
  useQuery({
    queryKey: ["therapists", "options"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPaginated<Therapist>>("/therapists", {
        params: { limit: 100, sort: "fullName" },
      });
      return data.data;
    },
  });

// Patients matching a search, for linking a patient account or choosing a therapist's
// patients.
export const usePatientOptions = (search: string) =>
  useQuery({
    queryKey: ["patients", "options", search],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiPaginated<Patient>>("/patients", {
        params: { limit: search ? 20 : 100, sort: "fullName", ...(search && { search }) },
      });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });

// Create an account, change a therapist's access, or turn an account on or off.
// Afterwards the lists load again (therapists and patients too: "has an account" changes).
export const useUserMutations = () => {
  const queryClient = useQueryClient();
  const onSettled = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: USERS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["therapists"] }),
      queryClient.invalidateQueries({ queryKey: ["patients"] }),
    ]);

  return {
    create: useMutation({
      mutationFn: async (input: CreateUserRequest) =>
        (await apiClient.post<ApiSuccess<User>>("/users", input)).data.data,
      onSettled,
    }),
    access: useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateUserAccessRequest }) =>
        apiClient.put(`/users/${id}/access`, input),
      onSettled,
    }),
    status: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        apiClient.patch(`/users/${id}/status`, { isActive }),
      onSettled,
    }),
  };
};
