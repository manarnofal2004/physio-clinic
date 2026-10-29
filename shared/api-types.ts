// Shared API types for client and server. See docs/api/README.md for endpoints.
// Rules:
// - Dates and times are ISO 8601 strings in UTC ("2026-11-01T06:30:00.000Z").
// - Calendar days are "YYYY-MM-DD" and clock times "HH:mm", both in the clinic
//   timezone (Asia/Hebron).
// - Ids are MongoDB ObjectId strings.

// ---------- Enums ----------
// Arrays are exported so zod schemas and select inputs can reuse them.

export const ROLES = ["admin", "therapist", "patient"] as const;
export type Role = (typeof ROLES)[number];

// What the admin allows a therapist to do. Admins have all of them.
export const PRIVILEGES = [
  "patients.view",
  "patients.edit",
  "reports.view",
  "reports.edit",
  "reservations.view",
  "reservations.take",
  "reservations.manage",
  "banners.manage",
  "dashboard.view",
] as const;
export type Privilege = (typeof PRIVILEGES)[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

// Patients are never deleted; staff change the status instead.
export const PATIENT_STATUSES = ["active", "completed"] as const;
export type PatientStatus = (typeof PATIENT_STATUSES)[number];

export const REPORT_PROGRESS = ["improving", "stable", "worse"] as const;
export type ReportProgress = (typeof REPORT_PROGRESS)[number];

// Only "accepted" reservations block time slots.
export const RESERVATION_STATUSES = ["pending", "accepted", "rejected", "cancelled"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const BANNER_TYPES = ["announcement", "schedule_update"] as const;
export type BannerType = (typeof BANNER_TYPES)[number];

// 0 = Sunday ... 4 = Thursday. The clinic is closed Friday and Saturday.
export const WORK_DAYS = [0, 1, 2, 3, 4] as const;
export type WorkDay = (typeof WORK_DAYS)[number];

// ---------- Response envelope ----------

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "INVALID_JSON",
  "PAYLOAD_TOO_LARGE",
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "ACCOUNT_DISABLED",
  "NOT_FOUND",
  "CONFLICT",
  "SLOT_UNAVAILABLE",
  "PENDING_LIMIT_REACHED",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_FILE_TYPE",
  "TOO_MANY_FILES",
  "TOO_MANY_REQUESTS",
  "INTERNAL_ERROR",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export interface FieldError {
  field: string; // "body.phone", "query.page", ...
  message: string;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: FieldError[];
  };
}

// ---------- Query params ----------

export interface ListQuery {
  page?: number; // default 1
  limit?: number; // default 10, max 100
  sort?: string; // field name, "-" prefix for descending: "-createdAt"
  search?: string;
}

// ---------- Auth and users ----------

// Which patients a user may see: all, or a chosen list.
export type PatientScope = { all: true } | { all: false; patientIds: string[] };

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  patientId: string | null; // set for role "patient"
  therapistId: string | null; // set for role "therapist"
  privileges: Privilege[]; // admin: all; patient: []
  patientScope: PatientScope | null; // admin: { all: true }; patient: null
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string; // JWT, expires after 1 day
  user: User;
}

// Nobody signs up: the admin creates therapist and patient accounts.
export interface CreateUserRequest {
  role: "therapist" | "patient";
  therapistId?: string; // required for "therapist"
  patientId?: string; // required for "patient"
  fullName: string; // 2-120
  email: string;
  password: string; // min 8
  privileges?: Privilege[]; // therapist only, default []
  patientScope?: PatientScope; // therapist only, default { all: false, patientIds: [] }
}

export interface UpdateUserAccessRequest {
  privileges: Privilege[];
  patientScope: PatientScope;
}

export interface UserStatusRequest {
  isActive: boolean;
}

export interface UserListQuery extends ListQuery {
  role?: Role;
  isActive?: boolean;
}

// ---------- Patients ----------

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  gender: Gender;
  address: string | null;
  condition: string;
  notes: string | null;
  status: PatientStatus;
  isHidden: boolean; // hidden patients are visible to the admin only
  lastVisit: string | null; // date of the latest report
  hasAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  fullName: string; // 2-120
  phone: string; // 6-30
  age: number; // 0-120
  gender: Gender;
  address?: string; // max 300
  condition: string; // 2-200
  notes?: string; // max 2000
}

export interface PatientListQuery extends ListQuery {
  status?: PatientStatus;
  hidden?: boolean; // admin only
}

export interface PatientStatusRequest {
  status: PatientStatus;
}

// Admin only.
export interface PatientHideRequest {
  isHidden: boolean;
}

// ---------- Therapists ----------

export interface WorkingHours {
  day: WorkDay;
  start: string; // "HH:mm"
  end: string; // "HH:mm", after start
}

export interface Therapist {
  id: string;
  fullName: string;
  phone: string | null;
  specialty: string | null;
  isActive: boolean;
  hasAccount: boolean; // true once the admin creates a login for this therapist
  schedule: WorkingHours[];
  createdAt: string;
  updatedAt: string;
}

export interface TherapistInput {
  fullName: string; // 2-120
  phone?: string;
  specialty?: string; // max 120
  isActive?: boolean; // default true
  schedule: WorkingHours[];
}

// ---------- Uploads (stored in MongoDB GridFS) ----------

export interface Attachment {
  id: string; // GridFS file id
  filename: string;
  mimeType: string; // image/jpeg, image/png, image/webp, application/pdf
  size: number; // bytes, max 5 MB
  uploadedAt: string;
}

// ---------- Reports ----------

export interface PatientSummary {
  id: string;
  fullName: string;
}

export interface Report {
  id: string;
  patient: PatientSummary;
  therapistId: string | null;
  date: string;
  diagnosis: string;
  treatmentPlan: string;
  sessionNotes: string | null;
  progress: ReportProgress;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportInput {
  patientId: string;
  therapistId?: string; // defaults to the logged-in therapist
  date: string;
  diagnosis: string; // 2-2000
  treatmentPlan: string; // 2-2000
  sessionNotes?: string; // max 5000
  progress: ReportProgress;
  attachmentIds?: string[]; // from POST /uploads, max 5
}

export interface ReportListQuery extends ListQuery {
  patientId?: string;
  progress?: ReportProgress;
  from?: string; // "YYYY-MM-DD"
  to?: string; // "YYYY-MM-DD"
}

// ---------- Reservations ----------

export interface Reservation {
  id: string;
  userId: string | null; // null for guest bookings
  therapistId: string | null; // set when a therapist takes it or the admin assigns one; null for patients
  fullName: string;
  phone: string;
  age: number;
  scheduledAt: string;
  status: ReservationStatus;
  notes: string | null;
  adminNotes: string | null; // null for patients
  reviewedAt: string | null; // set when status changes
  previousScheduledAt: string | null; // set when staff reschedule
  rescheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationInput {
  fullName: string; // 2-120
  phone: string; // 6-30
  age: number; // 0-120
  scheduledAt: string; // must be an available slot
  notes?: string; // max 2000
}

// PUT /reservations/:id, needs "reservations.manage".
// Accepting requires a therapistId that is free at scheduledAt.
export interface ReservationUpdate {
  scheduledAt?: string;
  status?: ReservationStatus;
  therapistId?: string;
  adminNotes?: string; // max 2000
}

// POST /reservations/:id/take, needs "reservations.take".
// Accepts a pending reservation for the logged-in therapist.
export interface TakeReservationRequest {
  adminNotes?: string; // max 2000
}

export interface ReservationListQuery extends ListQuery {
  status?: ReservationStatus;
  therapistId?: string;
  mine?: boolean; // the logged-in therapist's own sessions
  from?: string; // "YYYY-MM-DD"
  to?: string; // "YYYY-MM-DD"
}

// GET /public/reservations/availability?date=YYYY-MM-DD
// Only free slots are returned; taken slots are left out, not flagged.
export interface Availability {
  date: string;
  slots: string[]; // ["08:00", "08:15", ...]
}

// GET /public/reservations/today. No personal data is exposed.
export interface TodayOverview {
  date: string;
  now: string;
  runningNow: number; // sessions in progress at `now`
  sessions: { startsAt: string; endsAt: string; state: "done" | "running" | "upcoming" }[];
  availableSlotsLeft: number;
}

// GET /reservations/reschedules?date=YYYY-MM-DD, needs "reservations.view".
export interface RescheduleNews {
  reservationId: string;
  previousScheduledAt: string;
  scheduledAt: string;
  rescheduledAt: string;
}

// ---------- Banners ----------

export interface Banner {
  id: string;
  type: BannerType;
  messageEn: string; // max 300
  messageAr: string; // max 300
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerInput {
  type: BannerType;
  messageEn: string;
  messageAr: string;
  isActive?: boolean; // default true
  order?: number; // default 0
}

// ---------- Dashboard ----------

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalReports: number;
  pendingReservations: number;
  recentPatients: Pick<Patient, "id" | "fullName" | "condition" | "lastVisit" | "createdAt">[];
  reportsOverTime: { month: string; count: number }[]; // month: "YYYY-MM", last 12 months
  progressCounts: Record<ReportProgress, number>;
  conditionCounts: { condition: string; count: number }[]; // top 10
}

// ---------- Health ----------

export interface Health {
  status: "ok";
  db: "connected" | "disconnected";
}
