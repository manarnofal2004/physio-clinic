import { describe, expect, it } from "vitest";
import { Patient, type IPatient } from "../src/models/patient.model.js";
import { api, bearer, createTherapistProfile, createUser } from "./helpers.js";

function makePatient(overrides: Partial<IPatient> = {}) {
  return Patient.create({
    fullName: "Ahmad Saleh",
    phone: "0599123456",
    age: 34,
    gender: "male",
    condition: "Lower back pain",
    ...overrides,
  });
}

function reportFor(patientId: string, overrides: Record<string, unknown> = {}) {
  return {
    patientId,
    date: "2026-10-20T09:00:00.000Z",
    diagnosis: "Muscle strain, L4-L5",
    treatmentPlan: "Heat therapy and core exercises",
    progress: "improving",
    ...overrides,
  };
}

describe("reports: create, read, update, delete", () => {
  it("creates a report and returns the patient's name", async () => {
    const admin = await createUser();
    const patient = await makePatient();

    const res = await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send(reportFor(patient.id as string, { sessionNotes: "" }));

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      patient: { id: patient.id, fullName: "Ahmad Saleh" },
      progress: "improving",
      sessionNotes: null,
      therapistId: null,
      attachments: [],
    });
  });

  it("rejects an unknown patient and bad fields", async () => {
    const admin = await createUser();
    const unknown = await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send(reportFor("6730a1aaaaaaaaaaaaaaaaaa"));
    const bad = await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send(reportFor("6730a1aaaaaaaaaaaaaaaaaa", { progress: "great", date: "yesterday" }));

    expect(unknown.status).toBe(404);
    expect(bad.status).toBe(400);
  });

  it("fills in the therapist for a therapist's own report", async () => {
    const profile = await createTherapistProfile();
    const therapist = await createUser({
      role: "therapist",
      therapistId: profile._id,
      privileges: ["reports.edit", "reports.view"],
      patientScope: { all: true, patientIds: [] },
    });
    const patient = await makePatient();

    const res = await api
      .post("/api/reports")
      .set(bearer(therapist.token))
      .send(reportFor(patient.id as string));
    expect(res.body.data.therapistId).toBe(profile.id);
  });

  it("keeps the patient's lastVisit in sync on create, update and delete", async () => {
    const admin = await createUser();
    const patient = await makePatient();
    const lastVisit = async () => (await Patient.findById(patient._id))?.lastVisit?.toISOString();
    const id = patient.id as string;

    const first = await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send(reportFor(id, { date: "2026-10-01T09:00:00.000Z" }));
    const second = await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send(reportFor(id, { date: "2026-10-15T09:00:00.000Z" }));
    expect(await lastVisit()).toBe("2026-10-15T09:00:00.000Z");

    await api
      .put(`/api/reports/${first.body.data.id}`)
      .set(bearer(admin.token))
      .send(reportFor(id, { date: "2026-10-20T09:00:00.000Z" }));
    expect(await lastVisit()).toBe("2026-10-20T09:00:00.000Z");

    await api.delete(`/api/reports/${first.body.data.id}`).set(bearer(admin.token));
    expect(await lastVisit()).toBe("2026-10-15T09:00:00.000Z");

    await api.delete(`/api/reports/${second.body.data.id}`).set(bearer(admin.token));
    expect(await lastVisit()).toBeUndefined();
  });
});

describe("GET /api/reports", () => {
  it("filters by patient, progress and clinic days, and searches the patient's name", async () => {
    const admin = await createUser();
    const ahmad = await makePatient({ fullName: "Ahmad Saleh" });
    const sara = await makePatient({ fullName: "Sara Odeh", phone: "0597001122" });
    const post = (body: object) => api.post("/api/reports").set(bearer(admin.token)).send(body);

    // Oct 31 at 23:30 UTC is already Nov 1 in Hebron (UTC+2 or +3), so it is not in October.
    await post(reportFor(ahmad.id as string, { date: "2026-10-01T09:00:00.000Z" }));
    await post(
      reportFor(ahmad.id as string, { date: "2026-10-31T23:30:00.000Z", progress: "stable" }),
    );
    await post(
      reportFor(sara.id as string, {
        date: "2026-09-30T09:00:00.000Z",
        diagnosis: "Knee sprain",
        progress: "worse",
      }),
    );

    const byPatient = await api.get(`/api/reports?patientId=${ahmad.id}`).set(bearer(admin.token));
    const byProgress = await api.get("/api/reports?progress=worse").set(bearer(admin.token));
    const october = await api
      .get("/api/reports?from=2026-10-01&to=2026-10-31")
      .set(bearer(admin.token));
    const byName = await api.get("/api/reports?search=sara").set(bearer(admin.token));
    const byText = await api.get("/api/reports?search=knee").set(bearer(admin.token));

    expect(byPatient.body.meta.total).toBe(2);
    expect(byProgress.body.meta.total).toBe(1);
    expect(october.body.meta.total).toBe(1);
    expect(byName.body.data[0].patient.fullName).toBe("Sara Odeh");
    expect(byText.body.meta.total).toBe(1);
  });

  it("only shows reports of patients in the user's scope", async () => {
    const admin = await createUser();
    const mine = await makePatient({ fullName: "Mine" });
    const other = await makePatient({ fullName: "Other", phone: "0597001122" });
    const hidden = await makePatient({ fullName: "Hidden", phone: "0597001133" });
    for (const p of [mine, other, hidden]) {
      await api
        .post("/api/reports")
        .set(bearer(admin.token))
        .send(reportFor(p.id as string));
    }
    hidden.isHidden = true;
    await hidden.save();

    const scoped = await createUser({
      role: "therapist",
      privileges: ["reports.view"],
      patientScope: { all: false, patientIds: [mine._id, hidden._id] },
    });
    const all = await createUser({
      role: "therapist",
      privileges: ["reports.view"],
      patientScope: { all: true, patientIds: [] },
    });

    const scopedList = await api.get("/api/reports").set(bearer(scoped.token));
    const allList = await api.get("/api/reports").set(bearer(all.token));
    const adminList = await api.get("/api/reports").set(bearer(admin.token));

    expect(
      scopedList.body.data.map((r: { patient: { fullName: string } }) => r.patient.fullName),
    ).toEqual(["Mine"]);
    expect(allList.body.meta.total).toBe(2);
    expect(adminList.body.meta.total).toBe(3);
  });

  it("needs reports.view to read and reports.edit to write", async () => {
    const reader = await createUser({
      role: "therapist",
      privileges: ["reports.view"],
      patientScope: { all: true, patientIds: [] },
    });
    const patient = await makePatient();

    expect((await api.get("/api/reports").set(bearer(reader.token))).status).toBe(200);
    const write = await api
      .post("/api/reports")
      .set(bearer(reader.token))
      .send(reportFor(patient.id as string));
    expect(write.status).toBe(403);
  });

  it("exports CSV with the patient's name", async () => {
    const admin = await createUser();
    const patient = await makePatient({ fullName: "أحمد صالح" });
    await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send(reportFor(patient.id as string));

    const res = await api.get("/api/reports/export").set(bearer(admin.token));
    const lines = res.text.slice(1).split("\r\n");

    expect(res.headers["content-type"]).toContain("text/csv");
    expect(lines[0]).toBe(
      "Date,Patient,Diagnosis,Treatment plan,Session notes,Progress,Attachments",
    );
    expect(lines[1]).toContain("أحمد صالح");
  });
});
