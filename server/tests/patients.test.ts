import { describe, expect, it } from "vitest";
import { Patient, type IPatient } from "../src/models/patient.model.js";
import { User } from "../src/models/user.model.js";
import { api, bearer, createUser } from "./helpers.js";

const ahmad = {
  fullName: "Ahmad Saleh",
  phone: "0599123456",
  age: 34,
  gender: "male" as const,
  address: "Nablus",
  condition: "Lower back pain",
};

function makePatient(overrides: Partial<IPatient> = {}) {
  return Patient.create({ ...ahmad, ...overrides });
}

describe("patients: create, read, update", () => {
  it("creates a patient with defaults and empty optional fields as null", async () => {
    const admin = await createUser();
    const res = await api
      .post("/api/patients")
      .set(bearer(admin.token))
      .send({ ...ahmad, address: "  " });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      fullName: "Ahmad Saleh",
      status: "active",
      isHidden: false,
      address: null,
      notes: null,
      lastVisit: null,
      hasAccount: false,
    });
  });

  it("validates the body with field details", async () => {
    const admin = await createUser();
    const res = await api
      .post("/api/patients")
      .set(bearer(admin.token))
      .send({ ...ahmad, phone: "123", age: 200, gender: "other" });

    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["body.phone", "body.age", "body.gender"]));
  });

  it("updates, changes status, and returns 404 for unknown ids", async () => {
    const admin = await createUser();
    const patient = await makePatient();

    const updated = await api
      .put(`/api/patients/${patient.id}`)
      .set(bearer(admin.token))
      .send({ ...ahmad, age: 35 });
    const status = await api
      .patch(`/api/patients/${patient.id}/status`)
      .set(bearer(admin.token))
      .send({ status: "completed" });
    const unknown = await api
      .get("/api/patients/6730a1aaaaaaaaaaaaaaaaaa")
      .set(bearer(admin.token));

    expect(updated.body.data.age).toBe(35);
    expect(status.body.data.status).toBe("completed");
    expect(unknown.status).toBe(404);
  });

  it("has no delete endpoint", async () => {
    const admin = await createUser();
    const patient = await makePatient();
    const res = await api.delete(`/api/patients/${patient.id}`).set(bearer(admin.token));
    expect(res.status).toBe(404);
    expect(await Patient.exists({ _id: patient._id })).toBeTruthy();
  });

  it("shows whether the patient has a login", async () => {
    const admin = await createUser();
    const patient = await makePatient();
    await createUser({ role: "patient", patientId: patient._id });

    const res = await api.get(`/api/patients/${patient.id}`).set(bearer(admin.token));
    expect(res.body.data.hasAccount).toBe(true);
  });
});

describe("GET /api/patients", () => {
  it("searches, filters, sorts and pages", async () => {
    const admin = await createUser();
    await makePatient({ fullName: "Ahmad Saleh", condition: "Back pain", age: 40 });
    await makePatient({ fullName: "Sara Odeh", condition: "Knee injury", age: 28 });
    await makePatient({
      fullName: "Omar Ahmad",
      condition: "Back pain",
      age: 50,
      status: "completed",
    });

    const search = await api.get("/api/patients?search=ahmad&sort=-age").set(bearer(admin.token));
    const byStatus = await api.get("/api/patients?status=completed").set(bearer(admin.token));
    const paged = await api.get("/api/patients?limit=2&page=2").set(bearer(admin.token));

    expect(search.body.data.map((p: { fullName: string }) => p.fullName)).toEqual([
      "Omar Ahmad",
      "Ahmad Saleh",
    ]);
    expect(byStatus.body.meta.total).toBe(1);
    expect(paged.body.data).toHaveLength(1);
    expect(paged.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });
  });

  it("treats regex characters in the search as plain text", async () => {
    const admin = await createUser();
    await makePatient();
    const res = await api.get("/api/patients?search=.*").set(bearer(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(0);
  });
});

describe("patients: privileges and scope", () => {
  it("needs patients.view to read and patients.edit to write", async () => {
    const viewer = await createUser({
      role: "therapist",
      privileges: ["patients.view"],
      patientScope: { all: true, patientIds: [] },
    });
    const patient = await makePatient();

    const read = await api.get(`/api/patients/${patient.id}`).set(bearer(viewer.token));
    const write = await api
      .put(`/api/patients/${patient.id}`)
      .set(bearer(viewer.token))
      .send(ahmad);
    const patientUser = await createUser({ role: "patient" });
    const asPatient = await api.get("/api/patients").set(bearer(patientUser.token));

    expect(read.status).toBe(200);
    expect(write.status).toBe(403);
    expect(asPatient.status).toBe(403);
  });

  it("limits a therapist to the patients in their scope", async () => {
    const inScope = await makePatient({ fullName: "In Scope" });
    const outOfScope = await makePatient({ fullName: "Out Of Scope" });
    const therapist = await createUser({
      role: "therapist",
      privileges: ["patients.view", "patients.edit"],
      patientScope: { all: false, patientIds: [inScope._id] },
    });

    const list = await api.get("/api/patients").set(bearer(therapist.token));
    const other = await api.get(`/api/patients/${outOfScope.id}`).set(bearer(therapist.token));

    expect(list.body.data.map((p: { fullName: string }) => p.fullName)).toEqual(["In Scope"]);
    expect(other.status).toBe(404);
  });

  it("adds a patient the therapist creates to their scope", async () => {
    const therapist = await createUser({
      role: "therapist",
      privileges: ["patients.view", "patients.edit"],
      patientScope: { all: false, patientIds: [] },
    });

    const created = await api.post("/api/patients").set(bearer(therapist.token)).send(ahmad);
    const fetched = await api
      .get(`/api/patients/${created.body.data.id}`)
      .set(bearer(therapist.token));

    expect(fetched.status).toBe(200);
    const saved = await User.findById(therapist.user.id);
    expect(saved?.patientScope.patientIds.map(String)).toEqual([created.body.data.id]);
  });
});

describe("patients: hiding", () => {
  it("lets only the admin hide, and hides the patient from everyone else", async () => {
    const admin = await createUser();
    const therapist = await createUser({
      role: "therapist",
      privileges: ["patients.view", "patients.edit"],
      patientScope: { all: true, patientIds: [] },
    });
    const patient = await makePatient();

    const byTherapist = await api
      .patch(`/api/patients/${patient.id}/hide`)
      .set(bearer(therapist.token))
      .send({ isHidden: true });
    const byAdmin = await api
      .patch(`/api/patients/${patient.id}/hide`)
      .set(bearer(admin.token))
      .send({ isHidden: true });

    const therapistList = await api.get("/api/patients").set(bearer(therapist.token));
    const therapistGet = await api.get(`/api/patients/${patient.id}`).set(bearer(therapist.token));
    const adminHidden = await api.get("/api/patients?hidden=true").set(bearer(admin.token));
    const therapistFilter = await api.get("/api/patients?hidden=true").set(bearer(therapist.token));

    expect(byTherapist.status).toBe(403);
    expect(byAdmin.body.data.isHidden).toBe(true);
    expect(therapistList.body.meta.total).toBe(0);
    expect(therapistGet.status).toBe(404);
    expect(adminHidden.body.meta.total).toBe(1);
    expect(therapistFilter.status).toBe(403);
  });
});

describe("GET /api/patients/export", () => {
  it("downloads every matching patient as CSV with Arabic support", async () => {
    const admin = await createUser();
    await makePatient({ fullName: "أحمد صالح" });
    await makePatient({ fullName: "Sara, Odeh", status: "completed" });

    const res = await api.get("/api/patients/export?status=active").set(bearer(admin.token));

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toMatch(/attachment; filename="patients-/);
    expect(res.text.charCodeAt(0)).toBe(0xfeff); // BOM so Excel reads Arabic
    const lines = res.text.slice(1).split("\r\n");
    expect(lines[0]).toMatch(/^Full name,Phone,Age/);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("أحمد صالح");
  });
});
