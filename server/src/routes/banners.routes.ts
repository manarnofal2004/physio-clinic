import { Router } from "express";
import {
  createBanner,
  deleteBanner,
  listBanners,
  updateBanner,
} from "../controllers/banners.controller.js";
import { authenticate, requirePrivilege } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { bannerBody, bannerPatchBody, listBannersQuery } from "../validators/banners.validators.js";
import { idParams } from "../validators/common.js";

// Managing banners. The public list is GET /api/public/banners.
export const bannersRouter = Router();

bannersRouter.use(authenticate, requirePrivilege("banners.manage"));

bannersRouter.get("/", validate({ query: listBannersQuery }), listBanners);
bannersRouter.post("/", validate({ body: bannerBody }), createBanner);
bannersRouter.put("/:id", validate({ params: idParams, body: bannerBody }), updateBanner);
bannersRouter.patch("/:id", validate({ params: idParams, body: bannerPatchBody }), updateBanner);
bannersRouter.delete("/:id", validate({ params: idParams }), deleteBanner);
