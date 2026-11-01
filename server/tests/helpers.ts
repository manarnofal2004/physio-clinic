import request from "supertest";
import { createApp } from "../src/app.js";
import { Therapist } from "../src/models/therapist.model.js";
import { User, type IUser } from "../src/models/user.model.js";
import { hashPassword, signToken } from "../src/services/auth.service.js";

export const api = request(createApp());

let counter = 0;

// Creates a user straight in the database and returns a token for it.
export async function createUser(overrides: Partial<IUser> = {}) {
  counter += 1;
  const password = "Password123";
  const user = await User.create({
    fullName: `Test User ${counter}`,
    email: `user${counter}@test.com`,
    role: "admin",
    ...overrides,
    password: await hashPassword(password),
  });
  return { user, password, token: signToken(user.id as string) };
}

export function createTherapistProfile(fullName = "Dr. Test") {
  return Therapist.create({
    fullName,
    schedule: [{ day: 0, start: "08:00", end: "14:00" }],
  });
}

export function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}
