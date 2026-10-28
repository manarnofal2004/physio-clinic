// Creates the first admin plus a sample therapist and patient, each with a login.
// Safe to run again: records that already exist (by email) are left alone.
// Run with: pnpm seed
import type { Types } from "mongoose";
import { env } from "../config/env.js";
import type { WorkDay } from "../constants.js";
import { connectDb, disconnectDb } from "../db/connect.js";
import { Patient, type IPatient } from "../models/patient.model.js";
import { Reservation } from "../models/reservation.model.js";
import { Therapist } from "../models/therapist.model.js";
import { User, type IUser } from "../models/user.model.js";
import { hashPassword } from "../services/auth.service.js";
import { dateOptions } from "../services/schedule.service.js";
import { zonedTime } from "../utils/time.js";

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

  // A second therapist (no login) so two sessions can run at the same time.
  const omar =
    (await Therapist.findOne({ fullName: "Dr. Omar Nasser" })) ??
    (await Therapist.create({
      fullName: "Dr. Omar Nasser",
      phone: "0598123987",
      specialty: "Back and neck",
      schedule: [0, 1, 2, 3, 4].map((day) => ({
        day: day as WorkDay,
        start: "10:00",
        end: "18:00",
      })),
    }));

  let created = 0;
  for (const data of SAMPLE_PATIENTS) {
    if (await Patient.exists({ phone: data.phone })) continue;
    await Patient.create(data);
    created += 1;
  }
  console.info(`patients ${created} created, ${SAMPLE_PATIENTS.length - created} already there`);

  const ahmad = await Patient.findOne({ phone: "0599123456" });
  if (ahmad) {
    await ensureUser({
      ...PATIENT,
      fullName: ahmad.fullName,
      role: "patient",
      patientId: ahmad._id,
    });
  }

  await seedReservations(therapist._id, omar._id);

  await disconnectDb();
}

// A few requests on the next working days: some pending, some accepted. Only when there are none.
async function seedReservations(linaId: Types.ObjectId, omarId: Types.ObjectId) {
  if (await Reservation.exists({})) {
    console.info("reservations already there");
    return;
  }
  const patientUser = await User.findOne({ email: PATIENT.email });
  const tz = env.CLINIC_TIMEZONE;
  const days = (await dateOptions(new Date())).slice(1, 4);

  const samples = days.flatMap((day, i) =>
    [
      { fullName: "Sara Odeh", phone: `059700112${i}`, age: 28, time: "09:00", status: "pending" },
      {
        fullName: "Omar Barghouti",
        phone: `059955667${i}`,
        age: 37,
        time: "10:00",
        status: "accepted",
        therapistId: omarId,
      },
      {
        fullName: "Ahmad Saleh",
        phone: "0599123456",
        age: 34,
        time: "12:30",
        status: "accepted",
        therapistId: linaId,
        userId: patientUser?._id ?? null,
      },
    ].map(({ time, ...rest }) => ({ ...rest, scheduledAt: zonedTime(day, time, tz) })),
  );

  await Reservation.insertMany(samples);
  console.info(`reservations ${samples.length} created`);
}

// The first one gets the sample patient login. Phone numbers are unique per sample.
const SAMPLE_PATIENTS: Partial<IPatient>[] = [
  {
    fullName: "Ahmad Saleh",
    phone: "0599123456",
    age: 34,
    gender: "male",
    address: "Nablus",
    condition: "Lower back pain",
  },
  {
    fullName: "Sara Odeh",
    phone: "0597001122",
    age: 28,
    gender: "female",
    address: "Ramallah",
    condition: "Knee injury",
  },
  {
    fullName: "Mohammad Khalil",
    phone: "0598112233",
    age: 52,
    gender: "male",
    address: "Hebron",
    condition: "Shoulder pain",
  },
  {
    fullName: "Lina Haddad",
    phone: "0599223344",
    age: 41,
    gender: "female",
    address: "Bethlehem",
    condition: "Neck pain",
  },
  {
    fullName: "Yousef Nasser",
    phone: "0597334455",
    age: 19,
    gender: "male",
    address: "Jenin",
    condition: "Ankle sprain",
    status: "completed",
  },
  {
    fullName: "Rania Saeed",
    phone: "0598445566",
    age: 63,
    gender: "female",
    address: "Nablus",
    condition: "Knee osteoarthritis",
  },
  {
    fullName: "Omar Barghouti",
    phone: "0599556677",
    age: 37,
    gender: "male",
    address: "Ramallah",
    condition: "Lower back pain",
  },
  {
    fullName: "Hala Masri",
    phone: "0597667788",
    age: 25,
    gender: "female",
    address: "Tulkarm",
    condition: "Post-surgery rehab",
    notes: "ACL reconstruction, week 6",
  },
  {
    fullName: "Khaled Amro",
    phone: "0598778899",
    age: 47,
    gender: "male",
    address: "Hebron",
    condition: "Shoulder pain",
    status: "completed",
  },
  {
    fullName: "Noor Jaber",
    phone: "0599889900",
    age: 31,
    gender: "female",
    address: "Qalqilya",
    condition: "Neck pain",
  },
  {
    fullName: "Tamer Hamdan",
    phone: "0597990011",
    age: 58,
    gender: "male",
    address: "Nablus",
    condition: "Stroke rehab",
  },
  {
    fullName: "Dana Qasem",
    phone: "0598001133",
    age: 22,
    gender: "female",
    address: "Jericho",
    condition: "Knee injury",
  },
];

seed().catch(async (err: unknown) => {
  console.error("Seed failed:", err);
  await disconnectDb();
  process.exit(1);
});
