# Users and privileges

Only the admin creates accounts, for therapists and for patients. For each therapist the admin decides what they may do (privileges) and which patients they may see (patient scope). This powers the admin's "Users and privileges" page.

| Method | Path                | Who   | Send                               | Returns          |
| ------ | ------------------- | ----- | ---------------------------------- | ---------------- |
| GET    | `/users`            | Admin | list params + `role?`, `isActive?` | `User[]` (paged) |
| POST   | `/users`            | Admin | `CreateUserRequest`                | `User` (201)     |
| GET    | `/users/:id`        | Admin |                                    | `User`           |
| PUT    | `/users/:id/access` | Admin | `{ privileges, patientScope }`     | `User`           |
| PATCH  | `/users/:id/status` | Admin | `{ "isActive": false }`            | `User`           |

## Privileges

| Privilege             | Lets the user                                                    |
| --------------------- | ---------------------------------------------------------------- |
| `patients.view`       | See patients in their scope and export them to CSV               |
| `patients.edit`       | Create patients, and edit or change the status of those in scope |
| `reports.view`        | See reports of patients in their scope                           |
| `reports.edit`        | Create, edit and delete those reports, and upload files          |
| `reservations.view`   | See all reservations and the rescheduling news                   |
| `reservations.take`   | Take a pending reservation for themselves                        |
| `reservations.manage` | Accept, reject, reschedule and assign any reservation            |
| `banners.manage`      | Manage announcement banners                                      |
| `dashboard.view`      | See the dashboard, with numbers limited to their scope           |

Always admin only: managing users and therapists, and hiding patients.

## Patient scope

All patients:

```json
{ "all": true }
```

Only chosen patients:

```json
{ "all": false, "patientIds": ["6730a1...", "6730a2..."] }
```

Scope limits patients, reports and dashboard numbers. A patient outside the scope returns `NOT_FOUND`. A patient the user creates is added to their scope automatically.

## Create an account

A **therapist** account is linked to a therapist profile. Create the profile first ([therapists.md](therapists.md)):

```
POST /api/users
{
  "role": "therapist",
  "therapistId": "6730b1...",
  "fullName": "Dr. Lina Khalil",
  "email": "lina@clinic.com",
  "password": "atLeast8chars",
  "privileges": ["patients.view", "reports.view", "reports.edit", "reservations.take"],
  "patientScope": { "all": true }
}
```

A **patient** account is linked to a patient record. Usually a therapist accepts a new patient, then asks the admin to create the account:

```
POST /api/users
{
  "role": "patient",
  "patientId": "6730a1...",
  "fullName": "Ahmad Saleh",
  "email": "ahmad@example.com",
  "password": "atLeast8chars"
}
```

| Field          | Rules                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| `role`         | `therapist` or `patient` (the first admin comes from the seed)         |
| `therapistId`  | Required for `therapist`; must exist; one account per therapist        |
| `patientId`    | Required for `patient`; must exist; one account per patient            |
| `fullName`     | Required, 2-120 chars                                                  |
| `email`        | Required, unique                                                       |
| `password`     | Required, min 8 chars                                                  |
| `privileges`   | Therapist only. Optional, default `[]`                                 |
| `patientScope` | Therapist only. Optional, default `{ "all": false, "patientIds": [] }` |

Returns `CONFLICT` if the email is taken or that therapist or patient already has an account.

## Change access or turn an account off

```
PUT /api/users/6730a9.../access
{ "privileges": ["patients.view", "reports.view"], "patientScope": { "all": false, "patientIds": ["6730a1..."] } }
```

```
PATCH /api/users/6730a9.../status
{ "isActive": false }
```

A turned-off account cannot log in (`ACCOUNT_DISABLED`). Accounts are never deleted, so their history stays linked.

## List

Searches `fullName` and `email`. Filters: `role`, `isActive`. Sort by `fullName`, `role` or `createdAt`.
