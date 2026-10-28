import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function signToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

// Returns the user id from a valid token, or null for a missing, invalid or expired one.
export function readToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return typeof payload === "object" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// Same error for an unknown email and a wrong password, so emails cannot be guessed.
export async function login(email: string, password: string): Promise<UserDocument> {
  const user = await User.findOne({ email }).select("+password");
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  if (!user.isActive) {
    throw new AppError(403, "ACCOUNT_DISABLED", "This account is turned off");
  }
  return user;
}
