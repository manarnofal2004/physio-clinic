# Decisions and open questions

What the supervisor decided (written answers on 2026-10-27, Zoom on 2026-10-28) and how the contract applies it.

## Decided

| Decision                                                                                                         | Where in the contract                                           |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Roles: visitor (no account), patient, therapist, admin                                                           | [README](README.md#who-can-call-what)                           |
| Nobody signs up; the admin creates every account (therapists and patients)                                       | [users.md](users.md)                                            |
| The admin gives each therapist privileges (view or edit, per area) and a patient scope (all or chosen patients)  | [users.md](users.md#privileges)                                 |
| Patients are never deleted: status `active` / `completed`                                                        | [patients.md](patients.md)                                      |
| The admin can hide patients from everyone else (soft delete)                                                     | [patients.md](patients.md#hide-a-patient-admin-only)            |
| Several therapists, each with their own working hours; several rooms                                             | [therapists.md](therapists.md)                                  |
| A therapist is busy 45 minutes from a session's start; a time is free if any therapist is free                   | [reservations.md](reservations.md#booking-rules)                |
| Only accepted reservations block time; taken times are hidden from the booking form                              | [reservations.md](reservations.md#booking-rules)                |
| Therapists take reservations themselves (with the privilege); the admin can do everything; patients never choose | [reservations.md](reservations.md#therapist-take-a-reservation) |
| Guests are stored; at most 2 pending reservations per phone, plus rate limiting                                  | [reservations.md](reservations.md#booking-rules)                |
| Files stored in MongoDB GridFS                                                                                   | [reports.md](reports.md)                                        |
| Banners: clinic announcements and schedule updates                                                               | [banners.md](banners.md)                                        |
| Landing page shows the sessions running now                                                                      | [reservations.md](reservations.md#todays-overview-landing-page) |
| Rescheduling news component                                                                                      | [reservations.md](reservations.md#rescheduling-news)            |

## Still open

Until answered, the contract uses the assumption in brackets.

1. **Rescheduling news:** staff only, or also visitors? Should the patient be told? _(Staff only, no notification.)_
2. **Patient status:** are `active` and `completed` enough? _(Yes.)_
3. **The 15-minute margin:** the supervisor said it may be adjustable. Per therapist, or clinic-wide? _(Fixed: slots every 15 minutes, therapists busy 45 minutes.)_
4. **Deployment:** where will the project run?
