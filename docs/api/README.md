# API Contract

The agreement between `client/` and `server/`: every endpoint, what it takes and what it returns. Both sides code against it, so frontend work never waits on backend work.

- TypeScript types for every shape: [`shared/api-types.ts`](../../shared/api-types.ts)
- Change these files in the same PR as any API change, and tell the other developer.
- The supervisor's decisions and the few questions still open: [decisions.md](decisions.md).

## Sections

| File                               | Covers                                              |
| ---------------------------------- | --------------------------------------------------- |
| [auth.md](auth.md)                 | Login, current user                                 |
| [users.md](users.md)               | Accounts, privileges and patient scope (admin)      |
| [me.md](me.md)                     | Patient portal: own record, reports and files       |
| [patients.md](patients.md)         | Patients, status, hiding, CSV export                |
| [therapists.md](therapists.md)     | Therapists and their working hours                  |
| [reports.md](reports.md)           | Treatment reports and file uploads                  |
| [reservations.md](reservations.md) | Public booking, slot rules, managing reservations   |
| [banners.md](banners.md)           | Announcement banners                                |
| [dashboard.md](dashboard.md)       | Dashboard stats                                     |
| [decisions.md](decisions.md)       | Supervisor's decisions and remaining open questions |

## Basics

- **Base URL:** `/api`, for example `http://localhost:5000/api/patients`.
- **Format:** JSON, except file uploads (`multipart/form-data`), file downloads and CSV exports.
- **Auth:** send `Authorization: Bearer <token>`. The token comes from `POST /auth/login` and expires after 1 day. On `401` the client logs out and goes to the login page.
- **Dates:** ISO strings in UTC, like `"2026-11-01T06:30:00.000Z"`. Days are `"YYYY-MM-DD"` and times `"HH:mm"`, both in clinic time (`Asia/Hebron`).
- **Ids:** always `id`, never `_id`.
- **Empty optional fields** come back as `null`.

## Who can call what

| Role                 | Can use                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| Visitor (no account) | `/health`, `/auth/login`, everything under `/public`                     |
| Patient              | Their own user and their own reservations                                |
| Therapist            | Only what the admin allows: their **privileges** and **patient scope**   |
| Admin                | Everything. Only the admin manages users, therapists and hidden patients |

Only the admin creates accounts; nobody signs up. For each therapist the admin picks:

- **Privileges:** what they may do, for example view patients but not edit them.
- **Patient scope:** which patients they may see: all of them, or a chosen list.

Each section names the privilege an endpoint needs; without it the API returns `FORBIDDEN`. A patient outside the user's scope, or hidden by the admin, returns `NOT_FOUND` as if it did not exist. Details: [users.md](users.md).

## Response shape

Every response is one of three shapes.

**One item**

```json
{ "success": true, "data": { "id": "6730a1...", "fullName": "Ahmad Saleh" } }
```

**A page of a list**

```json
{
  "success": true,
  "data": [{ "id": "6730a1..." }, { "id": "6730a2..." }],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**An error**

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

The client shows translated text based on `code`, and puts `details` messages under the matching form field. `message` is for developers.

## Error codes

| Code                    | Status | Example                                             |
| ----------------------- | ------ | --------------------------------------------------- |
| `VALIDATION_ERROR`      | 400    | Phone number too short                              |
| `INVALID_JSON`          | 400    | Broken request body                                 |
| `PAYLOAD_TOO_LARGE`     | 413    | Request body over 100 kB                            |
| `FILE_TOO_LARGE`        | 400    | Uploaded file over 5 MB                             |
| `UNSUPPORTED_FILE_TYPE` | 400    | Uploaded a `.docx`                                  |
| `TOO_MANY_FILES`        | 400    | More than 5 files                                   |
| `INVALID_CREDENTIALS`   | 401    | Wrong email or password                             |
| `UNAUTHORIZED`          | 401    | No token, or the token expired                      |
| `FORBIDDEN`             | 403    | A therapist without `patients.edit` edits a patient |
| `ACCOUNT_DISABLED`      | 403    | Login to an account the admin turned off            |
| `NOT_FOUND`             | 404    | Patient does not exist, is hidden or out of scope   |
| `CONFLICT`              | 409    | Email already used                                  |
| `SLOT_UNAVAILABLE`      | 409    | Someone else got that time first                    |
| `PENDING_LIMIT_REACHED` | 409    | Phone already has 2 pending reservations            |
| `TOO_MANY_REQUESTS`     | 429    | Too many login or booking attempts                  |
| `INTERNAL_ERROR`        | 500    | Bug on the server                                   |

## Lists

Every list endpoint takes the same query params:

```
GET /api/patients?page=2&limit=10&sort=-createdAt&search=ahmad
```

| Param    | Default      | Meaning                                                   |
| -------- | ------------ | --------------------------------------------------------- |
| `page`   | `1`          | Page number, starting at 1                                |
| `limit`  | `10`         | Items per page, max 100                                   |
| `sort`   | `-createdAt` | Field to sort by; `-` in front means newest/largest first |
| `search` | none         | Text to look for (each section lists the searched fields) |

## Fixed values (enums)

| Name                | Values                                         |
| ------------------- | ---------------------------------------------- |
| `Role`              | `admin`, `therapist`, `patient`                |
| `Privilege`         | See [users.md](users.md#privileges)            |
| `Gender`            | `male`, `female`                               |
| `PatientStatus`     | `active`, `completed`                          |
| `ReportProgress`    | `improving`, `stable`, `worse`                 |
| `ReservationStatus` | `pending`, `accepted`, `rejected`, `cancelled` |
| `BannerType`        | `announcement`, `schedule_update`              |
| `WorkDay`           | `0` (Sunday) to `4` (Thursday)                 |

## Health check

`GET /health` (public) tells you the server is up:

```json
{ "success": true, "data": { "status": "ok", "db": "connected" } }
```
