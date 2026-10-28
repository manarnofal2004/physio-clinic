# API Contract

The agreement between `client/` and `server/`: every endpoint, what it takes and what it returns. Both sides code against it, so frontend work never waits on backend work.

- TypeScript types for every shape: [`shared/api-types.ts`](../../shared/api-types.ts)
- Change these files in the same PR as any API change, and tell the other developer.
- **TENTATIVE** marks anything that depends on an [open question](open-questions.md).

## Sections

| File                                   | Covers                                                 |
| -------------------------------------- | ------------------------------------------------------ |
| [auth.md](auth.md)                     | Login, current user                                    |
| [patients.md](patients.md)             | Patients, patient status, patient accounts, CSV export |
| [therapists.md](therapists.md)         | Therapists and their working hours                     |
| [reports.md](reports.md)               | Treatment reports and file uploads                     |
| [reservations.md](reservations.md)     | Public booking, slot rules, managing reservations      |
| [banners.md](banners.md)               | Announcement banners                                   |
| [dashboard.md](dashboard.md)           | Dashboard stats                                        |
| [open-questions.md](open-questions.md) | Questions for the supervisor and changes from the plan |

## Basics

- **Base URL:** `/api`, for example `http://localhost:5000/api/patients`.
- **Format:** JSON, except file uploads (`multipart/form-data`), file downloads and CSV exports.
- **Auth:** send `Authorization: Bearer <token>`. The token comes from `POST /auth/login` and expires after 1 day. On `401` the client logs out and goes to the login page.
- **Dates:** ISO strings in UTC, like `"2026-11-01T06:30:00.000Z"`. Days are `"YYYY-MM-DD"` and times `"HH:mm"`, both in clinic time (`Asia/Hebron`).
- **Ids:** always `id`, never `_id`.
- **Empty optional fields** come back as `null`.

## Who can call what

| Role               | Can use                                                       |
| ------------------ | ------------------------------------------------------------- |
| Visitor (no token) | `/health`, `/auth/login`, everything under `/public`          |
| Patient            | Their own user and their own reservations                     |
| Staff              | `admin`, and `therapist` if therapists get logins (TENTATIVE) |
| Admin              | Everything                                                    |

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

| Code                    | Status | Example                                  |
| ----------------------- | ------ | ---------------------------------------- |
| `VALIDATION_ERROR`      | 400    | Phone number too short                   |
| `INVALID_JSON`          | 400    | Broken request body                      |
| `FILE_TOO_LARGE`        | 400    | Uploaded file over 5 MB                  |
| `UNSUPPORTED_FILE_TYPE` | 400    | Uploaded a `.docx`                       |
| `TOO_MANY_FILES`        | 400    | More than 5 files                        |
| `INVALID_CREDENTIALS`   | 401    | Wrong email or password                  |
| `UNAUTHORIZED`          | 401    | No token, or the token expired           |
| `FORBIDDEN`             | 403    | A patient opens an admin page            |
| `NOT_FOUND`             | 404    | Patient id does not exist                |
| `CONFLICT`              | 409    | Email already used                       |
| `SLOT_UNAVAILABLE`      | 409    | Someone else got that time first         |
| `PENDING_LIMIT_REACHED` | 409    | Phone already has 2 pending reservations |
| `TOO_MANY_REQUESTS`     | 429    | Too many login or booking attempts       |
| `INTERNAL_ERROR`        | 500    | Bug on the server                        |

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
| `Role`              | `admin`, `therapist` (TENTATIVE), `patient`    |
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
