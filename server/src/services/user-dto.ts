import type { UserDocument } from "../models/user.model.js";
import { effectivePrivileges } from "./access.service.js";

// The user as the API returns it (see docs/api/auth.md). Never includes the password.
export function toUserDto(user: UserDocument) {
  const { patientScope } = user;
  let scope: { all: true } | { all: false; patientIds: string[] } | null = null;
  if (user.role === "admin") scope = { all: true };
  if (user.role === "therapist") {
    scope = patientScope.all
      ? { all: true }
      : { all: false, patientIds: patientScope.patientIds.map(String) };
  }

  return {
    id: user.id as string,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    patientId: user.patientId?.toString() ?? null,
    therapistId: user.therapistId?.toString() ?? null,
    privileges: effectivePrivileges(user),
    patientScope: scope,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
