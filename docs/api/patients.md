# Patients

The clinic's patient records. Patients are **never deleted**: when treatment ends, staff set the status to `completed`.

| Method | Path                    | Who   | Send                        | Returns             |
| ------ | ----------------------- | ----- | --------------------------- | ------------------- |
| GET    | `/patients`             | Staff | list params + `status?`     | `Patient[]` (paged) |
| GET    | `/patients/export`      | Admin | same params as the list     | CSV file            |
| POST   | `/patients`             | Staff | `PatientInput`              | `Patient` (201)     |
| GET    | `/patients/:id`         | Staff |                             | `Patient`           |
| PUT    | `/patients/:id`         | Staff | `PatientInput`              | `Patient`           |
| PATCH  | `/patients/:id/status`  | Staff | `{ "status": "completed" }` | `Patient`           |
| POST   | `/patients/:id/account` | Admin | `{ "email", "password" }`   | `User` (201)        |

## A patient

```json
{
  "id": "6730a1...",
  "fullName": "Ahmad Saleh",
  "phone": "0599123456",
  "age": 34,
  "gender": "male",
  "address": "Nablus",
  "condition": "Lower back pain",
  "notes": null,
  "status": "active",
  "lastVisit": "2026-10-20T09:00:00.000Z",
  "hasAccount": false,
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-20T09:00:00.000Z"
}
```

- `lastVisit` is filled in automatically from the patient's latest report. It is `null` until the first report.
- `status` and `hasAccount` cannot be sent in `POST`/`PUT`; they have their own endpoints.

## Create or edit

```
POST /api/patients
{
  "fullName": "Ahmad Saleh",
  "phone": "0599123456",
  "age": 34,
  "gender": "male",
  "address": "Nablus",
  "condition": "Lower back pain"
}
```

| Field       | Rules                 |
| ----------- | --------------------- |
| `fullName`  | Required, 2-120 chars |
| `phone`     | Required, 6-30 chars  |
| `age`       | Required, 0-120       |
| `gender`    | `male` or `female`    |
| `condition` | Required, 2-200 chars |
| `address`   | Optional, max 300     |
| `notes`     | Optional, max 2000    |

`PUT` takes the same body. Unknown id returns `NOT_FOUND`.

## List, search and sort

```
GET /api/patients?search=ahmad&status=active&sort=fullName&page=1
```

- Searches `fullName`, `phone` and `condition`.
- Sort by `fullName`, `age`, `lastVisit` or `createdAt`.

## Export to CSV

`GET /api/patients/export` takes the same search, status and sort as the list and downloads **every** matching patient (no paging).

## Create a login for a patient

```
POST /api/patients/6730a1.../account
{ "email": "ahmad@example.com", "password": "atLeast8chars" }
```

Returns the new `User` with `role: "patient"` and `patientId` set. Returns `CONFLICT` if the email is taken or the patient already has a login.
