import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { RESERVATION_STATUSES, type ReservationStatus } from "../constants.js";

export interface IReservation {
  userId: Types.ObjectId | null; // null for guests
  therapistId: Types.ObjectId | null; // set when taken or assigned
  fullName: string;
  phone: string; // stored without spaces or dashes
  age: number;
  scheduledAt: Date;
  status: ReservationStatus;
  notes: string | null;
  adminNotes: string | null;
  reviewedAt: Date | null;
  previousScheduledAt: Date | null;
  rescheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReservationDocument = HydratedDocument<IReservation>;

const reservationSchema = new Schema<IReservation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", default: null },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: RESERVATION_STATUSES, default: "pending" },
    notes: { type: String, default: null },
    adminNotes: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    previousScheduledAt: { type: Date, default: null },
    rescheduledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reservationSchema.index({ status: 1, scheduledAt: 1 });
reservationSchema.index({ therapistId: 1, status: 1, scheduledAt: 1 });
reservationSchema.index({ userId: 1, scheduledAt: -1 });
reservationSchema.index({ phone: 1, status: 1 });
reservationSchema.index({ rescheduledAt: 1 }, { sparse: true });
// Last line of defence against double booking: one accepted session per therapist per start time.
reservationSchema.index(
  { therapistId: 1, scheduledAt: 1 },
  { unique: true, partialFilterExpression: { status: "accepted" } },
);

export const Reservation = model<IReservation>("Reservation", reservationSchema);
