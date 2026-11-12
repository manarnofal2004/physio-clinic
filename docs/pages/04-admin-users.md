# 4. Users and privileges

| | |
| - | - |
| Route | `/admin/users` |
| Access | Admin only |
| Built by | Manar (task 2.10) |

## Purpose

Only the admin creates accounts. This page lists every account, creates logins for physiotherapists and patients, sets what each physiotherapist may do and which patients they see, and turns accounts on or off (accounts are never deleted).

## Files

| File | Role |
| ---- | ---- |
| `features/users/UsersPage.tsx` | Page: filters, table, dialogs |
| `features/users/CreateUserDialog.tsx` | New therapist or patient account |
| `features/users/AccessDialog.tsx` | Change a therapist's privileges and patient scope |
| `features/users/AccessEditor.tsx` | Privileges in groups + patient scope picker (shared by both dialogs) |
| `features/users/api.ts` | Queries and mutations |

## Data and API

| Call | Hook | Notes |
| ---- | ---- | ----- |
| `GET /users?page&limit&sort=fullName&search&role&isActive` | `useUsers(filter)` | `keepPreviousData` so the table does not jump between pages |
| `GET /therapists?limit=100` | `useTherapistOptions` | Profiles to link a therapist account to |
| `GET /patients?limit=…&search` | `usePatientOptions(search)` | Patients to link or to add to a scope |
| `POST /users` | `create` | `CreateUserRequest` (therapist or patient variant) |
| `PUT /users/:id/access` | `access` | `{ privileges, patientScope }` |
| `PATCH /users/:id/status` | `status` | `{ isActive }` |

After every change the users, therapists and patients queries refresh (an account changes "has an account" on profiles).

## How it works

- **Table** (`DataTable`): avatar with initials, name, email (left-to-right), role chip, a one-line access summary ("7 privileges · All patients", "Their own record only", "Everything"), the "Can log in" switch and, for therapists, a key button to change access.
- **Filters:** search (debounced 350 ms), role, status; server-side paging (10 per page by default).
- **Create account:** choose physiotherapist or patient; pick the profile or record (only those without an account are offered; picking fills the name); email, password (min 8). Therapists also get privileges and a scope (default: see patients and see reports, all patients).
- **Privileges** are grouped as Patients, Medical reports, Reservations, Other. **Scope** is "All patients" or "Only chosen patients" with a searchable multi-select that keeps names of chosen patients while searching.
- The admin cannot turn off their own account (switch disabled).

## Validation and errors

Client checks: profile chosen, name 2–120, valid email, password ≥ 8. Server `CONFLICT` (email used or person already has an account) and `VALIDATION_ERROR` have their own messages. Success and failure show as notifications.

## States, languages, responsive

Loading spinner inside the table, error with retry, "no accounts match". Arabic plural forms for the counts. On phones the filters stack; the table scrolls sideways (see limitations).

## Known limitations

- On phones the table hides the last columns (switch and key button) until scrolled sideways; a card layout for phones is planned.
- No password reset from this page yet.
