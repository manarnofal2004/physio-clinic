import type { Response } from "express";
import mongoose, { Types } from "mongoose";
import type { PhotoMimeType } from "../constants.js";

// Physiotherapists' photos live in their own GridFS bucket, "photos", so the hourly
// clean-up of unused report uploads never touches them.
const BUCKET = "photos";

interface PhotoMetadata {
  mimeType: PhotoMimeType;
  therapistId: Types.ObjectId;
}

type StoredPhoto = mongoose.mongo.GridFSFile & { metadata: PhotoMetadata };

function db() {
  const database = mongoose.connection.db;
  if (!database) throw new Error("Database is not connected");
  return database;
}

function bucket() {
  return new mongoose.mongo.GridFSBucket(db(), { bucketName: BUCKET });
}

export async function storePhoto(
  buffer: Buffer,
  mimeType: PhotoMimeType,
  therapistId: Types.ObjectId,
): Promise<Types.ObjectId> {
  const metadata: PhotoMetadata = { mimeType, therapistId };
  const upload = bucket().openUploadStream(`therapist-${String(therapistId)}`, { metadata });
  await new Promise<void>((resolve, reject) => {
    upload.on("error", reject).on("finish", resolve);
    upload.end(buffer);
  });
  return upload.id;
}

export async function deletePhoto(id: Types.ObjectId): Promise<void> {
  await bucket()
    .delete(id)
    .catch((err: unknown) => {
      // Already gone is fine; anything else is a real problem.
      if (!(err instanceof Error && /not found/i.test(err.message))) throw err;
    });
}

// Streams the photo. Each new photo gets a new id and the client asks for it by
// that id, so the browser may keep it for a day.
export async function sendPhoto(res: Response, id: Types.ObjectId): Promise<boolean> {
  const file = await db().collection<StoredPhoto>(`${BUCKET}.files`).findOne({ _id: id });
  if (!file) return false;

  res.setHeader("Content-Type", file.metadata.mimeType);
  res.setHeader("Content-Length", String(file.length));
  res.setHeader("Cache-Control", "private, max-age=86400");
  await new Promise<void>((resolve, reject) => {
    bucket().openDownloadStream(file._id).on("error", reject).pipe(res).on("finish", resolve);
  });
  return true;
}
