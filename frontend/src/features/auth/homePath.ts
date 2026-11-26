import type { Role } from "@shared/api-types";

// Where each role belongs: the admin panel, the therapist panel, or the patient portal.
export const homePathFor = (role: Role): string => {
  if (role === "admin") return "/admin";
  if (role === "therapist") return "/therapist";
  return "/portal";
};
