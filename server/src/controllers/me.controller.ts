import type { RequestHandler } from "express";
import { currentUser } from "../middleware/auth.js";
import { Report } from "../models/report.model.js";
import {
  findPatientInScope,
  patientIdsWithAccount,
  toPatientDto,
} from "../services/patients.service.js";
import { findReportInScope, reportScopeFilter, toReportDtos } from "../services/reports.service.js";
import { findFile, sendStoredFile } from "../services/uploads.service.js";
import { AppError } from "../utils/app-error.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import type { ListMyReportsQuery } from "../validators/me.validators.js";

// A logged-in patient's own data. The patient scope is their own record, so the
// shared "in scope" helpers return only what belongs to them.

export const getMyPatient: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  if (!user.patientId) throw new AppError(404, "NOT_FOUND", "No patient record for this account");
  const patient = await findPatientInScope(user, String(user.patientId));
  const withAccount = await patientIdsWithAccount([patient]);
  sendSuccess(res, toPatientDto(patient, withAccount.has(patient.id as string)));
};

export const listMyReports: RequestHandler = async (req, res) => {
  const { page, limit, sort } = req.query as unknown as ListMyReportsQuery;
  const filter = await reportScopeFilter(currentUser(req));

  const [reports, total] = await Promise.all([
    Report.find(filter).sort(sort).skip(getSkip(page, limit)).limit(limit),
    Report.countDocuments(filter),
  ]);
  sendSuccess(res, await toReportDtos(reports), {
    meta: buildPaginationMeta(page, limit, total),
  });
};

export const getMyReport: RequestHandler = async (req, res) => {
  const report = await findReportInScope(currentUser(req), req.params.id as string);
  const [dto] = await toReportDtos([report]);
  sendSuccess(res, dto);
};

// Only files attached to one of the patient's own reports.
export const getMyFile: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const file = await findFile(req.params.id as string);
  const reportId = file?.metadata.reportId;
  if (!file || !reportId) throw new AppError(404, "NOT_FOUND", "File not found");

  await findReportInScope(user, String(reportId));
  await sendStoredFile(res, file);
};
