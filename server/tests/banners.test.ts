import { describe, expect, it } from "vitest";
import { Banner } from "../src/models/banner.model.js";
import { api, bearer, createUser } from "./helpers.js";

const banner = {
  type: "schedule_update" as const,
  messageEn: "The clinic is closed on Sunday.",
  messageAr: "العيادة مغلقة يوم الأحد.",
};

describe("GET /api/public/banners", () => {
  it("returns only active banners, in order", async () => {
    await Banner.create({ ...banner, type: "announcement", messageEn: "Second", order: 2 });
    await Banner.create({ ...banner, messageEn: "First", order: 1 });
    await Banner.create({ ...banner, messageEn: "Hidden", order: 0, isActive: false });

    const res = await api.get("/api/public/banners");

    expect(res.status).toBe(200);
    expect(res.body.data.map((b: { messageEn: string }) => b.messageEn)).toEqual([
      "First",
      "Second",
    ]);
  });
});

describe("banners: management", () => {
  it("creates, updates, deactivates and deletes", async () => {
    const admin = await createUser();

    const created = await api.post("/api/banners").set(bearer(admin.token)).send(banner);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ isActive: true, order: 0 });

    const id = created.body.data.id as string;
    const off = await api
      .put(`/api/banners/${id}`)
      .set(bearer(admin.token))
      .send({ ...banner, isActive: false, order: 3 });
    expect(off.body.data).toMatchObject({ isActive: false, order: 3 });
    expect((await api.get("/api/public/banners")).body.data).toHaveLength(0);

    const list = await api.get("/api/banners?isActive=false").set(bearer(admin.token));
    expect(list.body.meta.total).toBe(1);

    expect((await api.delete(`/api/banners/${id}`).set(bearer(admin.token))).status).toBe(200);
    expect((await api.delete(`/api/banners/${id}`).set(bearer(admin.token))).status).toBe(404);
  });

  it("changes only the fields sent with PATCH", async () => {
    const admin = await createUser();
    const created = await api.post("/api/banners").set(bearer(admin.token)).send(banner);
    const id = created.body.data.id as string;

    const off = await api
      .patch(`/api/banners/${id}`)
      .set(bearer(admin.token))
      .send({ isActive: false });
    const empty = await api.patch(`/api/banners/${id}`).set(bearer(admin.token)).send({});

    expect(off.status).toBe(200);
    expect(off.body.data).toMatchObject({ isActive: false, order: 0, messageAr: banner.messageAr });
    expect(empty.status).toBe(400);
  });

  it("limits messages to 300 characters and checks the type", async () => {
    const admin = await createUser();
    const tooLong = await api
      .post("/api/banners")
      .set(bearer(admin.token))
      .send({ ...banner, messageAr: "ع".repeat(301) });
    const badType = await api
      .post("/api/banners")
      .set(bearer(admin.token))
      .send({ ...banner, type: "sale" });

    expect(tooLong.status).toBe(400);
    expect(badType.status).toBe(400);
  });

  it("needs banners.manage", async () => {
    const therapist = await createUser({ role: "therapist", privileges: ["patients.view"] });
    const manager = await createUser({ role: "therapist", privileges: ["banners.manage"] });

    expect((await api.get("/api/banners")).status).toBe(401);
    expect((await api.get("/api/banners").set(bearer(therapist.token))).status).toBe(403);
    expect((await api.get("/api/banners").set(bearer(manager.token))).status).toBe(200);
  });
});
