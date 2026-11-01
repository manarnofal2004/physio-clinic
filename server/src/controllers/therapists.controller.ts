import type { RequestHandler } from "express";
import { Therapist, type TherapistDocument } from "../models/therapist.model.js";
import { User } from "../models/user.model.js";
import { freeTherapists } from "../services/schedule.service.js";
import { AppError } from "../utils/app-error.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import { buildSearchFilter } from "../utils/search.js";
import type { ListTherapistsQuery, TherapistBody } from "../validators/therapists.validators.js";

function toTherapistDto(therapist: TherapistDocument, hasAccount: boolean) {
  return {
    id: therapist.id as string,
    fullName: therapist.fullName,
    phone: therapist.phone,
    specialty: therapist.specialty,
    isActive: therapist.isActive,
    hasAccount,
    schedule: therapist.schedule.map(({ day, start, end }) => ({ day, start, end })),
    createdAt: therapist.createdAt,
    updatedAt: therapist.updatedAt,
  };
}

async function findTherapistOr404(id: string): Promise<TherapistDocument> {
  const therapist = await Therapist.findById(id);
  if (!therapist) throw new AppError(404, "NOT_FOUND", "Therapist not found");
  return therapist;
}

async function hasAccount(therapistId: string): Promise<boolean> {
  return Boolean(await User.exists({ therapistId }));
}

// Ids of the given therapists that have a login. One query for the whole list.
async function therapistIdsWithAccount(therapists: TherapistDocument[]): Promise<Set<string>> {
  const users = await User.find(
    { therapistId: { $in: therapists.map((t) => t._id) } },
    "therapistId",
  );
  return new Set(users.map((user) => String(user.therapistId)));
}

export const listTherapists: RequestHandler = async (req, res) => {
  const { page, limit, sort, search, isActive } = req.query as unknown as ListTherapistsQuery;
  const filter = {
    ...buildSearchFilter(search, ["fullName", "specialty"]),
    ...(isActive !== undefined && { isActive }),
  };

  const [therapists, total] = await Promise.all([
    Therapist.find(filter).sort(sort).skip(getSkip(page, limit)).limit(limit),
    Therapist.countDocuments(filter),
  ]);

  const withAccount = await therapistIdsWithAccount(therapists);
  const items = therapists.map((t) => toTherapistDto(t, withAccount.has(t.id as string)));
  sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
};

// Therapists who can take a session at that moment, for the "assign" select.
export const listFreeTherapists: RequestHandler = async (req, res) => {
  const { scheduledAt, excludeReservationId } = req.query as unknown as {
    scheduledAt: Date;
    excludeReservationId?: string;
  };
  const therapists = await freeTherapists(scheduledAt, excludeReservationId);
  const withAccount = await therapistIdsWithAccount(therapists);
  sendSuccess(
    res,
    therapists.map((t) => toTherapistDto(t, withAccount.has(t.id as string))),
  );
};

export const createTherapist: RequestHandler = async (req, res) => {
  const therapist = await Therapist.create(req.body as TherapistBody);
  sendSuccess(res, toTherapistDto(therapist, false), { status: 201 });
};

export const getTherapist: RequestHandler = async (req, res) => {
  const therapist = await findTherapistOr404(req.params.id as string);
  sendSuccess(res, toTherapistDto(therapist, await hasAccount(therapist.id as string)));
};

export const updateTherapist: RequestHandler = async (req, res) => {
  const therapist = await findTherapistOr404(req.params.id as string);
  therapist.set(req.body as TherapistBody);
  await therapist.save();
  sendSuccess(res, toTherapistDto(therapist, await hasAccount(therapist.id as string)));
};
