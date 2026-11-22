import type { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { Patient, type IPatient } from "../src/models/patient.model.js";
import { Report } from "../src/models/report.model.js";
import { api, bearer, createUser } from "./helpers.js";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

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

function makeReport(patientId: Types.ObjectId, diagnosis: string) {
  return Report.create({
    patientId,
    date: new Date(),
    diagnosis,
    treatmentPlan: "Exercises",
    progress: "improving",
  });
}

async function patientWithLogin(overrides: Partial<IPatient> = {}) {
  const patient = await makePatient(overrides);
  const account = await createUser({ role: "patient", patientId: patient._id });
  return { patient, ...account };
}

describe("/api/me (patient portal)", () => {
  it("returns the patient's own record and reports only", async () => {
    const me = await patientWithLogin({ fullName: "Me" });
    const other = await makePatient({ fullName: "Other", phone: "0597001122" });
    const mine = await makeReport(me.patient._id, "Mine");
    const theirs = await makeReport(other._id, "Theirs");

    const record = await api.get("/api/me/patient").set(bearer(me.token));
    const reports = await api.get("/api/me/reports").set(bearer(me.token));
    const ownReport = await api.get(`/api/me/reports/${mine.id}`).set(bearer(me.token));
    const otherReport = await api.get(`/api/me/reports/${theirs.id}`).set(bearer(me.token));

    expect(record.body.data).toMatchObject({ fullName: "Me", hasAccount: true });
    expect(reports.body.data.map((r: { diagnosis: string }) => r.diagnosis)).toEqual(["Mine"]);
    expect(ownReport.status).toBe(200);
    expect(otherReport.status).toBe(404);
  });

  it("downloads files of the patient's own reports only", async () => {
    const admin = await createUser();
    const me = await patientWithLogin();
    const other = await makePatient({ fullName: "Other", phone: "0597001122" });
    const upload = async (patientId: string) => {
      const files = await api
        .post("/api/uploads")
        .set(bearer(admin.token))
        .attach("files", PNG, { filename: "x-ray.png", contentType: "image/png" });
      const fileId = files.body.data[0].id as string;
      await api
        .post("/api/reports")
        .set(bearer(admin.token))
        .send({
          patientId,
          date: "2026-10-20T09:00:00.000Z",
          diagnosis: "Strain",
          treatmentPlan: "Rest",
          progress: "stable",
          attachmentIds: [fileId],
        });
      return fileId;
    };
    const myFile = await upload(me.patient.id as string);
    const theirFile = await upload(other.id as string);

    const own = await api.get(`/api/me/files/${myFile}`).set(bearer(me.token));
    const theirs = await api.get(`/api/me/files/${theirFile}`).set(bearer(me.token));

    expect(own.status).toBe(200);
    expect(own.headers["content-type"]).toBe("image/png");
    expect(theirs.status).toBe(404);
  });

  it("hides everything once the admin hides the patient", async () => {
    const me = await patientWithLogin({ isHidden: true });
    expect((await api.get("/api/me/patient").set(bearer(me.token))).status).toBe(404);
    expect((await api.get("/api/me/reports").set(bearer(me.token))).body.meta.total).toBe(0);
  });

  it("is for patients only, and patients still cannot use staff routes", async () => {
    const admin = await createUser();
    const me = await patientWithLogin();

    expect((await api.get("/api/me/patient").set(bearer(admin.token))).status).toBe(403);
    expect((await api.get("/api/patients").set(bearer(me.token))).status).toBe(403);
    expect((await api.get("/api/reports").set(bearer(me.token))).status).toBe(403);
  });
});
