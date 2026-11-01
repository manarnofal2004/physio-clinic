import { Router } from "express";
import {
  createReport,
  deleteReport,
  exportReports,
  getReport,
  listReports,
  updateReport,
} from "../controllers/reports.controller.js";
import { authenticate, requirePrivilege } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { listReportsQuery, reportBody } from "../validators/reports.validators.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate);

const canView = requirePrivilege("reports.view");
const canEdit = requirePrivilege("reports.edit");

reportsRouter.get("/", canView, validate({ query: listReportsQuery }), listReports);
reportsRouter.get("/export", canView, validate({ query: listReportsQuery }), exportReports);
reportsRouter.post("/", canEdit, validate({ body: reportBody }), createReport);
reportsRouter.get("/:id", canView, validate({ params: idParams }), getReport);
reportsRouter.put("/:id", canEdit, validate({ params: idParams, body: reportBody }), updateReport);
reportsRouter.delete("/:id", canEdit, validate({ params: idParams }), deleteReport);
