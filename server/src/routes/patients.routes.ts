import { Router } from "express";
import {
  createPatient,
  exportPatients,
  getPatient,
  hidePatient,
  listPatients,
  updatePatient,
  updatePatientStatus,
} from "../controllers/patients.controller.js";
import { authenticate, authorize, requirePrivilege } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import {
  listPatientsQuery,
  patientBody,
  patientHideBody,
  patientStatusBody,
} from "../validators/patients.validators.js";

// No DELETE: patients move to "completed", and the admin can hide them.
export const patientsRouter = Router();

patientsRouter.use(authenticate);

const canView = requirePrivilege("patients.view");
const canEdit = requirePrivilege("patients.edit");

patientsRouter.get("/", canView, validate({ query: listPatientsQuery }), listPatients);
patientsRouter.get("/export", canView, validate({ query: listPatientsQuery }), exportPatients);
patientsRouter.post("/", canEdit, validate({ body: patientBody }), createPatient);
patientsRouter.get("/:id", canView, validate({ params: idParams }), getPatient);
patientsRouter.put(
  "/:id",
  canEdit,
  validate({ params: idParams, body: patientBody }),
  updatePatient,
);
patientsRouter.patch(
  "/:id/status",
  canEdit,
  validate({ params: idParams, body: patientStatusBody }),
  updatePatientStatus,
);
patientsRouter.patch(
  "/:id/hide",
  authorize("admin"),
  validate({ params: idParams, body: patientHideBody }),
  hidePatient,
);
