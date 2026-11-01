import { z } from "zod";
import { GENDERS, PATIENT_STATUSES } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { booleanQuery, fullName } from "./common.js";

// Empty optional text becomes null, so clearing a field in the form clears it in the database.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

// POST and PUT take the same body (PUT replaces every field).
export const patientBody = z.object({
  fullName,
  phone: z.string().trim().min(6).max(30),
  age: z.number().int().min(0).max(120),
  gender: z.enum(GENDERS),
  address: optionalText(300),
  condition: z.string().trim().min(2).max(200),
  notes: optionalText(2000),
});

export type PatientBody = z.infer<typeof patientBody>;

export const patientStatusBody = z.object({ status: z.enum(PATIENT_STATUSES) });

export const patientHideBody = z.object({ isHidden: z.boolean() });

export const listPatientsQuery = listQuerySchema([
  "fullName",
  "age",
  "lastVisit",
  "createdAt",
] as const).extend({
  status: z.enum(PATIENT_STATUSES).optional(),
  hidden: booleanQuery.optional(), // admin only
});

export type ListPatientsQuery = z.infer<typeof listPatientsQuery>;
