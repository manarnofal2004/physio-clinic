import { Router } from "express";
import { getUpload, postUploads } from "../controllers/uploads.controller.js";
import { authenticate, requirePrivilege } from "../middleware/auth.js";
import { receiveFiles } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { idParams } from "../validators/common.js";

export const uploadsRouter = Router();

uploadsRouter.use(authenticate);

uploadsRouter.post("/", requirePrivilege("reports.edit"), receiveFiles, postUploads);
uploadsRouter.get(
  "/:id",
  requirePrivilege("reports.view"),
  validate({ params: idParams }),
  getUpload,
);
