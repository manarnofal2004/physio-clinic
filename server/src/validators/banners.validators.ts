import { z } from "zod";
import { BANNER_MESSAGE_MAX, BANNER_TYPES } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { booleanQuery } from "./common.js";

const message = z.string().trim().min(1).max(BANNER_MESSAGE_MAX);

// POST and PUT take the same body. Turn a banner on or off with isActive.
export const bannerBody = z.object({
  type: z.enum(BANNER_TYPES),
  messageEn: message,
  messageAr: message,
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).max(1000).default(0),
});

export type BannerBody = z.infer<typeof bannerBody>;

export const listBannersQuery = listQuerySchema(["order", "createdAt"] as const, "order").extend({
  isActive: booleanQuery.optional(),
});

export type ListBannersQuery = z.infer<typeof listBannersQuery>;
