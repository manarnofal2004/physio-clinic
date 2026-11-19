import { z } from "zod";
import { MAX_FILES, REPORT_PROGRESS } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { objectId } from "./common.js";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

// POST and PUT take the same body. On PUT, attachmentIds is the full new list.
export const reportBody = z.object({
  patientId: objectId,
  therapistId: objectId.nullish(),
  date: z.iso.datetime({ offset: true }).transform((value) => new Date(value)),
  diagnosis: z.string().trim().min(2).max(2000),
  treatmentPlan: z.string().trim().min(2).max(2000),
  sessionNotes: z
    .string()
    .trim()
    .max(5000)
    .nullish()
    .transform((value) => value || null),
  progress: z.enum(REPORT_PROGRESS),
  attachmentIds: z
    .array(objectId)
    .max(MAX_FILES, `At most ${MAX_FILES} files per report`)
    .default([])
    .transform((ids) => [...new Set(ids)]),
});

export type ReportBody = z.infer<typeof reportBody>;

export const listReportsQuery = listQuerySchema(
  ["date", "progress", "createdAt"] as const,
  "-date",
).extend({
  patientId: objectId.optional(),
  progress: z.enum(REPORT_PROGRESS).optional(),
  from: day.optional(),
  to: day.optional(),
});

export type ListReportsQuery = z.infer<typeof listReportsQuery>;
