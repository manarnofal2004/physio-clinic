import { z } from "zod";
import { BANNER_MESSAGE_MAX, BANNER_TYPES } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { booleanQuery } from "./common.js";

const message = z.string().trim().min(1).max(BANNER_MESSAGE_MAX);
const type = z.enum(BANNER_TYPES);
const order = z.number().int().min(0).max(1000);

// POST and PUT take the whole banner.
export const bannerBody = z.object({
  type,
  messageEn: message,
  messageAr: message,
  isActive: z.boolean().default(true),
  order: order.default(0),
});

export type BannerBody = z.infer<typeof bannerBody>;

// PATCH changes only the fields sent, for example { "isActive": false } or { "order": 2 }.
export const bannerPatchBody = z
  .object({
    type: type.optional(),
    messageEn: message.optional(),
    messageAr: message.optional(),
    isActive: z.boolean().optional(),
    order: order.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Send at least one field to change",
  });

export const listBannersQuery = listQuerySchema(["order", "createdAt"] as const, "order").extend({
  isActive: booleanQuery.optional(),
});

export type ListBannersQuery = z.infer<typeof listBannersQuery>;
