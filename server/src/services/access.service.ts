import type { Types } from "mongoose";
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
// A patient's scope is their own record. Patients have no privileges, so this only
// matters on the /me routes.
export function patientScopeFilter(user: UserDocument) {
  if (user.role === "admin") return {};
  if (user.role === "therapist" && user.patientScope.all) return { isHidden: false };
  const ids =
    user.role === "therapist"
      ? user.patientScope.patientIds
      : user.patientId
        ? [user.patientId]
        : [];
  return { _id: { $in: ids }, isHidden: false };
}

// A therapist with a limited scope can always see the patients they create.
export async function addPatientToScope(user: UserDocument, patientId: Types.ObjectId) {
  if (user.role !== "therapist" || user.patientScope.all) return;
  user.patientScope.patientIds.push(patientId);
  await user.save();
}
