import { describe, expect, it } from "vitest";
import { api, bearer, createUser } from "./helpers.js";

describe("POST /api/auth/login", () => {
  it("returns a token and the user without the password", async () => {
    const { user, password } = await createUser();

    const res = await api.post("/api/auth/login").send({ email: user.email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ email: user.email, role: "admin" });
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("accepts the email in any letter case", async () => {
    const { user, password } = await createUser();
    const res = await api
      .post("/api/auth/login")
      .send({ email: user.email.toUpperCase(), password });
    expect(res.status).toBe(200);
  });

  it("gives the same error for a wrong password and an unknown email", async () => {
    const { user } = await createUser();

    const wrongPassword = await api
      .post("/api/auth/login")
      .send({ email: user.email, password: "nope-nope" });
    const unknownEmail = await api
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "nope-nope" });

    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("refuses a turned-off account", async () => {
    const { user, password } = await createUser({ role: "therapist", isActive: false });
    const res = await api.post("/api/auth/login").send({ email: user.email, password });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_DISABLED");
  });

  it("validates the body", async () => {
    const res = await api.post("/api/auth/login").send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/auth/me", () => {
  it("returns the logged-in user", async () => {
    const { user, token } = await createUser();
    const res = await api.get("/api/auth/me").set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(user.id);
    expect(res.body.data.patientScope).toEqual({ all: true });
  });

  it("returns 401 without a token, with a bad token, or for a turned-off account", async () => {
    const disabled = await createUser({ role: "therapist" });
    disabled.user.isActive = false;
    await disabled.user.save();

    const noToken = await api.get("/api/auth/me");
    const badToken = await api.get("/api/auth/me").set(bearer("not.a.token"));
    const offAccount = await api.get("/api/auth/me").set(bearer(disabled.token));

    for (const res of [noToken, badToken, offAccount]) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    }
  });
});
