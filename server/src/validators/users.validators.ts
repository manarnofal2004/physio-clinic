import { z } from "zod";
import { PRIVILEGES, ROLES } from "../constants.js";
import { listQuerySchema } from "../utils/pagination.js";
import { booleanQuery, email, fullName, objectId, password } from "./common.js";

const privileges = z
  .array(z.enum(PRIVILEGES))
  .max(PRIVILEGES.length * 2)
  .transform((list) => [...new Set(list)]);

const patientScope = z.discriminatedUnion("all", [
  z.object({ all: z.literal(true) }),
  z.object({ all: z.literal(false), patientIds: z.array(objectId).max(5000) }),
]);

const accountFields = { fullName, email, password };

export const createUserBody = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("therapist"),
    therapistId: objectId,
    ...accountFields,
    privileges: privileges.default([]),
    patientScope: patientScope.default({ all: false, patientIds: [] }),
  }),
  z.object({
    role: z.literal("patient"),
    patientId: objectId,
    ...accountFields,
  }),
]);

export type CreateUserBody = z.infer<typeof createUserBody>;

export const updateAccessBody = z.object({ privileges, patientScope });

export type UpdateAccessBody = z.infer<typeof updateAccessBody>;

export const updateStatusBody = z.object({ isActive: z.boolean() });

export const listUsersQuery = listQuerySchema(["fullName", "role", "createdAt"] as const).extend({
  role: z.enum(ROLES).optional(),
  isActive: booleanQuery.optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuery>;
