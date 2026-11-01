import type { Request, RequestHandler } from "express";
import type { Privilege, Role } from "../constants.js";
import { User, type UserDocument } from "../models/user.model.js";
import { hasPrivileges } from "../services/access.service.js";
import { readToken } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

async function userFromRequest(req: Request): Promise<UserDocument | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  const userId = readToken(header.slice("Bearer ".length));
  if (!userId) return null;

  const user = await User.findById(userId);
  return user?.isActive ? user : null;
}

// 401 unless the request has a valid token for an active account.
export const authenticate: RequestHandler = async (req, _res, next) => {
  const user = await userFromRequest(req);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Log in to continue");
  req.user = user;
  next();
};

// For public routes that behave differently for logged-in users (booking).
// A missing or bad token just means "guest".
export const optionalAuthenticate: RequestHandler = async (req, _res, next) => {
  req.user = (await userFromRequest(req)) ?? undefined;
  next();
};

// The logged-in user, for handlers behind authenticate.
export function currentUser(req: Request): UserDocument {
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Log in to continue");
  return req.user;
}

// 403 unless the user has one of the roles. Use after authenticate.
export function authorize(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!roles.includes(currentUser(req).role)) {
      throw new AppError(403, "FORBIDDEN", "You are not allowed to do this");
    }
    next();
  };
}

// 403 unless the user has every listed privilege. Admins always pass.
export function requirePrivilege(...privileges: Privilege[]): RequestHandler {
  return (req, _res, next) => {
    if (!hasPrivileges(currentUser(req), privileges)) {
      throw new AppError(403, "FORBIDDEN", "You are not allowed to do this");
    }
    next();
  };
}
