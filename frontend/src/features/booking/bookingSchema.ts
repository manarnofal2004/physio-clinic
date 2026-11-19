import type { TFunction } from "i18next";
import { z } from "zod";

// Same rules as the server. Takes t so the messages come out in the current language.
// Every value stays a string, as typed in the form; BookingForm converts age when sending.
export const createBookingSchema = (t: TFunction) =>
  z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t("booking.errors.fullName"))
      .max(120, t("booking.errors.fullName")),
    // The server ignores spaces and dashes, then allows 6-20 digits with an optional "+".
    phone: z
      .string()
      .trim()
      .refine(
        (value) => /^\+?\d{6,20}$/.test(value.replace(/[\s-]/g, "")),
        t("booking.errors.phone"),
      ),
    age: z
      .string()
      .trim()
      .regex(/^\d{1,3}$/, t("booking.errors.age"))
      .refine((value) => Number(value) <= 120, t("booking.errors.age")),
    date: z.string().min(1, t("booking.errors.date")),
    scheduledAt: z.string().min(1, t("booking.errors.time")),
    notes: z.string().trim().max(2000, t("booking.errors.notes")),
  });

export type BookingValues = z.infer<ReturnType<typeof createBookingSchema>>;
