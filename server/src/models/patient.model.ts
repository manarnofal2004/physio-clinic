import { Schema, model, type HydratedDocument } from "mongoose";
import { GENDERS, PATIENT_STATUSES, type Gender, type PatientStatus } from "../constants.js";

// Patients are never deleted: status moves to "completed", and the admin can hide them.
export interface IPatient {
  fullName: string;
  phone: string;
  age: number;
  gender: Gender;
  address: string | null;
  condition: string;
  notes: string | null;
  status: PatientStatus;
  isHidden: boolean;
  lastVisit: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientDocument = HydratedDocument<IPatient>;

const patientSchema = new Schema<IPatient>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, enum: GENDERS, required: true },
    address: { type: String, default: null, trim: true },
    condition: { type: String, required: true, trim: true },
    notes: { type: String, default: null },
    status: { type: String, enum: PATIENT_STATUSES, default: "active" },
    isHidden: { type: Boolean, default: false },
    lastVisit: { type: Date, default: null },
  },
  { timestamps: true },
);

// Lists always filter on isHidden (and often status), then sort by one of these fields.
patientSchema.index({ isHidden: 1, status: 1, createdAt: -1 });
patientSchema.index({ isHidden: 1, fullName: 1 });
patientSchema.index({ isHidden: 1, lastVisit: -1 });
patientSchema.index({ isHidden: 1, age: 1 });
patientSchema.index({ phone: 1 });

export const Patient = model<IPatient>("Patient", patientSchema);
