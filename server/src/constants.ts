// Mirrors the enums in shared/api-types.ts. Switch to importing from shared/
// once it is part of the server build, and keep both in sync until then.

export const ROLES = ["admin", "therapist", "patient"] as const;
export type Role = (typeof ROLES)[number];

export const PRIVILEGES = [
  "patients.view",
  "patients.edit",
  "reports.view",
  "reports.edit",
  "reservations.view",
  "reservations.take",
  "reservations.manage",
  "banners.manage",
  "dashboard.view",
] as const;
export type Privilege = (typeof PRIVILEGES)[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const PATIENT_STATUSES = ["active", "completed"] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

// 0 = Sunday ... 4 = Thursday. The clinic is closed Friday and Saturday.
export const WORK_DAYS = [0, 1, 2, 3, 4] as const;
export type WorkDay = (typeof WORK_DAYS)[number];

export const CLINIC_OPENS = "08:00";
export const CLINIC_CLOSES = "19:00";
