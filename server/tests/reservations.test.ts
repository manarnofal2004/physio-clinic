import type { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { WORK_DAYS, type Privilege } from "../src/constants.js";
import { Reservation, type IReservation } from "../src/models/reservation.model.js";
import { Therapist, type WorkingHours } from "../src/models/therapist.model.js";
import { clinicToday } from "../src/services/schedule.service.js";
import { addDays, weekdayOf, zonedTime } from "../src/utils/time.js";
import { api, bearer, createUser } from "./helpers.js";

const TZ = "Asia/Hebron";
const everyDay = (start: string, end: string): WorkingHours[] =>
  WORK_DAYS.map((day) => ({ day, start, end }));
const ALL_WEEK = everyDay("08:00", "19:00");

// A Sunday-to-Thursday clinic day at least two days ahead, so "now" never interferes.
function futureWorkday(minDaysAhead = 2): string {
  let day = addDays(clinicToday(new Date()), minDaysAhead);
  while (weekdayOf(day) > 4) day = addDays(day, 1);
  return day;
}

function futureFriday(): string {
  let day = addDays(clinicToday(new Date()), 2);
  while (weekdayOf(day) !== 5) day = addDays(day, 1);
  return day;
}

const at = (day: string, time: string) => zonedTime(day, time, TZ);

function therapist(name: string, schedule = ALL_WEEK) {
  return Therapist.create({ fullName: name, schedule });
}

function accepted(
  therapistId: Types.ObjectId,
  scheduledAt: Date,
  extra: Partial<IReservation> = {},
) {
  return Reservation.create({
    fullName: "Booked Person",
    phone: "0590000000",
    age: 30,
    scheduledAt,
    status: "accepted",
    therapistId,
    ...extra,
  });
}

function booking(scheduledAt: Date, phone = "0597001122") {
  return { fullName: "Sara Odeh", phone, age: 28, scheduledAt: scheduledAt.toISOString() };
}

describe("GET /api/public/reservations/date-options", () => {
  it("lists Sunday to Thursday days within 30 days on which a therapist works", async () => {
    await therapist("Dr. Sunday", [{ day: 0, start: "08:00", end: "12:00" }]);

    const res = await api.get("/api/public/reservations/date-options");

    expect(res.status).toBe(200);
    const days = res.body.data as string[];
    expect(days.length).toBeGreaterThanOrEqual(4);
    expect(days.every((d) => weekdayOf(d) === 0)).toBe(true);
    expect(days.at(-1)! <= addDays(clinicToday(new Date()), 30)).toBe(true);
  });
});

describe("GET /api/public/reservations/availability", () => {
  it("offers every 15 minutes from 08:00, with the last session ending by 19:00", async () => {
    await therapist("Dr. A");
    const day = futureWorkday();

    const res = await api.get(`/api/public/reservations/availability?date=${day}`);

    expect(res.body.data.slots[0]).toBe("08:00");
    expect(res.body.data.slots.at(-1)).toBe("18:15");
    expect(res.body.data.slots).toHaveLength(42);
  });

  it("hides times within 45 minutes of an accepted session, when no other therapist is free", async () => {
    const lina = await therapist("Dr. Lina");
    const day = futureWorkday();
    await accepted(lina._id, at(day, "10:00"));
    await Reservation.create({ ...booking(at(day, "14:00")), status: "pending" });

    const res = await api.get(`/api/public/reservations/availability?date=${day}`);
    const slots = res.body.data.slots as string[];

    expect(slots).toContain("09:15");
    expect(slots).not.toContain("09:30");
    expect(slots).not.toContain("10:00");
    expect(slots).not.toContain("10:30");
    expect(slots).toContain("10:45");
    expect(slots).toContain("14:00"); // pending blocks nothing
  });

  it("keeps a time open while another therapist is free", async () => {
    const lina = await therapist("Dr. Lina");
    await therapist("Dr. Omar");
    const day = futureWorkday();
    await accepted(lina._id, at(day, "10:00"));

    const res = await api.get(`/api/public/reservations/availability?date=${day}`);
    expect(res.body.data.slots).toContain("10:00");
  });

  it("follows each therapist's working hours and returns nothing on Friday", async () => {
    await therapist("Dr. Morning", everyDay("08:00", "12:00"));
    const day = futureWorkday();

    const workday = await api.get(`/api/public/reservations/availability?date=${day}`);
    const friday = await api.get(`/api/public/reservations/availability?date=${futureFriday()}`);

    expect(workday.body.data.slots.at(-1)).toBe("11:15");
    expect(friday.body.data.slots).toEqual([]);
  });
});

describe("GET /api/public/reservations/today", () => {
  it("shows sessions running now without personal data", async () => {
    const lina = await therapist("Dr. Lina");
    await accepted(lina._id, new Date(Date.now() - 10 * 60_000), { fullName: "Secret Name" });

    const res = await api.get("/api/public/reservations/today");

    expect(res.status).toBe(200);
    expect(res.body.data.date).toBe(clinicToday(new Date()));
    expect(res.text).not.toContain("Secret Name");
    expect(res.text).not.toContain("0590000000");
    // The session started 10 minutes ago, so it is running (unless it started yesterday).
    const startedToday = clinicToday(new Date(Date.now() - 10 * 60_000)) === res.body.data.date;
    if (startedToday) {
      expect(res.body.data.runningNow).toBe(1);
      expect(res.body.data.sessions[0].state).toBe("running");
    }
  });
});

describe("POST /api/public/reservations", () => {
  it("creates a pending request for a guest", async () => {
    await therapist("Dr. A");
    const res = await api
      .post("/api/public/reservations")
      .send({ ...booking(at(futureWorkday(), "09:00")), phone: "0597 001-122" });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: "pending", userId: null, phone: "0597001122" });
  });

  it("links the request to a logged-in patient", async () => {
    await therapist("Dr. A");
    const patient = await createUser({ role: "patient" });
    const res = await api
      .post("/api/public/reservations")
      .set(bearer(patient.token))
      .send(booking(at(futureWorkday(), "09:00")));
    expect(res.body.data.userId).toBe(patient.user.id);
  });

  it("refuses times that are taken, off the 15-minute grid, past or on Friday", async () => {
    const lina = await therapist("Dr. Lina");
    const day = futureWorkday();
    await accepted(lina._id, at(day, "10:00"));
    const post = (when: Date) => api.post("/api/public/reservations").send(booking(when));

    for (const when of [
      at(day, "10:15"),
      at(day, "09:10"),
      new Date(Date.now() - 60 * 60_000),
      at(futureFriday(), "09:00"),
      at(day, "18:30"),
    ]) {
      const res = await post(when);
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("SLOT_UNAVAILABLE");
    }
  });

  it("allows at most 2 pending requests per phone number", async () => {
    await therapist("Dr. A");
    const day = futureWorkday();
    const post = (time: string, phone: string) =>
      api.post("/api/public/reservations").send(booking(at(day, time), phone));

    expect((await post("09:00", "0597001122")).status).toBe(201);
    expect((await post("10:00", "0597 001 122")).status).toBe(201);
    const third = await post("11:00", "0597-001-122");

    expect(third.status).toBe(409);
    expect(third.body.error.code).toBe("PENDING_LIMIT_REACHED");
  });
});

describe("logged-in reservations", () => {
  it("shows patients only their own, without therapist or staff notes", async () => {
    const lina = await therapist("Dr. Lina");
    const me = await createUser({ role: "patient" });
    const other = await createUser({ role: "patient" });
    const mine = await accepted(lina._id, at(futureWorkday(), "09:00"), {
      userId: me.user._id,
      adminNotes: "internal",
    });
    const theirs = await accepted(lina._id, at(futureWorkday(), "11:00"), {
      userId: other.user._id,
    });

    const list = await api.get("/api/reservations").set(bearer(me.token));
    const own = await api.get(`/api/reservations/${mine.id}`).set(bearer(me.token));
    const notMine = await api.get(`/api/reservations/${theirs.id}`).set(bearer(me.token));

    expect(list.body.meta.total).toBe(1);
    expect(own.body.data).toMatchObject({ therapistId: null, adminNotes: null });
    expect(notMine.status).toBe(403);
  });

  it("lets a logged-in patient book, and only patients", async () => {
    await therapist("Dr. A");
    const patient = await createUser({ role: "patient" });
    const admin = await createUser();
    const body = booking(at(futureWorkday(), "09:00"));

    const asPatient = await api.post("/api/reservations").set(bearer(patient.token)).send(body);
    const asAdmin = await api.post("/api/reservations").set(bearer(admin.token)).send(body);

    expect(asPatient.status).toBe(201);
    expect(asPatient.body.data.userId).toBe(patient.user.id);
    expect(asAdmin.status).toBe(403);
  });
});

describe("taking and assigning", () => {
  async function therapistUser(name: string, privileges: Privilege[]) {
    const profile = await therapist(name);
    const account = await createUser({
      role: "therapist",
      therapistId: profile._id,
      privileges,
    });
    return { profile, ...account };
  }

  it("lets a therapist take a pending request once, if they are free", async () => {
    const lina = await therapistUser("Dr. Lina", ["reservations.take"]);
    const omar = await therapistUser("Dr. Omar", ["reservations.take"]);
    const day = futureWorkday();
    const request = await Reservation.create(booking(at(day, "10:00")));

    const taken = await api
      .post(`/api/reservations/${request.id}/take`)
      .set(bearer(lina.token))
      .send({});
    const again = await api
      .post(`/api/reservations/${request.id}/take`)
      .set(bearer(omar.token))
      .send({});

    expect(taken.status).toBe(200);
    expect(taken.body.data).toMatchObject({ status: "accepted", therapistId: lina.profile.id });
    expect(taken.body.data.reviewedAt).not.toBeNull();
    expect(again.body.error.code).toBe("CONFLICT");

    const clash = await Reservation.create(booking(at(day, "10:30"), "0591111111"));
    const busy = await api
      .post(`/api/reservations/${clash.id}/take`)
      .set(bearer(lina.token))
      .send({});
    expect(busy.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("shows a take-only therapist pending requests and their own sessions", async () => {
    const lina = await therapistUser("Dr. Lina", ["reservations.take"]);
    const omar = await therapistUser("Dr. Omar", ["reservations.take"]);
    const day = futureWorkday();
    await Reservation.create(booking(at(day, "09:00")));
    await accepted(lina.profile._id, at(day, "10:00"));
    await accepted(omar.profile._id, at(day, "11:00"));

    const res = await api.get("/api/reservations").set(bearer(lina.token));
    expect(res.body.meta.total).toBe(2);
  });

  it("lets the admin accept with a free therapist, and reschedule", async () => {
    const admin = await createUser();
    const lina = await therapist("Dr. Lina");
    const day = futureWorkday();
    const request = await Reservation.create(booking(at(day, "09:00")));

    const noTherapist = await api
      .put(`/api/reservations/${request.id}`)
      .set(bearer(admin.token))
      .send({ status: "accepted" });
    const ok = await api
      .put(`/api/reservations/${request.id}`)
      .set(bearer(admin.token))
      .send({ status: "accepted", therapistId: lina.id, adminNotes: "First visit" });
    const moved = await api
      .put(`/api/reservations/${request.id}`)
      .set(bearer(admin.token))
      .send({ scheduledAt: at(day, "13:00").toISOString() });

    expect(noTherapist.status).toBe(400);
    expect(ok.body.data).toMatchObject({
      status: "accepted",
      therapistId: lina.id,
      adminNotes: "First visit",
    });
    expect(moved.body.data.previousScheduledAt).toBe(at(day, "09:00").toISOString());
    expect(moved.body.data.rescheduledAt).not.toBeNull();

    const news = await api
      .get(`/api/reservations/reschedules?date=${clinicToday(new Date())}`)
      .set(bearer(admin.token));
    expect(news.body.data).toHaveLength(1);
    expect(news.body.data[0].reservationId).toBe(request.id);
  });

  it("refuses to accept with a therapist who is busy", async () => {
    const admin = await createUser();
    const lina = await therapist("Dr. Lina");
    const day = futureWorkday();
    await accepted(lina._id, at(day, "09:00"));
    const request = await Reservation.create(booking(at(day, "09:15")));

    const res = await api
      .put(`/api/reservations/${request.id}`)
      .set(bearer(admin.token))
      .send({ status: "accepted", therapistId: lina.id });
    expect(res.body.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("lists free therapists for a time", async () => {
    const admin = await createUser();
    const lina = await therapist("Dr. Lina");
    await therapist("Dr. Omar");
    const day = futureWorkday();
    const session = await accepted(lina._id, at(day, "09:00"));
    const when = at(day, "09:00").toISOString();

    const free = await api.get(`/api/therapists/free?scheduledAt=${when}`).set(bearer(admin.token));
    const excluding = await api
      .get(`/api/therapists/free?scheduledAt=${when}&excludeReservationId=${session.id}`)
      .set(bearer(admin.token));

    expect(free.body.data.map((t: { fullName: string }) => t.fullName)).toEqual(["Dr. Omar"]);
    expect(excluding.body.data).toHaveLength(2);
  });
});
