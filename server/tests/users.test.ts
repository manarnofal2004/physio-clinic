import { describe, expect, it } from "vitest";
import { Patient } from "../src/models/patient.model.js";
import { api, bearer, createTherapistProfile, createUser } from "./helpers.js";

const newTherapistAccount = (therapistId: string) => ({
  role: "therapist",
  therapistId,
  fullName: "Dr. Lina",
  email: "lina@test.com",
  password: "Therapist123",
  privileges: ["patients.view", "reports.view"],
  patientScope: { all: true },
});

describe("users: access", () => {
  it("is admin only", async () => {
    const therapist = await createUser({ role: "therapist", privileges: ["patients.view"] });
    const patient = await createUser({ role: "patient" });

    expect((await api.get("/api/users")).status).toBe(401);
    expect((await api.get("/api/users").set(bearer(therapist.token))).status).toBe(403);
    expect((await api.get("/api/users").set(bearer(patient.token))).status).toBe(403);
  });
});

describe("POST /api/users", () => {
  it("creates a therapist account that can log in", async () => {
    const admin = await createUser();
    const profile = await createTherapistProfile();

    const res = await api
      .post("/api/users")
      .set(bearer(admin.token))
      .send(newTherapistAccount(profile.id as string));

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      role: "therapist",
      therapistId: profile.id,
      privileges: ["patients.view", "reports.view"],
      patientScope: { all: true },
    });

    const login = await api
      .post("/api/auth/login")
      .send({ email: "lina@test.com", password: "Therapist123" });
    expect(login.status).toBe(200);
  });

  it("creates a patient account linked to a patient record", async () => {
    const admin = await createUser();
    const patient = await Patient.create({
      fullName: "Ahmad",
      phone: "0599123456",
      age: 30,
      gender: "male",
      condition: "Back pain",
    });

    const res = await api.post("/api/users").set(bearer(admin.token)).send({
      role: "patient",
      patientId: patient.id,
      fullName: "Ahmad",
      email: "ahmad@test.com",
      password: "Patient123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ role: "patient", patientId: patient.id, privileges: [] });
    expect(res.body.data.patientScope).toBeNull();
  });

  it("rejects a taken email, a second account and an unknown record", async () => {
    const admin = await createUser();
    const profile = await createTherapistProfile();
    const body = newTherapistAccount(profile.id as string);
    await api.post("/api/users").set(bearer(admin.token)).send(body);

    const sameEmail = await api.post("/api/users").set(bearer(admin.token)).send(body);
    const secondAccount = await api
      .post("/api/users")
      .set(bearer(admin.token))
      .send({ ...body, email: "other@test.com" });
    const unknown = await api
      .post("/api/users")
      .set(bearer(admin.token))
      .send({ ...body, email: "x@test.com", therapistId: "6730b1aaaaaaaaaaaaaaaaaa" });

    expect(sameEmail.status).toBe(409);
    expect(secondAccount.status).toBe(409);
    expect(unknown.status).toBe(404);
  });

  it("validates the body", async () => {
    const admin = await createUser();
    const res = await api
      .post("/api/users")
      .set(bearer(admin.token))
      .send({ role: "admin", email: "a@test.com", password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/users/:id/access and PATCH /api/users/:id/status", () => {
  it("changes a therapist's privileges and scope", async () => {
    const admin = await createUser();
    const therapist = await createUser({ role: "therapist" });

    const res = await api
      .put(`/api/users/${therapist.user.id}/access`)
      .set(bearer(admin.token))
      .send({
        privileges: ["reservations.take", "reservations.take"],
        patientScope: { all: false, patientIds: ["6730a1aaaaaaaaaaaaaaaaaa"] },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.privileges).toEqual(["reservations.take"]);
    expect(res.body.data.patientScope).toEqual({
      all: false,
      patientIds: ["6730a1aaaaaaaaaaaaaaaaaa"],
    });
  });

  it("only gives privileges to therapists", async () => {
    const admin = await createUser();
    const patient = await createUser({ role: "patient" });
    const res = await api
      .put(`/api/users/${patient.user.id}/access`)
      .set(bearer(admin.token))
      .send({ privileges: [], patientScope: { all: true } });
    expect(res.status).toBe(400);
  });

  it("turns a therapist off but never an admin", async () => {
    const admin = await createUser();
    const therapist = await createUser({ role: "therapist" });

    const off = await api
      .patch(`/api/users/${therapist.user.id}/status`)
      .set(bearer(admin.token))
      .send({ isActive: false });
    const adminOff = await api
      .patch(`/api/users/${admin.user.id}/status`)
      .set(bearer(admin.token))
      .send({ isActive: false });
    const login = await api
      .post("/api/auth/login")
      .send({ email: therapist.user.email, password: therapist.password });

    expect(off.status).toBe(200);
    expect(off.body.data.isActive).toBe(false);
    expect(adminOff.status).toBe(403);
    expect(login.body.error.code).toBe("ACCOUNT_DISABLED");
  });
});

describe("GET /api/users", () => {
  it("filters by role and pages the results", async () => {
    const admin = await createUser();
    await createUser({ role: "therapist" });
    await createUser({ role: "therapist" });
    await createUser({ role: "patient" });

    const res = await api
      .get("/api/users?role=therapist&limit=1&sort=fullName")
      .set(bearer(admin.token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toEqual({ page: 1, limit: 1, total: 2, totalPages: 2 });
  });
});
