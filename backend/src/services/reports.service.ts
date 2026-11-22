import type { Types } from "mongoose";
import { env } from "../config/env.js";
import { Patient } from "../models/patient.model.js";
import { Report, type ReportDocument } from "../models/report.model.js";
import { Therapist } from "../models/therapist.model.js";
import type { UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { buildSearchFilter } from "../utils/search.js";
import { dayRangeFilter } from "../utils/time.js";
import type { ListReportsQuery } from "../validators/reports.validators.js";
import { patientScopeFilter } from "./access.service.js";
import { toAttachmentDto } from "./uploads.service.js";

// Reports follow their patient: only reports of patients the user may see.
export async function reportScopeFilter(user: UserDocument): Promise<Record<string, unknown>> {
  if (user.role === "admin") return {};
  const visiblePatientIds = await Patient.distinct("_id", patientScopeFilter(user));
  return { patientId: { $in: visiblePatientIds } };
}

export async function findReportInScope(user: UserDocument, id: string): Promise<ReportDocument> {
  const report = await Report.findOne({ $and: [await reportScopeFilter(user), { _id: id }] });
  if (!report) throw new AppError(404, "NOT_FOUND", "Report not found");
  return report;
}

export async function buildReportListFilter(user: UserDocument, query: ListReportsQuery) {
  const conditions: object[] = [await reportScopeFilter(user)];

  if (query.search) {
    // Search the text fields and the patient's name.
    const namedPatients = await Patient.distinct(
      "_id",
      buildSearchFilter(query.search, ["fullName"]),
    );
    conditions.push({
      $or: [
        buildSearchFilter(query.search, ["diagnosis", "treatmentPlan"]),
        { patientId: { $in: namedPatients } },
      ],
    });
  }
  if (query.patientId) conditions.push({ patientId: query.patientId });
  if (query.progress) conditions.push({ progress: query.progress });
  const range = dayRangeFilter(query.from, query.to, env.CLINIC_TIMEZONE);
  if (Object.keys(range).length > 0) conditions.push({ date: range });

  return { $and: conditions };
}

// The patient's lastVisit is always the date of their latest report (or null).
export async function syncLastVisit(patientId: Types.ObjectId): Promise<void> {
  const latest = await Report.findOne({ patientId }).sort({ date: -1 }).select("date");
  await Patient.updateOne({ _id: patientId }, { lastVisit: latest?.date ?? null });
}

// The patient's and physiotherapist's names come with each report, so a user who may
// read reports needs no other privilege to show who they are about and who wrote them.
export async function toReportDtos(reports: ReportDocument[]) {
  const [patients, therapists] = await Promise.all([
    Patient.find({ _id: { $in: reports.map((r) => r.patientId) } }, "fullName"),
    Therapist.find({ _id: { $in: reports.map((r) => r.therapistId).filter(Boolean) } }, "fullName"),
  ]);
  const names = new Map(patients.map((p) => [p.id as string, p.fullName]));
  const therapistNames = new Map(therapists.map((t) => [t.id as string, t.fullName]));

  return reports.map((report) => ({
    id: report.id as string,
    patient: { id: String(report.patientId), fullName: names.get(String(report.patientId)) ?? "" },
    therapistId: report.therapistId ? String(report.therapistId) : null,
    therapistName: report.therapistId
      ? (therapistNames.get(String(report.therapistId)) ?? null)
      : null,
    date: report.date,
    diagnosis: report.diagnosis,
    treatmentPlan: report.treatmentPlan,
    sessionNotes: report.sessionNotes,
    progress: report.progress,
    attachments: report.attachments.map(toAttachmentDto),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  }));
}
