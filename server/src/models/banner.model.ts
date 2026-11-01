import { Schema, model, type HydratedDocument } from "mongoose";
import { BANNER_MESSAGE_MAX, BANNER_TYPES, type BannerType } from "../constants.js";

export interface IBanner {
  type: BannerType;
  messageEn: string;
  messageAr: string;
  isActive: boolean;
  order: number; // lower shows first
  createdAt: Date;
  updatedAt: Date;
}

export type BannerDocument = HydratedDocument<IBanner>;

const bannerSchema = new Schema<IBanner>(
  {
    type: { type: String, enum: BANNER_TYPES, required: true },
    messageEn: { type: String, required: true, trim: true, maxlength: BANNER_MESSAGE_MAX },
    messageAr: { type: String, required: true, trim: true, maxlength: BANNER_MESSAGE_MAX },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

bannerSchema.index({ isActive: 1, order: 1 });

export const Banner = model<IBanner>("Banner", bannerSchema);
