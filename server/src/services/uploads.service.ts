import { Readable } from "node:stream";
import mongoose, { Types } from "mongoose";
import type { UploadMimeType } from "../constants.js";
import type { ReportAttachment } from "../models/report.model.js";
import type { UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";

// Files live in MongoDB GridFS, bucket "uploads" (collections uploads.files and uploads.chunks).
const BUCKET = "uploads";
const ORPHAN_AFTER_MS = 24 * 60 * 60 * 1000;

interface UploadMetadata {
  mimeType: UploadMimeType;
  uploadedBy: Types.ObjectId;
  reportId: Types.ObjectId | null; // null until a report uses the file
}

type StoredFile = mongoose.mongo.GridFSFile & { metadata: UploadMetadata };

function db() {
  const database = mongoose.connection.db;
  if (!database) throw new Error("Database is not connected");
  return database;
}

function bucket() {
  return new mongoose.mongo.GridFSBucket(db(), { bucketName: BUCKET });
}

function files() {
  return db().collection<StoredFile>(`${BUCKET}.files`);
}

// The browser's claimed type is not trusted: the first bytes must match it.
const SIGNATURES: Record<UploadMimeType, (bytes: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (b) =>
    b.subarray(0, 4).toString("latin1") === "RIFF" &&
    b.subarray(8, 12).toString("latin1") === "WEBP",
  "application/pdf": (b) => b.subarray(0, 5).toString("latin1") === "%PDF-",
};

export function contentMatchesType(buffer: Buffer, mimeType: UploadMimeType): boolean {
  return SIGNATURES[mimeType](buffer);
}

// Keeps the name readable but drops folders and characters that are unsafe in headers or paths.
export function safeFilename(original: string): string {
  const base = original.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}._ -]/gu, "_")
    .replace(/^\.+/, "")
    .trim()
    .slice(-100);
  return cleaned || "file";
}

export function toAttachment(file: StoredFile): ReportAttachment {
  return {
    fileId: file._id,
    filename: file.filename,
    mimeType: file.metadata.mimeType,
    size: file.length,
    uploadedAt: file.uploadDate,
  };
}

export function toAttachmentDto(attachment: ReportAttachment) {
  return {
    id: String(attachment.fileId),
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size,
    uploadedAt: attachment.uploadedAt,
  };
}

export async function storeFile(
  buffer: Buffer,
  filename: string,
  mimeType: UploadMimeType,
  user: UserDocument,
): Promise<StoredFile> {
  const metadata: UploadMetadata = { mimeType, uploadedBy: user._id, reportId: null };
  const upload = bucket().openUploadStream(safeFilename(filename), { metadata });
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer).pipe(upload).on("finish", resolve).on("error", reject);
  });

  const stored = await files().findOne({ _id: upload.id });
  if (!stored) throw new Error("Upload was not saved");
  return stored;
}

export function findFile(id: string): Promise<StoredFile | null> {
  return files().findOne({ _id: new Types.ObjectId(id) });
}

export function openFileStream(id: Types.ObjectId) {
  return bucket().openDownloadStream(id);
}

// Files to attach must exist and be unused, or already belong to this report.
// Non-admins can only attach files they uploaded themselves.
export async function claimFiles(
  ids: string[],
  reportId: Types.ObjectId,
  user: UserDocument,
): Promise<ReportAttachment[]> {
  if (ids.length === 0) return [];

  const objectIds = ids.map((id) => new Types.ObjectId(id));
  const unused =
    user.role === "admin"
      ? { "metadata.reportId": null }
      : { "metadata.reportId": null, "metadata.uploadedBy": user._id };
  const found = await files()
    .find({ _id: { $in: objectIds }, $or: [{ "metadata.reportId": reportId }, unused] })
    .toArray();
  if (found.length !== ids.length) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Some attachments do not exist or are already used",
      [{ field: "body.attachmentIds", message: "Upload the files again and use the new ids" }],
    );
  }

  await files().updateMany(
    { _id: { $in: objectIds } },
    { $set: { "metadata.reportId": reportId } },
  );
  const byId = new Map(found.map((file) => [String(file._id), file]));
  return ids.map((id) => toAttachment(byId.get(id) as StoredFile));
}

export async function deleteFiles(ids: Types.ObjectId[]): Promise<void> {
  const gridfs = bucket();
  await Promise.all(
    ids.map((id) =>
      gridfs.delete(id).catch((err: unknown) => {
        // Already gone is fine; anything else is a real problem.
        if (!(err instanceof Error && /not found/i.test(err.message))) throw err;
      }),
    ),
  );
}

// Uploads never attached to a report are removed after 24 hours.
export async function deleteOrphanUploads(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - ORPHAN_AFTER_MS);
  const orphans = await files()
    .find({ "metadata.reportId": null, uploadDate: { $lt: cutoff } }, { projection: { _id: 1 } })
    .toArray();
  await deleteFiles(orphans.map((file) => file._id));
  return orphans.length;
}
