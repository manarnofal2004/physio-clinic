import { MAX_PENDING_PER_PHONE } from "../constants.js";
import { Reservation, type ReservationDocument } from "../models/reservation.model.js";
import type { UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import type { ReservationBody } from "../validators/reservations.validators.js";
import { hasPrivileges } from "./access.service.js";
import { assertBookableTime, freeTherapists } from "./schedule.service.js";

const isStaff = (user: UserDocument | undefined) =>
  user !== undefined && (user.role === "admin" || user.role === "therapist");

// Patients and guests never see who the therapist is or the staff's notes.
export function toReservationDto(reservation: ReservationDocument, viewer?: UserDocument) {
  const staff = isStaff(viewer);
  return {
    id: reservation.id as string,
    userId: reservation.userId ? String(reservation.userId) : null,
    therapistId: staff && reservation.therapistId ? String(reservation.therapistId) : null,
    fullName: reservation.fullName,
    phone: reservation.phone,
    age: reservation.age,
    scheduledAt: reservation.scheduledAt,
    status: reservation.status,
    notes: reservation.notes,
    adminNotes: staff ? reservation.adminNotes : null,
    reviewedAt: reservation.reviewedAt,
    previousScheduledAt: reservation.previousScheduledAt,
    rescheduledAt: reservation.rescheduledAt,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
  };
}

// Which reservations a user may see:
// patients their own; reservations.view or .manage everything; reservations.take pending + their own.
export function reservationAccessFilter(user: UserDocument): Record<string, unknown> {
  if (user.role === "patient") return { userId: user._id };
  if (hasPrivileges(user, ["reservations.view"]) || hasPrivileges(user, ["reservations.manage"])) {
    return {};
  }
  if (hasPrivileges(user, ["reservations.take"])) {
    return { $or: [{ status: "pending" }, { therapistId: user.therapistId }] };
  }
  throw new AppError(403, "FORBIDDEN", "You are not allowed to do this");
}

export async function findReservationFor(user: UserDocument, id: string) {
  const reservation = await Reservation.findById(id);
  if (!reservation) throw new AppError(404, "NOT_FOUND", "Reservation not found");
  const visible = await Reservation.exists({
    $and: [reservationAccessFilter(user), { _id: reservation._id }],
  });
  if (!visible) throw new AppError(403, "FORBIDDEN", "You are not allowed to see this reservation");
  return reservation;
}

// Used by the public form and by logged-in patients. Always creates a pending request.
export async function createReservation(
  body: ReservationBody,
  user: UserDocument | undefined,
  now = new Date(),
): Promise<ReservationDocument> {
  assertBookableTime(body.scheduledAt, now);
  if ((await freeTherapists(body.scheduledAt)).length === 0) {
    throw new AppError(409, "SLOT_UNAVAILABLE", "This time is no longer available");
  }

  const pending = await Reservation.countDocuments({ phone: body.phone, status: "pending" });
  if (pending >= MAX_PENDING_PER_PHONE) {
    throw new AppError(
      409,
      "PENDING_LIMIT_REACHED",
      `This phone number already has ${MAX_PENDING_PER_PHONE} pending requests`,
    );
  }

  return Reservation.create({
    ...body,
    userId: user?.role === "patient" ? user._id : null,
  });
}
