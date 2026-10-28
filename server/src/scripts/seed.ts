// Creates the first admin plus a sample therapist and patient, each with a login.
// Safe to run again: records that already exist (by email) are left alone.
// Run with: pnpm seed
import { connectDb, disconnectDb } from "../db/connect.js";
import { Patient } from "../models/patient.model.js";
import { Therapist } from "../models/therapist.model.js";
import { User, type IUser } from "../models/user.model.js";
import { hashPassword } from "../services/auth.service.js";

const ADMIN = {
  fullName: "Clinic Admin",
  email: process.env.SEED_ADMIN_EMAIL ?? "admin@clinic.com",
  password: process.env.SEED_ADMIN_PASSWORD ?? "Admin12345",
};
const THERAPIST = { email: "lina@clinic.com", password: "Therapist123" };
const PATIENT = { email: "ahmad@example.com", password: "Patient123" };

async function ensureUser(data: Partial<IUser> & { email: string; password: string }) {
  if (await User.exists({ email: data.email })) {
    console.info(`exists   ${data.email}`);
    return;
  }
  await User.create({ ...data, password: await hashPassword(data.password) });
  console.info(`created  ${data.email} / ${data.password}`);
}

async function seed() {
  await connectDb();

  await ensureUser({ ...ADMIN, role: "admin" });

  const therapist =
    (await Therapist.findOne({ fullName: "Dr. Lina Khalil" })) ??
    (await Therapist.create({
      fullName: "Dr. Lina Khalil",
      phone: "0598765432",
      specialty: "Sports injuries",
      schedule: [
        { day: 0, start: "08:00", end: "14:00" },
        { day: 1, start: "08:00", end: "14:00" },
        { day: 2, start: "12:00", end: "19:00" },
        { day: 3, start: "12:00", end: "19:00" },
      ],
    }));
  await ensureUser({
    ...THERAPIST,
    fullName: therapist.fullName,
    role: "therapist",
    therapistId: therapist._id,
    privileges: [
      "patients.view",
      "patients.edit",
      "reports.view",
      "reports.edit",
      "reservations.view",
      "reservations.take",
      "dashboard.view",
    ],
    patientScope: { all: true, patientIds: [] },
  });

  const patient =
    (await Patient.findOne({ phone: "0599123456" })) ??
    (await Patient.create({
      fullName: "Ahmad Saleh",
      phone: "0599123456",
      age: 34,
      gender: "male",
      address: "Nablus",
      condition: "Lower back pain",
    }));
  await ensureUser({
    ...PATIENT,
    fullName: patient.fullName,
    role: "patient",
    patientId: patient._id,
  });

  await disconnectDb();
}

seed().catch(async (err: unknown) => {
  console.error("Seed failed:", err);
  await disconnectDb();
  process.exit(1);
});
