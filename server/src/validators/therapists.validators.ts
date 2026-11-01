import { z } from "zod";
import { CLINIC_CLOSES, CLINIC_OPENS, WORK_DAYS } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { booleanQuery, fullName } from "./common.js";

// "HH:mm" strings compare correctly as text ("08:30" < "14:00").
const clockTime = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm")
  .refine((time) => time >= CLINIC_OPENS && time <= CLINIC_CLOSES, {
    message: `Must be between ${CLINIC_OPENS} and ${CLINIC_CLOSES}`,
  });

const workingHours = z
  .object({
    day: z.union(WORK_DAYS.map((day) => z.literal(day))),
    start: clockTime,
    end: clockTime,
  })
  .refine((hours) => hours.end > hours.start, {
    message: "End must be after start",
    path: ["end"],
  });

// Several blocks on the same day are fine as long as they do not overlap.
const schedule = z
  .array(workingHours)
  .max(20)
  .superRefine((blocks, ctx) => {
    const sorted = [...blocks].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev && curr && prev.day === curr.day && curr.start < prev.end) {
        ctx.addIssue({ code: "custom", message: `Working hours overlap on day ${curr.day}` });
      }
    }
  });

export const therapistBody = z.object({
  fullName,
  phone: z.string().trim().min(6).max(30).nullish(),
  specialty: z.string().trim().max(120).nullish(),
  isActive: z.boolean().default(true),
  schedule,
});

export type TherapistBody = z.infer<typeof therapistBody>;

export const listTherapistsQuery = listQuerySchema(
  ["fullName", "createdAt"] as const,
  "fullName",
).extend({ isActive: booleanQuery.optional() });

export type ListTherapistsQuery = z.infer<typeof listTherapistsQuery>;
