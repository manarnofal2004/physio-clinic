import type { RequestHandler } from "express";
import { Types } from "mongoose";
import { Patient } from "../models/patient.model.js";
import { Therapist } from "../models/therapist.model.js";
import { User, type PatientScope, type UserDocument } from "../models/user.model.js";
import { hashPassword } from "../services/auth.service.js";
import { toUserDto } from "../services/user-dto.js";
import { AppError } from "../utils/app-error.js";
import { buildPaginationMeta, getSkip } from "../utils/pagination.js";
import { sendSuccess } from "../utils/response.js";
import { buildSearchFilter } from "../utils/search.js";
import type {
  CreateUserBody,
  ListUsersQuery,
  UpdateAccessBody,
} from "../validators/users.validators.js";

// The API's { all: true } | { all: false, patientIds } as the model stores it.
function toStoredScope(scope: UpdateAccessBody["patientScope"]): PatientScope {
  return scope.all
    ? { all: true, patientIds: [] }
    : { all: false, patientIds: scope.patientIds.map((id) => new Types.ObjectId(id)) };
}

async function findUserOr404(id: string): Promise<UserDocument> {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
  return user;
}

export const listUsers: RequestHandler = async (req, res) => {
  const { page, limit, sort, search, role, isActive } = req.query as unknown as ListUsersQuery;
  const filter = {
    ...buildSearchFilter(search, ["fullName", "email"]),
    ...(role && { role }),
    ...(isActive !== undefined && { isActive }),
  };

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(getSkip(page, limit)).limit(limit),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, users.map(toUserDto), { meta: buildPaginationMeta(page, limit, total) });
};

export const createUser: RequestHandler = async (req, res) => {
  const body = req.body as CreateUserBody;

  if (await User.exists({ email: body.email })) {
    throw new AppError(409, "CONFLICT", "This email is already in use");
  }

  // The account must point to an existing record that has no account yet.
  const link =
    body.role === "therapist"
      ? {
          field: "therapistId" as const,
          id: body.therapistId,
          exists: Therapist.exists({ _id: body.therapistId }),
        }
      : {
          field: "patientId" as const,
          id: body.patientId,
          exists: Patient.exists({ _id: body.patientId }),
        };
  if (!(await link.exists)) {
    throw new AppError(
      404,
      "NOT_FOUND",
      `${body.role === "therapist" ? "Therapist" : "Patient"} not found`,
    );
  }
  if (await User.exists({ [link.field]: link.id })) {
    throw new AppError(409, "CONFLICT", `This ${body.role} already has an account`);
  }

  const user = await User.create({
    role: body.role,
    fullName: body.fullName,
    email: body.email,
    password: await hashPassword(body.password),
    [link.field]: link.id,
    ...(body.role === "therapist" && {
      privileges: body.privileges,
      patientScope: toStoredScope(body.patientScope),
    }),
  });
  sendSuccess(res, toUserDto(user), { status: 201 });
};

export const getUser: RequestHandler = async (req, res) => {
  sendSuccess(res, toUserDto(await findUserOr404(req.params.id as string)));
};

export const updateUserAccess: RequestHandler = async (req, res) => {
  const user = await findUserOr404(req.params.id as string);
  if (user.role !== "therapist") {
    throw new AppError(400, "VALIDATION_ERROR", "Only therapist accounts have privileges");
  }

  const { privileges, patientScope } = req.body as UpdateAccessBody;
  user.privileges = privileges;
  user.patientScope = toStoredScope(patientScope);
  await user.save();
  sendSuccess(res, toUserDto(user));
};

export const updateUserStatus: RequestHandler = async (req, res) => {
  const user = await findUserOr404(req.params.id as string);
  if (user.role === "admin") {
    throw new AppError(403, "FORBIDDEN", "Admin accounts cannot be turned off");
  }

  user.isActive = (req.body as { isActive: boolean }).isActive;
  await user.save();
  sendSuccess(res, toUserDto(user));
};
