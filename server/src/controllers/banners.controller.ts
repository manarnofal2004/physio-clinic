import type { RequestHandler } from "express";
import { Banner, type BannerDocument } from "../models/banner.model.js";
import { AppError } from "../utils/app-error.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import type { BannerBody, ListBannersQuery } from "../validators/banners.validators.js";

function toBannerDto(banner: BannerDocument) {
  return {
    id: banner.id as string,
    type: banner.type,
    messageEn: banner.messageEn,
    messageAr: banner.messageAr,
    isActive: banner.isActive,
    order: banner.order,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  };
}

async function findBannerOr404(id: string): Promise<BannerDocument> {
  const banner = await Banner.findById(id);
  if (!banner) throw new AppError(404, "NOT_FOUND", "Banner not found");
  return banner;
}

// Public: active banners in display order, for the scrolling bar on the landing page.
export const listPublicBanners: RequestHandler = async (_req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  sendSuccess(res, banners.map(toBannerDto));
};

export const listBanners: RequestHandler = async (req, res) => {
  const { page, limit, sort, isActive } = req.query as unknown as ListBannersQuery;
  const filter = isActive === undefined ? {} : { isActive };

  const [banners, total] = await Promise.all([
    Banner.find(filter).sort(sort).skip(getSkip(page, limit)).limit(limit),
    Banner.countDocuments(filter),
  ]);
  sendSuccess(res, banners.map(toBannerDto), { meta: buildPaginationMeta(page, limit, total) });
};

export const createBanner: RequestHandler = async (req, res) => {
  const banner = await Banner.create(req.body as BannerBody);
  sendSuccess(res, toBannerDto(banner), { status: 201 });
};

export const updateBanner: RequestHandler = async (req, res) => {
  const banner = await findBannerOr404(req.params.id as string);
  banner.set(req.body as BannerBody);
  await banner.save();
  sendSuccess(res, toBannerDto(banner));
};

export const deleteBanner: RequestHandler = async (req, res) => {
  const banner = await findBannerOr404(req.params.id as string);
  await banner.deleteOne();
  sendSuccess(res, null);
};
