import { PRIVILEGES, type Privilege } from "../constants.js";
import type { UserDocument } from "../models/user.model.js";

// What a user may do. Admins have every privilege; patients have none.
export function effectivePrivileges(user: UserDocument): Privilege[] {
  if (user.role === "admin") return [...PRIVILEGES];
  if (user.role === "patient") return [];
  return user.privileges;
}

export function hasPrivileges(user: UserDocument, required: readonly Privilege[]): boolean {
  const granted = effectivePrivileges(user);
  return required.every((privilege) => granted.includes(privilege));
}

// Mongo filter limiting patient queries to what the user may see:
// the admin sees everyone; others only patients in scope that are not hidden.
export function patientScopeFilter(user: UserDocument) {
  if (user.role === "admin") return {};
  if (user.role === "therapist" && user.patientScope.all) return { isHidden: false };
  const ids = user.role === "therapist" ? user.patientScope.patientIds : [];
  return { _id: { $in: ids }, isHidden: false };
}
