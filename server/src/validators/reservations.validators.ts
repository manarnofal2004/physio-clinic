import { z } from "zod";
import { RESERVATION_STATUSES } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { booleanQuery, fullName, objectId } from "./common.js";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

const moment = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);

// Spaces and dashes are dropped so "0599 123-456" and "0599123456" count as the same phone.
const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{6,20}$/, "Use digits only, optionally starting with +"));

export const reservationBody = z.object({
  fullName,
  phone,
  age: z.number().int().min(0).max(120),
  scheduledAt: moment,
  notes: optionalText(2000),
});

export type ReservationBody = z.infer<typeof reservationBody>;

export const updateReservationBody = z
  .object({
    scheduledAt: moment.optional(),
    status: z.enum(RESERVATION_STATUSES).optional(),
    therapistId: objectId.nullable().optional(),
    adminNotes: optionalText(2000).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Send at least one field to change",
  });

export type UpdateReservationBody = z.infer<typeof updateReservationBody>;

export const takeReservationBody = z.object({ adminNotes: optionalText(2000).optional() });

export const listReservationsQuery = listQuerySchema(
  ["scheduledAt", "createdAt", "status"] as const,
  "-scheduledAt",
).extend({
  status: z.enum(RESERVATION_STATUSES).optional(),
  therapistId: objectId.optional(),
  mine: booleanQuery.optional(),
  from: day.optional(),
  to: day.optional(),
});

export type ListReservationsQuery = z.infer<typeof listReservationsQuery>;

export const dayQuery = z.object({ date: day });

export const freeTherapistsQuery = z.object({
  scheduledAt: moment,
  excludeReservationId: objectId.optional(),
});
