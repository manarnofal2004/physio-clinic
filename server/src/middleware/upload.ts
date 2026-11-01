import type { RequestHandler } from "express";
import multer from "multer";
import {
  MAX_FILES,
  MAX_UPLOAD_BYTES,
  UPLOAD_MIME_TYPES,
  type UploadMimeType,
} from "../constants.js";
import { AppError } from "../utils/app-error.js";

// Files are kept in memory only long enough to be checked and streamed into GridFS.
const parseFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, accept) => {
    if ((UPLOAD_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      accept(null, true);
    } else {
      accept(new AppError(400, "UNSUPPORTED_FILE_TYPE", "Only JPEG, PNG, WebP and PDF files"));
    }
  },
}).array("files", MAX_FILES);

// Accepts up to 5 files in the "files" field and turns multer errors into API errors.
export const receiveFiles: RequestHandler = (req, res, next) => {
  parseFiles(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(new AppError(400, "FILE_TOO_LARGE", "Each file must be 5 MB or less"));
      } else {
        next(
          new AppError(400, "TOO_MANY_FILES", `Send 1 to ${MAX_FILES} files in the "files" field`),
        );
      }
      return;
    }
    if (err) {
      next(err);
      return;
    }
    if (!Array.isArray(req.files) || req.files.length === 0) {
      next(
        new AppError(400, "VALIDATION_ERROR", `Send 1 to ${MAX_FILES} files in the "files" field`),
      );
      return;
    }
    next();
  });
};

export function uploadedFiles(req: Parameters<RequestHandler>[0]) {
  return (req.files ?? []) as (Express.Multer.File & { mimetype: UploadMimeType })[];
}
