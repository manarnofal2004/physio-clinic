import type { RequestHandler } from "express";
import { currentUser } from "../middleware/auth.js";
import { Report } from "../models/report.model.js";
import { Therapist } from "../models/therapist.model.js";
import type { UserDocument } from "../models/user.model.js";
import { findPatientInScope } from "../services/patients.service.js";
import {
  buildReportListFilter,
  findReportInScope,
  syncLastVisit,
  toReportDtos,
} from "../services/reports.service.js";
import { claimFiles, deleteFiles } from "../services/uploads.service.js";
import { AppError } from "../utils/app-error.js";
import { sendCsv, toCsv } from "../utils/csv.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import type { ListReportsQuery, ReportBody } from "../validators/reports.validators.js";

const EXPORT_LIMIT = 10_000;

// A therapist's own reports default to them; anyone else may name a therapist or none.
async function resolveTherapistId(user: UserDocument, requested: string | null | undefined) {
  if (requested) {
    if (!(await Therapist.exists({ _id: requested }))) {
      throw new AppError(404, "NOT_FOUND", "Therapist not found");
    }
    return requested;
  }
  return user.role === "therapist" ? user.therapistId : null;
}

export const listReports: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListReportsQuery;
  const filter = await buildReportListFilter(currentUser(req), query);

  const [reports, total] = await Promise.all([
    Report.find(filter).sort(query.sort).skip(getSkip(query.page, query.limit)).limit(query.limit),
    Report.countDocuments(filter),
  ]);
  sendSuccess(res, await toReportDtos(reports), {
    meta: buildPaginationMeta(query.page, query.limit, total),
  });
};

export const exportReports: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListReportsQuery;
  const filter = await buildReportListFilter(currentUser(req), query);
  const reports = await toReportDtos(
    await Report.find(filter).sort(query.sort).limit(EXPORT_LIMIT),
  );

  const csv = toCsv(reports, [
    { header: "Date", value: (r) => r.date },
    { header: "Patient", value: (r) => r.patient.fullName },
    { header: "Diagnosis", value: (r) => r.diagnosis },
    { header: "Treatment plan", value: (r) => r.treatmentPlan },
    { header: "Session notes", value: (r) => r.sessionNotes },
    { header: "Progress", value: (r) => r.progress },
    { header: "Attachments", value: (r) => r.attachments.length },
  ]);
  sendCsv(res, `reports-${new Date().toISOString().slice(0, 10)}.csv`, csv);
};

export const getReport: RequestHandler = async (req, res) => {
  const report = await findReportInScope(currentUser(req), req.params.id as string);
  const [dto] = await toReportDtos([report]);
  sendSuccess(res, dto);
};

export const createReport: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const { attachmentIds, therapistId, ...fields } = req.body as ReportBody;
  const patient = await findPatientInScope(user, fields.patientId);

  const report = new Report({
    ...fields,
    therapistId: await resolveTherapistId(user, therapistId),
  });
  report.attachments = await claimFiles(attachmentIds, report._id, user);
  await report.save();
  await syncLastVisit(patient._id);

  const [dto] = await toReportDtos([report]);
  sendSuccess(res, dto, { status: 201 });
};

export const updateReport: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const report = await findReportInScope(user, req.params.id as string);
  const { attachmentIds, therapistId, ...fields } = req.body as ReportBody;
  const newPatient = await findPatientInScope(user, fields.patientId);
  const oldPatientId = report.patientId;

  // attachmentIds is the full new list: files left out are deleted.
  const removed = report.attachments
    .filter((a) => !attachmentIds.includes(String(a.fileId)))
    .map((a) => a.fileId);

  report.set({
    ...fields,
    therapistId: await resolveTherapistId(user, therapistId ?? report.therapistId?.toString()),
  });
  report.attachments = await claimFiles(attachmentIds, report._id, user);
  await report.save();
  await deleteFiles(removed);

  await syncLastVisit(newPatient._id);
  if (!oldPatientId.equals(newPatient._id)) await syncLastVisit(oldPatientId);

  const [dto] = await toReportDtos([report]);
  sendSuccess(res, dto);
};

export const deleteReport: RequestHandler = async (req, res) => {
  const report = await findReportInScope(currentUser(req), req.params.id as string);
  await report.deleteOne();
  await deleteFiles(report.attachments.map((a) => a.fileId));
  await syncLastVisit(report.patientId);
  sendSuccess(res, null);
};
