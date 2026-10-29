# Patients

The clinic's patient records. Patients are **never deleted**: when treatment ends, the status becomes `completed`. The admin can also **hide** a patient, so nobody except the admin sees them (soft delete).

| Method | Path                   | Needs           | Send                        | Returns             |
| ------ | ---------------------- | --------------- | --------------------------- | ------------------- |
| GET    | `/patients`            | `patients.view` | list params + filters below | `Patient[]` (paged) |
| GET    | `/patients/export`     | `patients.view` | same params as the list     | CSV file            |
| POST   | `/patients`            | `patients.edit` | `PatientInput`              | `Patient` (201)     |
| GET    | `/patients/:id`        | `patients.view` |                             | `Patient`           |
| PUT    | `/patients/:id`        | `patients.edit` | `PatientInput`              | `Patient`           |
| PATCH  | `/patients/:id/status` | `patients.edit` | `{ "status": "completed" }` | `Patient`           |
| PATCH  | `/patients/:id/hide`   | Admin           | `{ "isHidden": true }`      | `Patient`           |

Every endpoint only sees patients in the user's [patient scope](users.md#patient-scope). Others return `NOT_FOUND`.

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
  "isHidden": false,
  "lastVisit": "2026-10-20T09:00:00.000Z",
  "hasAccount": false,
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-20T09:00:00.000Z"
}
```

- `lastVisit` is filled in automatically from the patient's latest report. It is `null` until the first report.
- `status` and `isHidden` cannot be sent in `POST`/`PUT`; they have their own endpoints.
- `hasAccount` is `true` once the admin creates a login for this patient ([users.md](users.md#create-an-account)).

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

`PUT` takes the same body. A patient created by a therapist with a limited scope is added to their scope.

## Hide a patient (admin only)

```
PATCH /api/patients/6730a1.../hide
{ "isHidden": true }
```

A hidden patient disappears for everyone except the admin: lists, reports, dashboard numbers and direct links (`NOT_FOUND`). Send `{ "isHidden": false }` to show them again.

## List, search and sort

```
GET /api/patients?search=ahmad&status=active&sort=fullName&page=1
```

- Filters: `status`; admin only: `hidden=true` to list hidden patients.
- Searches `fullName`, `phone` and `condition`.
- Sort by `fullName`, `age`, `lastVisit` or `createdAt`.

## Export to CSV

`GET /api/patients/export` takes the same search, filters and sort as the list and downloads **every** matching patient in scope (no paging).
