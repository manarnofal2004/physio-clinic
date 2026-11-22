import { Router } from "express";
import {
  getMyFile,
  getMyPatient,
  getMyReport,
  listMyReports,
} from "../controllers/me.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";
import { listMyReportsQuery } from "../validators/me.validators.js";

// A logged-in patient's own record, reports and report files (read only).
export const meRouter = Router();

meRouter.use(authenticate, authorize("patient"));

meRouter.get("/patient", getMyPatient);
meRouter.get("/reports", validate({ query: listMyReportsQuery }), listMyReports);
meRouter.get("/reports/:id", validate({ params: idParams }), getMyReport);
meRouter.get("/files/:id", validate({ params: idParams }), getMyFile);
