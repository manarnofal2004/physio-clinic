import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { REPORT_PROGRESS, type ReportProgress } from "../constants.js";

// A copy of the file's details, so reading a report needs no GridFS lookup.
export interface ReportAttachment {
  fileId: Types.ObjectId; // id in the GridFS "uploads" bucket
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface IReport {
  patientId: Types.ObjectId;
  therapistId: Types.ObjectId | null;
  date: Date;
  diagnosis: string;
  treatmentPlan: string;
  sessionNotes: string | null;
  progress: ReportProgress;
  attachments: ReportAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export type ReportDocument = HydratedDocument<IReport>;

const attachmentSchema = new Schema<ReportAttachment>(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false },
);

const reportSchema = new Schema<IReport>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: "Therapist", default: null },
    date: { type: Date, required: true },
    diagnosis: { type: String, required: true, trim: true },
    treatmentPlan: { type: String, required: true, trim: true },
    sessionNotes: { type: String, default: null },
    progress: { type: String, enum: REPORT_PROGRESS, required: true },
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true },
);

reportSchema.index({ patientId: 1, date: -1 });
reportSchema.index({ date: -1 });
reportSchema.index({ progress: 1, date: -1 });

export const Report = model<IReport>("Report", reportSchema);
