import { env } from "../config/env.js";
import { REPORT_PROGRESS, type ReportProgress } from "../constants.js";
import { Patient } from "../models/patient.model.js";
import { Report } from "../models/report.model.js";
import { Reservation } from "../models/reservation.model.js";
import type { UserDocument } from "../models/user.model.js";
import { clinicDayAndTime, zonedTime } from "../utils/time.js";
import { patientScopeFilter } from "./access.service.js";
import { reportScopeFilter } from "./reports.service.js";

const MONTHS = 12;
const TOP_CONDITIONS = 10;
const RECENT_PATIENTS = 5;

// The last 12 months as "YYYY-MM", oldest first, in clinic time.
function lastMonths(now: Date): string[] {
  const [year = 0, month = 1] = clinicDayAndTime(now, env.CLINIC_TIMEZONE)
    .day.split("-")
    .map(Number);
  return Array.from({ length: MONTHS }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 - (MONTHS - 1 - i), 1));
    return date.toISOString().slice(0, 7);
  });
}

// Every number on the dashboard, counted only over the patients the user may see.
export async function dashboardStats(user: UserDocument, now = new Date()) {
  const patientScope = patientScopeFilter(user);
  const reportScope = await reportScopeFilter(user);
  const months = lastMonths(now);
  const since = zonedTime(`${months[0]}-01`, "00:00", env.CLINIC_TIMEZONE);

  const [
    totalPatients,
    activePatients,
    totalReports,
    pendingReservations,
    recent,
    perMonth,
    perProgress,
    perCondition,
  ] = await Promise.all([
    Patient.countDocuments(patientScope),
    Patient.countDocuments({ $and: [patientScope, { status: "active" }] }),
    Report.countDocuments(reportScope),
    Reservation.countDocuments({ status: "pending" }),
    Patient.find(patientScope).sort({ createdAt: -1 }).limit(RECENT_PATIENTS),
    Report.aggregate<{ _id: string; count: number }>([
      { $match: { $and: [reportScope, { date: { $gte: since } }] } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date", timezone: env.CLINIC_TIMEZONE } },
          count: { $sum: 1 },
        },
      },
    ]),
    Report.aggregate<{ _id: ReportProgress; count: number }>([
      { $match: reportScope },
      { $group: { _id: "$progress", count: { $sum: 1 } } },
    ]),
    Patient.aggregate<{ _id: string; count: number }>([
      { $match: patientScope },
      { $group: { _id: "$condition", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: TOP_CONDITIONS },
    ]),
  ]);

  // Months and progress values with no reports still appear, with 0.
  const monthCounts = new Map(perMonth.map((m) => [m._id, m.count]));
  const progressCounts = Object.fromEntries(REPORT_PROGRESS.map((p) => [p, 0])) as Record<
    ReportProgress,
    number
  >;
  for (const { _id, count } of perProgress) progressCounts[_id] = count;

  return {
    totalPatients,
    activePatients,
    totalReports,
    pendingReservations,
    recentPatients: recent.map((p) => ({
      id: p.id as string,
      fullName: p.fullName,
      condition: p.condition,
      lastVisit: p.lastVisit,
      createdAt: p.createdAt,
    })),
    reportsOverTime: months.map((month) => ({ month, count: monthCounts.get(month) ?? 0 })),
    progressCounts,
    conditionCounts: perCondition.map((c) => ({ condition: c._id, count: c.count })),
  };
}
