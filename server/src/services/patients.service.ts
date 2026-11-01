import { Patient, type PatientDocument } from "../models/patient.model.js";
import { User, type UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { buildSearchFilter } from "../utils/search.js";
import type { ListPatientsQuery } from "../validators/patients.validators.js";
import { patientScopeFilter } from "./access.service.js";

export const PATIENT_SEARCH_FIELDS = ["fullName", "phone", "condition"] as const;

export function toPatientDto(patient: PatientDocument, hasAccount: boolean) {
  return {
    id: patient.id as string,
    fullName: patient.fullName,
    phone: patient.phone,
    age: patient.age,
    gender: patient.gender,
    address: patient.address,
    condition: patient.condition,
    notes: patient.notes,
    status: patient.status,
    isHidden: patient.isHidden,
    lastVisit: patient.lastVisit,
    hasAccount,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

// Mongo filter for the list and the CSV export: search + filters, limited to the user's scope.
export function buildPatientListFilter(user: UserDocument, query: ListPatientsQuery) {
  if (query.hidden !== undefined && user.role !== "admin") {
    throw new AppError(403, "FORBIDDEN", "Only the admin can filter hidden patients");
  }
  // $and keeps the scope rule intact: spreading objects would let one condition
  // overwrite another on the same field (for example _id).
  return {
    $and: [
      patientScopeFilter(user),
      buildSearchFilter(query.search, PATIENT_SEARCH_FIELDS),
      query.status ? { status: query.status } : {},
      query.hidden !== undefined ? { isHidden: query.hidden } : {},
    ],
  };
}

// A patient outside the user's scope (or hidden) looks the same as one that does not exist.
export async function findPatientInScope(user: UserDocument, id: string): Promise<PatientDocument> {
  const patient = await Patient.findOne({ $and: [patientScopeFilter(user), { _id: id }] });
  if (!patient) throw new AppError(404, "NOT_FOUND", "Patient not found");
  return patient;
}

// Ids of the given patients that have a login. One query for the whole page.
export async function patientIdsWithAccount(patients: PatientDocument[]): Promise<Set<string>> {
  const users = await User.find({ patientId: { $in: patients.map((p) => p._id) } }, "patientId");
  return new Set(users.map((user) => String(user.patientId)));
}
