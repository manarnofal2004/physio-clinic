import type { TFunction } from "i18next";
import { z } from "zod";
import { GENDERS, type Patient, type PatientInput } from "@shared/api-types";

// Same rules as the server (docs/api/patients.md). Takes t so the messages come out in
// the current language. Every value stays a string, as typed in the form; toPatientInput
// converts them when sending.
export const createPatientSchema = (t: TFunction) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t("patientsAdmin.errors.fullName"))
      .max(120, t("patientsAdmin.errors.fullName")),
    phone: z
      .string()
      .trim()
      .min(6, t("patientsAdmin.errors.phone"))
      .max(30, t("patientsAdmin.errors.phone"))
      .regex(/^\+?[\d\s-]+$/, t("patientsAdmin.errors.phone")),
    age: z
      .string()
      .trim()
      .regex(/^\d{1,3}$/, t("patientsAdmin.errors.age"))
      .refine((value) => Number(value) <= 120, t("patientsAdmin.errors.age")),
    // "" until a gender is chosen, so the select can start empty.
    gender: z
      .string()
      .refine(
        (value) => (GENDERS as readonly string[]).includes(value),
        t("patientsAdmin.errors.gender"),
      ),
    condition: z
      .string()
      .trim()
      .min(2, t("patientsAdmin.errors.condition"))
      .max(200, t("patientsAdmin.errors.condition")),
    address: z.string().trim().max(300, t("patientsAdmin.errors.address")),
    notes: z.string().trim().max(2000, t("patientsAdmin.errors.notes")),
  });

export type PatientValues = z.infer<ReturnType<typeof createPatientSchema>>;

// An empty form for "Add a patient".
export const emptyPatientValues: PatientValues = {
  fullName: "",
  phone: "",
  age: "",
  gender: "",
  condition: "",
  address: "",
  notes: "",
};

// The patient's current data, to fill the form for "Edit".
export const toPatientValues = (patient: Patient): PatientValues => ({
  fullName: patient.fullName,
  phone: patient.phone,
  age: String(patient.age),
  gender: patient.gender,
  condition: patient.condition,
  address: patient.address ?? "",
  notes: patient.notes ?? "",
});

// What the API expects. An empty address or notes is sent as "", which the server
// stores as nothing, so clearing a field in the form clears it in the record too.
export const toPatientInput = (values: PatientValues): PatientInput => ({
  fullName: values.fullName,
  phone: values.phone,
  age: Number(values.age),
  gender: values.gender as PatientInput["gender"],
  condition: values.condition,
  address: values.address,
  notes: values.notes,
});
