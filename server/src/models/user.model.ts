import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { PRIVILEGES, ROLES, type Privilege, type Role } from "../constants.js";

export interface PatientScope {
  all: boolean;
  patientIds: Types.ObjectId[];
}

export interface IUser {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  patientId: Types.ObjectId | null;
  therapistId: Types.ObjectId | null;
  privileges: Privilege[];
  patientScope: PatientScope;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const patientScopeSchema = new Schema<PatientScope>(
  {
    all: { type: Boolean, default: false },
    patientIds: [{ type: Schema.Types.ObjectId, ref: "Patient" }],
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never returned by queries unless asked for with .select("+password").
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    isActive: { type: Boolean, default: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", default: null },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", default: null },
    privileges: { type: [String], enum: PRIVILEGES, default: [] },
    patientScope: { type: patientScopeSchema, default: () => ({ all: false, patientIds: [] }) },
  },
  { timestamps: true },
);

// One account per patient and per therapist (nulls are not counted).
userSchema.index(
  { patientId: 1 },
  { unique: true, partialFilterExpression: { patientId: { $type: "objectId" } } },
);
userSchema.index(
  { therapistId: 1 },
  { unique: true, partialFilterExpression: { therapistId: { $type: "objectId" } } },
);
userSchema.index({ role: 1, isActive: 1 });

export const User = model<IUser>("User", userSchema);
