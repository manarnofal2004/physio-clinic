# 5. Physiotherapists

| | |
| - | - |
| Route | `/admin/therapists` |
| Access | Admin only |
| Built by | Manar (task 2.11) |

## Purpose

Keep the list of the clinic's physiotherapists and their working hours. The booking rules use these hours: a time is free only if a working, active therapist is not busy then.

## Files

| File | Role |
| ---- | ---- |
| `features/therapists/TherapistsPage.tsx` | List with a week strip per therapist |
| `features/therapists/TherapistDialog.tsx` | Add / edit form with hours per day |
| `features/therapists/schedule.ts` | Clinic days, 15-minute times between 08:00 and 19:00, helpers |
| `features/therapists/api.ts` | `useTherapists`, `create`, `update`, `toInput` |

## Data and API

| Call | Notes |
| ---- | ----- |
| `GET /therapists?limit=100&sort=fullName` | All therapists, active or not |
| `POST /therapists` | `TherapistInput { fullName, phone?, specialty?, isActive, schedule[] }` |
| `PUT /therapists/:id` | Full replacement; the active switch sends the whole profile with `isActive` changed |

## How it works

- Each row: initials, name, specialty, phone, a "Has a login" chip or a "No login yet" chip that links to the users page.
- **Week strip:** for Sunday to Thursday a bar from opening (08:00) to closing (19:00) with the working block filled in olive; `position(time)` converts a time to a percentage, and `insetInlineStart` places it so it mirrors correctly in Arabic. Days off are faded.
- **"Takes new sessions" switch:** therapists are never deleted (supervisor's rule); turning it off fades the row and stops new bookings going to them.
- **Form:** one block per day (checkbox + "from" + "to" selects in 15-minute steps).

## Validation and errors

Name 2–120; phone empty or 6–30; specialty ≤ 120; at least one working day; end after start on every day. Save failures show an alert in the dialog.

## States, languages, responsive

Loading, error with retry, empty state. Day names from `Intl.DateTimeFormat` in the page language; times left-to-right. On phones the row stacks: details, then the week strip, then the actions.

## Known limitations

One working block per day (no split shifts). On phones the hours are shortened (`8–16`) so each day stays on one line.
