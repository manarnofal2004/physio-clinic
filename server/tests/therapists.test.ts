import { describe, expect, it } from "vitest";
import { api, bearer, createTherapistProfile, createUser } from "./helpers.js";

const lina = {
  fullName: "Dr. Lina Khalil",
  phone: "0598765432",
  specialty: "Sports injuries",
  schedule: [
    { day: 0, start: "08:00", end: "12:00" },
    { day: 0, start: "13:00", end: "17:00" },
    { day: 3, start: "12:00", end: "19:00" },
  ],
};

describe("therapists", () => {
  it("lets the admin create, read and update a therapist", async () => {
    const admin = await createUser();

    const created = await api.post("/api/therapists").set(bearer(admin.token)).send(lina);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      fullName: "Dr. Lina Khalil",
      isActive: true,
      hasAccount: false,
    });

    const id = created.body.data.id as string;
    const updated = await api
      .put(`/api/therapists/${id}`)
      .set(bearer(admin.token))
      .send({ ...lina, isActive: false });
    expect(updated.body.data.isActive).toBe(false);

    const fetched = await api.get(`/api/therapists/${id}`).set(bearer(admin.token));
    expect(fetched.body.data.schedule).toHaveLength(3);
  });

  it("rejects bad working hours", async () => {
    const admin = await createUser();
    const bad = [
      [{ day: 0, start: "07:00", end: "10:00" }], // before opening
      [{ day: 0, start: "12:00", end: "10:00" }], // end before start
      [{ day: 5, start: "08:00", end: "10:00" }], // Friday
      [
        { day: 1, start: "08:00", end: "12:00" },
        { day: 1, start: "11:00", end: "14:00" },
      ], // overlap
    ];

    for (const schedule of bad) {
      const res = await api
        .post("/api/therapists")
        .set(bearer(admin.token))
        .send({ ...lina, schedule });
      expect(res.status).toBe(400);
    }
  });

  it("needs reservations.view to read and admin to write", async () => {
    await createTherapistProfile("Dr. A");
    const viewer = await createUser({ role: "therapist", privileges: ["reservations.view"] });
    const noPrivilege = await createUser({ role: "therapist", privileges: ["patients.view"] });

    const allowed = await api.get("/api/therapists").set(bearer(viewer.token));
    const denied = await api.get("/api/therapists").set(bearer(noPrivilege.token));
    const write = await api.post("/api/therapists").set(bearer(viewer.token)).send(lina);

    expect(allowed.status).toBe(200);
    expect(allowed.body.meta.total).toBe(1);
    expect(denied.status).toBe(403);
    expect(write.status).toBe(403);
  });

  it("shows which therapists have an account", async () => {
    const admin = await createUser();
    const withLogin = await createTherapistProfile("Dr. With Login");
    await createTherapistProfile("Dr. Without Login");
    await createUser({ role: "therapist", therapistId: withLogin._id });

    const res = await api.get("/api/therapists?sort=fullName").set(bearer(admin.token));

    expect(res.body.data.map((t: { hasAccount: boolean }) => t.hasAccount)).toEqual([true, false]);
  });

  it("returns 404 for an unknown id and 400 for a malformed one", async () => {
    const admin = await createUser();
    const unknown = await api
      .get("/api/therapists/6730b1aaaaaaaaaaaaaaaaaa")
      .set(bearer(admin.token));
    const malformed = await api.get("/api/therapists/abc").set(bearer(admin.token));
    expect(unknown.status).toBe(404);
    expect(malformed.status).toBe(400);
  });
});
