import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { api, bearer, createUser } from "./helpers.js";

const ID = "6730a1aaaaaaaaaaaaaaaaaa";

// Every route that needs a login. A new protected route should be added here.
const PROTECTED: [method: "get" | "post" | "put" | "patch" | "delete", path: string][] = [
  ["get", "/api/auth/me"],
  ["get", "/api/users"],
  ["post", "/api/users"],
  ["get", `/api/users/${ID}`],
  ["put", `/api/users/${ID}/access`],
  ["patch", `/api/users/${ID}/status`],
  ["get", "/api/therapists"],
  ["get", "/api/therapists/free"],
  ["post", "/api/therapists"],
  ["get", `/api/therapists/${ID}`],
  ["put", `/api/therapists/${ID}`],
  ["get", "/api/patients"],
  ["get", "/api/patients/export"],
  ["post", "/api/patients"],
  ["get", `/api/patients/${ID}`],
  ["put", `/api/patients/${ID}`],
  ["patch", `/api/patients/${ID}/status`],
  ["patch", `/api/patients/${ID}/hide`],
  ["get", "/api/reports"],
  ["get", "/api/reports/export"],
  ["post", "/api/reports"],
  ["get", `/api/reports/${ID}`],
  ["put", `/api/reports/${ID}`],
  ["delete", `/api/reports/${ID}`],
  ["post", "/api/uploads"],
  ["get", `/api/uploads/${ID}`],
  ["get", "/api/reservations"],
  ["get", "/api/reservations/reschedules"],
  ["get", `/api/reservations/${ID}`],
  ["post", "/api/reservations"],
  ["post", `/api/reservations/${ID}/take`],
  ["put", `/api/reservations/${ID}`],
  ["get", "/api/banners"],
  ["post", "/api/banners"],
  ["put", `/api/banners/${ID}`],
  ["delete", `/api/banners/${ID}`],
  ["get", "/api/dashboard/stats"],
];

describe("security", () => {
  it("rejects every protected route without a token", async () => {
    for (const [method, path] of PROTECTED) {
      const res = await api[method](path);
      expect(res.status, `${method.toUpperCase()} ${path}`).toBe(401);
    }
  });

  it("rejects a patient on every staff route", async () => {
    const patient = await createUser({ role: "patient" });
    const patientRoutes = new Set(["/api/auth/me", "/api/reservations", `/api/reservations/${ID}`]);

    for (const [method, path] of PROTECTED) {
      if (patientRoutes.has(path)) continue;
      const res = await api[method](path).set(bearer(patient.token));
      expect([400, 403], `${method.toUpperCase()} ${path}`).toContain(res.status);
    }
  });

  it("rejects tokens that are unsigned, signed with another key, or expired", async () => {
    const { user } = await createUser();
    const unsigned = jwt.sign({}, "", { algorithm: "none", subject: user.id as string });
    const otherKey = jwt.sign({}, "some-other-secret-key-123456", { subject: user.id as string });
    const expired = jwt.sign({}, process.env.JWT_SECRET!, {
      subject: user.id as string,
      expiresIn: -10,
    });

    for (const token of [unsigned, otherKey, expired]) {
      const res = await api.get("/api/auth/me").set(bearer(token));
      expect(res.status).toBe(401);
    }
  });

  it("sets security headers and hides the framework", async () => {
    const res = await api.get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("does not leak internal details in 404s and validation errors", async () => {
    const res = await api.post("/api/auth/login").send({ email: "a@test.com", password: 123 });
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/stack|mongo|at \//i);
  });

  it("refuses a very large JSON body", async () => {
    const res = await api
      .post("/api/auth/login")
      .send({ email: "a@test.com", password: "x".repeat(200_000) });
    expect(res.status).toBe(413);
  });
});
