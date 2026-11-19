import type { RequestHandler, Response } from "express";
import type { PatientStatus } from "../constants.js";
import { currentUser } from "../middleware/auth.js";
import { Patient, type PatientDocument } from "../models/patient.model.js";
import { addPatientToScope } from "../services/access.service.js";
import {
  buildPatientListFilter,
  findPatientInScope,
  patientIdsWithAccount,
  toPatientDto,
} from "../services/patients.service.js";
import { sendCsv, toCsv } from "../utils/csv.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import type { ListPatientsQuery, PatientBody } from "../validators/patients.validators.js";

const EXPORT_LIMIT = 10_000;

export const listPatients: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListPatientsQuery;
  const filter = buildPatientListFilter(currentUser(req), query);

  const [patients, total] = await Promise.all([
    Patient.find(filter).sort(query.sort).skip(getSkip(query.page, query.limit)).limit(query.limit),
    Patient.countDocuments(filter),
  ]);
  const withAccount = await patientIdsWithAccount(patients);
  sendSuccess(
    res,
    patients.map((p) => toPatientDto(p, withAccount.has(p.id as string))),
    { meta: buildPaginationMeta(query.page, query.limit, total) },
  );
};

// Same search, filters and sort as the list, but every matching row and no paging.
export const exportPatients: RequestHandler = async (req, res) => {
  const query = req.query as unknown as ListPatientsQuery;
  const filter = buildPatientListFilter(currentUser(req), query);
  const patients = await Patient.find(filter).sort(query.sort).limit(EXPORT_LIMIT);

  const csv = toCsv(patients, [
    { header: "Full name", value: (p) => p.fullName },
    { header: "Phone", value: (p) => p.phone },
    { header: "Age", value: (p) => p.age },
    { header: "Gender", value: (p) => p.gender },
    { header: "Condition", value: (p) => p.condition },
    { header: "Status", value: (p) => p.status },
    { header: "Last visit", value: (p) => p.lastVisit },
    { header: "Address", value: (p) => p.address },
    { header: "Notes", value: (p) => p.notes },
    { header: "Created", value: (p) => p.createdAt },
  ]);
  const today = new Date().toISOString().slice(0, 10);
  sendCsv(res, `patients-${today}.csv`, csv);
};

export const createPatient: RequestHandler = async (req, res) => {
  const patient = await Patient.create(req.body as PatientBody);
  await addPatientToScope(currentUser(req), patient._id);
  sendSuccess(res, toPatientDto(patient, false), { status: 201 });
};

async function sendPatient(res: Response, patient: PatientDocument) {
  const withAccount = await patientIdsWithAccount([patient]);
  sendSuccess(res, toPatientDto(patient, withAccount.has(patient.id as string)));
}

export const getPatient: RequestHandler = async (req, res) => {
  await sendPatient(res, await findPatientInScope(currentUser(req), req.params.id as string));
};

export const updatePatient: RequestHandler = async (req, res) => {
  const patient = await findPatientInScope(currentUser(req), req.params.id as string);
  patient.set(req.body as PatientBody);
  await sendPatient(res, await patient.save());
};

export const updatePatientStatus: RequestHandler = async (req, res) => {
  const patient = await findPatientInScope(currentUser(req), req.params.id as string);
  patient.status = (req.body as { status: PatientStatus }).status;
  await sendPatient(res, await patient.save());
};

// Admin only (checked by the route), so the scope filter lets hidden patients through.
export const hidePatient: RequestHandler = async (req, res) => {
  const patient = await findPatientInScope(currentUser(req), req.params.id as string);
  patient.isHidden = (req.body as { isHidden: boolean }).isHidden;
  await sendPatient(res, await patient.save());
};
