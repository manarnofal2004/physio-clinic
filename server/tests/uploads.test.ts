import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { Patient } from "../src/models/patient.model.js";
import { deleteOrphanUploads, safeFilename } from "../src/services/uploads.service.js";
import { api, bearer, createUser } from "./helpers.js";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
const PDF = Buffer.from("%PDF-1.7\n% test file\n");

function upload(token: string) {
  return api.post("/api/uploads").set(bearer(token));
}

function makePatient() {
  return Patient.create({
    fullName: "Ahmad Saleh",
    phone: "0599123456",
    age: 34,
    gender: "male",
    condition: "Lower back pain",
  });
}

function storedFileCount() {
  return mongoose.connection.db!.collection("uploads.files").countDocuments();
}

describe("POST /api/uploads", () => {
  it("stores images and PDFs and returns their details", async () => {
    const admin = await createUser();

    const res = await upload(admin.token)
      .attach("files", PNG, { filename: "x-ray.png", contentType: "image/png" })
      .attach("files", PDF, { filename: "../../report.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toMatchObject({
      filename: "x-ray.png",
      mimeType: "image/png",
      size: PNG.length,
    });
    expect(res.body.data[1].filename).toBe("report.pdf");
  });

  it("rejects wrong types, fake content, big files, too many files and no files", async () => {
    const admin = await createUser();

    const wrongType = await upload(admin.token).attach("files", Buffer.from("hi"), {
      filename: "notes.txt",
      contentType: "text/plain",
    });
    const fakePng = await upload(admin.token).attach("files", Buffer.from("not really a png"), {
      filename: "fake.png",
      contentType: "image/png",
    });
    const big = await upload(admin.token).attach(
      "files",
      Buffer.concat([PDF, Buffer.alloc(5 * 1024 * 1024)]),
      { filename: "big.pdf", contentType: "application/pdf" },
    );
    let six = upload(admin.token);
    for (let i = 0; i < 6; i++)
      six = six.attach("files", PNG, { filename: `${i}.png`, contentType: "image/png" });
    const tooMany = await six;
    const none = await upload(admin.token);

    expect(wrongType.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
    expect(fakePng.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
    expect(big.body.error.code).toBe("FILE_TOO_LARGE");
    expect(tooMany.body.error.code).toBe("TOO_MANY_FILES");
    expect(none.status).toBe(400);
    expect(await storedFileCount()).toBe(0);
  });

  it("needs reports.edit", async () => {
    const reader = await createUser({ role: "therapist", privileges: ["reports.view"] });
    const res = await upload(reader.token).attach("files", PNG, {
      filename: "a.png",
      contentType: "image/png",
    });
    expect(res.status).toBe(403);
  });
});

describe("attachments on reports", () => {
  it("attaches uploads to a report, serves them, and deletes removed ones", async () => {
    const admin = await createUser();
    const patient = await makePatient();
    const files = await upload(admin.token)
      .attach("files", PNG, { filename: "a.png", contentType: "image/png" })
      .attach("files", PDF, { filename: "b.pdf", contentType: "application/pdf" });
    const [png, pdf] = files.body.data as { id: string }[];

    const created = await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send({
        patientId: patient.id,
        date: "2026-10-20T09:00:00.000Z",
        diagnosis: "Strain",
        treatmentPlan: "Rest",
        progress: "stable",
        attachmentIds: [png?.id, pdf?.id],
      });
    expect(created.body.data.attachments).toHaveLength(2);

    const download = await api.get(`/api/uploads/${png?.id}`).set(bearer(admin.token));
    expect(download.status).toBe(200);
    expect(download.headers["content-type"]).toBe("image/png");
    expect(Buffer.compare(download.body as Buffer, PNG)).toBe(0);

    const updated = await api
      .put(`/api/reports/${created.body.data.id}`)
      .set(bearer(admin.token))
      .send({
        patientId: patient.id,
        date: "2026-10-20T09:00:00.000Z",
        diagnosis: "Strain",
        treatmentPlan: "Rest",
        progress: "stable",
        attachmentIds: [pdf?.id],
      });
    expect(updated.body.data.attachments).toHaveLength(1);
    expect(await storedFileCount()).toBe(1);

    await api.delete(`/api/reports/${created.body.data.id}`).set(bearer(admin.token));
    expect(await storedFileCount()).toBe(0);
  });

  it("does not let a file be used twice or by someone else", async () => {
    const admin = await createUser();
    const other = await createUser({
      role: "therapist",
      privileges: ["reports.edit", "reports.view"],
      patientScope: { all: true, patientIds: [] },
    });
    const patient = await makePatient();
    const files = await upload(admin.token).attach("files", PNG, {
      filename: "a.png",
      contentType: "image/png",
    });
    const fileId = files.body.data[0].id as string;
    const body = {
      patientId: patient.id,
      date: "2026-10-20T09:00:00.000Z",
      diagnosis: "Strain",
      treatmentPlan: "Rest",
      progress: "stable",
      attachmentIds: [fileId],
    };

    const byOther = await api.post("/api/reports").set(bearer(other.token)).send(body);
    const first = await api.post("/api/reports").set(bearer(admin.token)).send(body);
    const second = await api.post("/api/reports").set(bearer(admin.token)).send(body);

    expect(byOther.status).toBe(400);
    expect(first.status).toBe(201);
    expect(second.status).toBe(400);
  });

  it("hides files of patients outside the user's scope", async () => {
    const admin = await createUser();
    const patient = await makePatient();
    const files = await upload(admin.token).attach("files", PNG, {
      filename: "a.png",
      contentType: "image/png",
    });
    const fileId = files.body.data[0].id as string;
    await api
      .post("/api/reports")
      .set(bearer(admin.token))
      .send({
        patientId: patient.id,
        date: "2026-10-20T09:00:00.000Z",
        diagnosis: "Strain",
        treatmentPlan: "Rest",
        progress: "stable",
        attachmentIds: [fileId],
      });
    const outsider = await createUser({
      role: "therapist",
      privileges: ["reports.view"],
      patientScope: { all: false, patientIds: [] },
    });

    const res = await api.get(`/api/uploads/${fileId}`).set(bearer(outsider.token));
    expect(res.status).toBe(404);
  });
});

describe("upload helpers", () => {
  it("deletes uploads that were never attached after 24 hours", async () => {
    const admin = await createUser();
    await upload(admin.token).attach("files", PNG, { filename: "a.png", contentType: "image/png" });

    expect(await deleteOrphanUploads(new Date())).toBe(0);
    const tomorrow = new Date(Date.now() + 25 * 60 * 60 * 1000);
    expect(await deleteOrphanUploads(tomorrow)).toBe(1);
    expect(await storedFileCount()).toBe(0);
  });

  it("cleans file names", () => {
    expect(safeFilename("../../etc/passwd")).toBe("passwd");
    expect(safeFilename("C:\\Users\\me\\صورة أشعة.png")).toBe("صورة أشعة.png");
    expect(safeFilename('bad"name<>.pdf')).toBe("bad_name__.pdf");
    expect(safeFilename("...")).toBe("file");
  });
});
