# API Contract

The agreement between `client/` and `server/`. Both sides code against it, so frontend work never waits on backend work. TypeScript types for every shape below live in [`shared/api-types.ts`](../shared/api-types.ts).

Change this file in the same PR as any API change, and tell the other developer.

Items marked **TENTATIVE** depend on [open questions](#open-questions) and may change.

## Conventions

- **Base URL:** `/api` (for example `http://localhost:5000/api`).
- **Format:** JSON in and out, except file uploads (`multipart/form-data`), file downloads and CSV exports.
- **Auth:** send `Authorization: Bearer <token>`. Tokens come from `POST /auth/login` and expire after 1 day. There is no refresh token: on `401` the client logs out and redirects to login.
- **Dates:** ISO 8601 strings in UTC (`2026-11-01T06:30:00.000Z`). Calendar days are `YYYY-MM-DD` and clock times `HH:mm`, both in the clinic timezone (`Asia/Hebron`).
- **Ids:** MongoDB ObjectId strings, always exposed as `id` (never `_id`).
- **Nullable fields:** optional fields come back as `null`, not missing.

## Responses

Success:

```json
{ "success": true, "data": { "id": "..." } }
```

Paginated list:

```json
{
  "success": true,
  "data": [{ "id": "..." }],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "body.phone", "message": "Too small: expected string to have >=6 characters" }
    ]
  }
}
```

The client shows translated text based on `code` (and `details[].field` for form errors). `message` is for developers and may be English only.

| Code                    | Status | When                                                    |
| ----------------------- | ------ | ------------------------------------------------------- |
| `VALIDATION_ERROR`      | 400    | Body, query or params failed validation (has `details`) |
| `INVALID_JSON`          | 400    | Request body is not valid JSON                          |
| `INVALID_CREDENTIALS`   | 401    | Wrong email or password (same error for both)           |
| `UNAUTHORIZED`          | 401    | Missing, invalid or expired token                       |
| `FORBIDDEN`             | 403    | Logged in but the role is not allowed                   |
| `NOT_FOUND`             | 404    | Resource or route does not exist                        |
| `CONFLICT`              | 409    | Duplicate value (for example an email already in use)   |
| `SLOT_UNAVAILABLE`      | 409    | The chosen time is no longer free                       |
| `PENDING_LIMIT_REACHED` | 409    | The phone number already has 2 pending reservations     |
| `FILE_TOO_LARGE`        | 400    | An uploaded file is over 5 MB                           |
| `UNSUPPORTED_FILE_TYPE` | 400    | An uploaded file is not JPEG, PNG, WebP or PDF          |
| `TOO_MANY_FILES`        | 400    | More than 5 files in one upload or on one report        |
| `TOO_MANY_REQUESTS`     | 429    | Rate limit hit (login and public booking)               |
| `INTERNAL_ERROR`        | 500    | Unexpected server error                                 |

## Lists: pagination, search and sort

All list endpoints accept:

| Param    | Default      | Notes                                                         |
| -------- | ------------ | ------------------------------------------------------------- |
| `page`   | `1`          | 1-based                                                       |
| `limit`  | `10`         | Max `100`                                                     |
| `sort`   | `-createdAt` | Field name; `-` prefix means descending. Allowed fields below |
| `search` | none         | Case-insensitive "contains" search on the listed fields       |

Unknown `sort` fields return `VALIDATION_ERROR`.

## Enums

| Name                | Values                                         |
| ------------------- | ---------------------------------------------- |
| `Role`              | `admin`, `therapist` (TENTATIVE), `patient`    |
| `Gender`            | `male`, `female`                               |
| `PatientStatus`     | `active`, `completed`                          |
| `ReportProgress`    | `improving`, `stable`, `worse`                 |
| `ReservationStatus` | `pending`, `accepted`, `rejected`, `cancelled` |
| `BannerType`        | `announcement`, `schedule_update`              |
| `WorkDay`           | `0` (Sunday) to `4` (Thursday)                 |

## Roles

- **Visitor** (no token): public endpoints only.
- **Patient:** own profile and own reservations.
- **Staff:** `admin`, and `therapist` if therapists get logins (TENTATIVE). "Staff" below means both; "Admin" means admin only.

## Endpoints

### Health

| Method | Path      | Access | Response |
| ------ | --------- | ------ | -------- |
| GET    | `/health` | Public | `Health` |

### Auth

| Method | Path          | Access    | Body           | Response        |
| ------ | ------------- | --------- | -------------- | --------------- |
| POST   | `/auth/login` | Public    | `LoginRequest` | `LoginResponse` |
| GET    | `/auth/me`    | Logged in |                | `User`          |

- There is no register endpoint. Staff create patient logins (see Patients).
- Login is rate limited and returns `INVALID_CREDENTIALS` for both unknown email and wrong password.

### Patients

| Method | Path                    | Access | Body / Query                  | Response              |
| ------ | ----------------------- | ------ | ----------------------------- | --------------------- |
| GET    | `/patients`             | Staff  | `PatientListQuery`            | `Patient[]` paginated |
| GET    | `/patients/export`      | Admin  | Same query as the list        | CSV file              |
| POST   | `/patients`             | Staff  | `PatientInput`                | `Patient` (201)       |
| GET    | `/patients/:id`         | Staff  |                               | `Patient`             |
| PUT    | `/patients/:id`         | Staff  | `PatientInput`                | `Patient`             |
| PATCH  | `/patients/:id/status`  | Staff  | `PatientStatusRequest`        | `Patient`             |
| POST   | `/patients/:id/account` | Admin  | `CreatePatientAccountRequest` | `User` (201)          |

- **No delete.** Patients move between `active` and `completed` instead.
- Search: `fullName`, `phone`, `condition`. Sort: `fullName`, `age`, `lastVisit`, `createdAt`.
- `POST /patients/:id/account` returns `CONFLICT` if the email is taken or the patient already has an account.
- CSV export ignores `page` and `limit` and exports every matching row.

### Therapists

| Method | Path               | Access | Body / Query                           | Response                |
| ------ | ------------------ | ------ | -------------------------------------- | ----------------------- |
| GET    | `/therapists`      | Staff  | `ListQuery` + `isActive?`              | `Therapist[]` paginated |
| GET    | `/therapists/free` | Staff  | `scheduledAt`, `excludeReservationId?` | `Therapist[]`           |
| POST   | `/therapists`      | Admin  | `TherapistInput`                       | `Therapist` (201)       |
| GET    | `/therapists/:id`  | Staff  |                                        | `Therapist`             |
| PUT    | `/therapists/:id`  | Admin  | `TherapistInput`                       | `Therapist`             |

- **No delete.** Set `isActive: false` to stop assigning new sessions.
- `GET /therapists/free` lists active therapists who work at `scheduledAt` and have no accepted reservation within the session gap. Staff use it when accepting or rescheduling a reservation.
- Search: `fullName`, `specialty`. Sort: `fullName`, `createdAt`.

### Uploads

Files are stored in MongoDB GridFS.

| Method | Path           | Access | Body                                       | Response             |
| ------ | -------------- | ------ | ------------------------------------------ | -------------------- |
| POST   | `/uploads`     | Staff  | `multipart/form-data`, field `files` (1-5) | `Attachment[]` (201) |
| GET    | `/uploads/:id` | Staff  |                                            | The file             |

- Allowed: JPEG, PNG, WebP, PDF. Max 5 MB each, 5 per request.
- Flow: upload first, then send the returned ids as `attachmentIds` when creating or updating a report.
- Uploads not attached to a report within 24 hours are deleted.

### Reports

| Method | Path              | Access | Body / Query      | Response                         |
| ------ | ----------------- | ------ | ----------------- | -------------------------------- |
| GET    | `/reports`        | Staff  | `ReportListQuery` | `Report[]` paginated             |
| GET    | `/reports/export` | Admin  | Same as the list  | CSV file (includes patient name) |
| POST   | `/reports`        | Staff  | `ReportInput`     | `Report` (201)                   |
| GET    | `/reports/:id`    | Staff  |                   | `Report`                         |
| PUT    | `/reports/:id`    | Staff  | `ReportInput`     | `Report`                         |
| DELETE | `/reports/:id`    | Admin  |                   | `null`                           |

- `POST` returns `NOT_FOUND` if `patientId` does not exist.
- Creating, updating or deleting a report recalculates the patient's `lastVisit` from their latest report.
- Deleting a report also deletes its attachments.
- On `PUT`, `attachmentIds` is the full new list; removed files are deleted.
- Search: `diagnosis`, `treatmentPlan`, patient name. Sort: `date`, `progress`, `createdAt`.

### Reservations: public

| Method | Path                                | Access                  | Body / Query       | Response                  |
| ------ | ----------------------------------- | ----------------------- | ------------------ | ------------------------- |
| GET    | `/public/reservations/date-options` | Public                  |                    | `string[]` (`YYYY-MM-DD`) |
| GET    | `/public/reservations/availability` | Public                  | `date=YYYY-MM-DD`  | `Availability`            |
| GET    | `/public/reservations/today`        | Public                  |                    | `TodayOverview`           |
| POST   | `/public/reservations`              | Public (token optional) | `ReservationInput` | `Reservation` (201)       |

Booking rules (the server checks them again on every create and update):

- Open days: Sunday to Thursday, within the next 30 days. Friday and Saturday are closed.
- Slots every 15 minutes from 08:00 to 19:00, clinic time.
- A slot is **available** if it is in the future and at least one active therapist works then and has no **accepted** reservation within 45 minutes of it. Pending reservations do not block slots.
- Availability returns only free slots. Taken slots are left out, not shown as disabled.
- New reservations are `pending`. If a valid token is sent, the reservation is linked to that user.
- A phone number can have at most 2 `pending` reservations (`PENDING_LIMIT_REACHED`). The endpoint is rate limited per IP (`TOO_MANY_REQUESTS`).
- `today` shows the sessions running now, based on the current time. It never exposes names or phone numbers.

### Reservations: logged in

| Method | Path                        | Access            | Body / Query           | Response                  |
| ------ | --------------------------- | ----------------- | ---------------------- | ------------------------- |
| GET    | `/reservations`             | Patient, Staff    | `ReservationListQuery` | `Reservation[]` paginated |
| GET    | `/reservations/reschedules` | Staff (TENTATIVE) | `date=YYYY-MM-DD`      | `RescheduleNews[]`        |
| GET    | `/reservations/:id`         | Owner, Staff      |                        | `Reservation`             |
| POST   | `/reservations`             | Patient           | `ReservationInput`     | `Reservation` (201)       |
| PUT    | `/reservations/:id`         | Staff             | `ReservationUpdate`    | `Reservation`             |

- Patients only ever see their own reservations; another patient's id returns `FORBIDDEN`.
- `PUT` rules:
  - Changing `status` sets `reviewedAt`.
  - Setting `status: "accepted"` needs a `therapistId` who is free at that time (`SLOT_UNAVAILABLE` otherwise). Use `GET /therapists/free` to fill the select.
  - Changing `scheduledAt` (rescheduling) applies the same slot rules and sets `previousScheduledAt` and `rescheduledAt`.
- Filters: `status`, `therapistId`, `from`, `to`. Sort: `scheduledAt`, `createdAt`, `status`.
- `reschedules` lists reservations rescheduled on the given day, for the "rescheduling news" component.

### Banners

| Method | Path              | Access | Body / Query  | Response                                    |
| ------ | ----------------- | ------ | ------------- | ------------------------------------------- |
| GET    | `/public/banners` | Public |               | `Banner[]` (active only, sorted by `order`) |
| GET    | `/banners`        | Admin  | `ListQuery`   | `Banner[]` paginated                        |
| POST   | `/banners`        | Admin  | `BannerInput` | `Banner` (201)                              |
| PUT    | `/banners/:id`    | Admin  | `BannerInput` | `Banner`                                    |
| DELETE | `/banners/:id`    | Admin  |               | `null`                                      |

- Activate or deactivate with `PUT` and `isActive`.
- Sort: `order`, `createdAt`. Default sort for the admin list: `order`.

### Dashboard

| Method | Path               | Access | Response         |
| ------ | ------------------ | ------ | ---------------- |
| GET    | `/dashboard/stats` | Staff  | `DashboardStats` |

## Changes from the original plan

Based on the supervisor's answers (2026-10-27):

- No patient self-registration: added `POST /patients/:id/account`.
- No patient delete: removed `DELETE /patients/:id` and the report cascade (task 4.4); added `PatientStatus` and `PATCH /patients/:id/status`.
- Multiple therapists: added the Therapist resource, `therapistId` on reservations and reports, and per-therapist slot checks.
- Only accepted reservations block slots, and taken slots are hidden rather than disabled (task 5.7).
- Files go to GridFS instead of the local disk (task 4.6).
- Guest spam protection: 2 pending reservations per phone and rate limiting.
- Banners have a `type`; added rescheduling news and the "running now" data for the landing page.

## Open questions

To confirm with the supervisor. Until then, the TENTATIVE choices above apply.

1. **Therapist logins:** do therapists log in? If yes, can they do everything an admin can, or only see their own sessions and write reports?
2. **Patient account link:** is a patient login always tied to one patient record (current assumption: yes, created from the patient's page)?
3. **Session length and gaps:** sessions are 45 minutes apart and slots every 15 minutes. Is the 15-minute gap extra, making sessions effectively 60 minutes apart, or is it included in the 45?
4. **Therapist assignment:** when a reservation is accepted, does staff pick the therapist (current assumption), or should the system assign one automatically?
5. **Working hours:** is 08:00 to 19:00 the same for every therapist, or does each therapist have their own hours (current assumption: own hours, inside 08:00 to 19:00)?
6. **Rescheduling news:** who sees it, staff only (current assumption) or also on the public site? Should the patient be notified?
7. **Patient status:** are `active` and `completed` enough, or is another status needed (for example `inactive`)?
