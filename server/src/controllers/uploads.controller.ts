import type { RequestHandler } from "express";
import { currentUser } from "../middleware/auth.js";
import { uploadedFiles } from "../middleware/upload.js";
import { Report } from "../models/report.model.js";
import { findPatientInScope } from "../services/patients.service.js";
import {
  contentMatchesType,
  findFile,
  openFileStream,
  storeFile,
  toAttachment,
  toAttachmentDto,
} from "../services/uploads.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/response.js";

export const postUploads: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const incoming = uploadedFiles(req);

  // Check every file before saving any, so a bad file leaves nothing behind.
  const bad = incoming.find((file) => !contentMatchesType(file.buffer, file.mimetype));
  if (bad) {
    throw new AppError(
      400,
      "UNSUPPORTED_FILE_TYPE",
      `"${bad.originalname}" is not a real ${bad.mimetype} file`,
    );
  }

  const stored = [];
  for (const file of incoming) {
    stored.push(await storeFile(file.buffer, file.originalname, file.mimetype, user));
  }
  sendSuccess(
    res,
    stored.map((file) => toAttachmentDto(toAttachment(file))),
    { status: 201 },
  );
};

// A file attached to a report is visible to whoever can see that report's patient.
// An unattached upload is visible only to the person who uploaded it and the admin.
export const getUpload: RequestHandler = async (req, res) => {
  const user = currentUser(req);
  const file = await findFile(req.params.id as string);
  if (!file) throw new AppError(404, "NOT_FOUND", "File not found");

  const { reportId, uploadedBy, mimeType } = file.metadata;
  if (reportId) {
    const report = await Report.findById(reportId, "patientId");
    if (!report) throw new AppError(404, "NOT_FOUND", "File not found");
    await findPatientInScope(user, String(report.patientId));
  } else if (user.role !== "admin" && !uploadedBy.equals(user._id)) {
    throw new AppError(404, "NOT_FOUND", "File not found");
  }

  const asciiName = file.filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Length", String(file.length));
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
  );
  res.setHeader("Cache-Control", "private, max-age=3600");

  await new Promise<void>((resolve, reject) => {
    openFileStream(file._id).on("error", reject).pipe(res).on("finish", resolve);
  });
};
