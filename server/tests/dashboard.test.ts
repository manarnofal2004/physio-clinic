import type { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import type { ReportProgress } from "../src/constants.js";
import { Patient, type IPatient } from "../src/models/patient.model.js";
import { Report } from "../src/models/report.model.js";
import { Reservation } from "../src/models/reservation.model.js";
import { api, bearer, createUser } from "./helpers.js";

function makePatient(overrides: Partial<IPatient> = {}) {
  return Patient.create({
    fullName: "Patient",
    phone: "0599123456",
    age: 30,
    gender: "female",
    condition: "Knee injury",
    ...overrides,
  });
}

function makeReport(patientId: Types.ObjectId, date: Date, progress: ReportProgress = "improving") {
  return Report.create({
    patientId,
    date,
    diagnosis: "Strain",
    treatmentPlan: "Exercises",
    progress,
  });
}

describe("GET /api/dashboard/stats", () => {
  it("returns zeros and 12 empty months for an empty database", async () => {
    const admin = await createUser();
    const res = await api.get("/api/dashboard/stats").set(bearer(admin.token));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      totalPatients: 0,
      activePatients: 0,
      totalReports: 0,
      pendingReservations: 0,
      recentPatients: [],
      progressCounts: { improving: 0, stable: 0, worse: 0 },
      conditionCounts: [],
    });
    const months = res.body.data.reportsOverTime as { month: string; count: number }[];
    expect(months).toHaveLength(12);
    expect(months.every((m) => m.count === 0)).toBe(true);
  });

  it("counts patients, reports, progress, conditions and pending requests", async () => {
    const admin = await createUser();
    const a = await makePatient({ fullName: "A", condition: "Knee injury" });
    const b = await makePatient({ fullName: "B", condition: "Knee injury", status: "completed" });
    await makePatient({ fullName: "C", condition: "Back pain" });
    const now = new Date();
    await makeReport(a._id, now, "improving");
    await makeReport(a._id, now, "stable");
    await makeReport(b._id, new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000), "worse"); // over a year ago
    await Reservation.create({
      fullName: "Guest",
      phone: "0597001122",
      age: 20,
      scheduledAt: new Date(now.getTime() + 86_400_000),
    });

    const { body } = await api.get("/api/dashboard/stats").set(bearer(admin.token));
    const data = body.data;

    expect(data).toMatchObject({
      totalPatients: 3,
      activePatients: 2,
      totalReports: 3,
      pendingReservations: 1,
      progressCounts: { improving: 1, stable: 1, worse: 1 },
    });
    expect(data.recentPatients[0].fullName).toBe("C");
    expect(data.conditionCounts[0]).toEqual({ condition: "Knee injury", count: 2 });
    expect(data.reportsOverTime.at(-1).count).toBe(2); // this month; the old one is outside 12 months
  });

  it("counts only the patients in a therapist's scope", async () => {
    const mine = await makePatient({ fullName: "Mine" });
    const other = await makePatient({ fullName: "Other" });
    await makeReport(mine._id, new Date());
    await makeReport(other._id, new Date());
    const therapist = await createUser({
      role: "therapist",
      privileges: ["dashboard.view"],
      patientScope: { all: false, patientIds: [mine._id] },
    });

    const { body } = await api.get("/api/dashboard/stats").set(bearer(therapist.token));
    expect(body.data.totalPatients).toBe(1);
    expect(body.data.totalReports).toBe(1);
  });

  it("needs dashboard.view", async () => {
    const therapist = await createUser({ role: "therapist", privileges: ["patients.view"] });
    expect((await api.get("/api/dashboard/stats").set(bearer(therapist.token))).status).toBe(403);
  });
});
