import { Schema, model, type HydratedDocument } from "mongoose";
import { WORK_DAYS, type WorkDay } from "../constants.js";

export interface WorkingHours {
  day: WorkDay;
  start: string; // "HH:mm", clinic time
  end: string;
}

export interface ITherapist {
  fullName: string;
  phone: string | null;
  specialty: string | null;
  isActive: boolean;
  schedule: WorkingHours[];
  createdAt: Date;
  updatedAt: Date;
}

export type TherapistDocument = HydratedDocument<ITherapist>;

const workingHoursSchema = new Schema<WorkingHours>(
  {
    day: { type: Number, enum: WORK_DAYS, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false },
);

const therapistSchema = new Schema<ITherapist>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: null, trim: true },
    specialty: { type: String, default: null, trim: true },
    isActive: { type: Boolean, default: true },
    schedule: { type: [workingHoursSchema], default: [] },
  },
  { timestamps: true },
);

therapistSchema.index({ isActive: 1, fullName: 1 });

export const Therapist = model<ITherapist>("Therapist", therapistSchema);
