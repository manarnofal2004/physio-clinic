import { beforeEach, describe, expect, it, vi } from "vitest";

// Google is not called in tests: its token check is replaced, and the server is given a
// client ID before the app (and its env) loads.
const { verifyIdToken } = vi.hoisted(() => {
  process.env.GOOGLE_CLIENT_ID = "test-client-id";
  return { verifyIdToken: vi.fn() };
});
vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

const { api, createUser } = await import("./helpers.js");

// What Google would say about the person behind the token.
const googleSays = (email: string, verified = true) =>
  verifyIdToken.mockResolvedValue({ getPayload: () => ({ email, email_verified: verified }) });

describe("POST /api/auth/google", () => {
  beforeEach(() => verifyIdToken.mockReset());

  it("logs in the account with the Google email", async () => {
    const { user } = await createUser({ role: "therapist" });
    googleSays(user.email.toUpperCase());

    const res = await api.post("/api/auth/google").send({ credential: "google-token" });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ email: user.email, role: "therapist" });
    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: "google-token",
      audience: "test-client-id",
    });
  });

  it("never creates an account for an unknown email", async () => {
    googleSays("stranger@gmail.com");
    const res = await api.post("/api/auth/google").send({ credential: "google-token" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("NO_ACCOUNT");
  });

  it("refuses a token Google rejects or an email it has not verified", async () => {
    const { user } = await createUser();

    verifyIdToken.mockRejectedValue(new Error("Wrong recipient"));
    const rejected = await api.post("/api/auth/google").send({ credential: "forged" });

    googleSays(user.email, false);
    const unverified = await api.post("/api/auth/google").send({ credential: "google-token" });

    for (const res of [rejected, unverified]) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("refuses a turned-off account", async () => {
    const { user } = await createUser({ isActive: false });
    googleSays(user.email);
    const res = await api.post("/api/auth/google").send({ credential: "google-token" });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("ACCOUNT_DISABLED");
  });

  it("needs a credential", async () => {
    const res = await api.post("/api/auth/google").send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
