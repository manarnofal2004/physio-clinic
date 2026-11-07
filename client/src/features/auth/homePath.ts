import type { Role } from "@shared/api-types";

// Where each role belongs. Patients go to the public site until the patient portal exists.
export const homePathFor = (role: Role): string => {
  if (role === "admin") return "/admin";
  if (role === "therapist") return "/therapist";
  return "/";
};
