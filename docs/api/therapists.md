# Therapists

The clinic has several physiotherapists, each with their own working hours. Patients never choose a therapist: therapists take reservations themselves, or the admin assigns one. Therapists are **not deleted**: set `isActive: false` to stop giving them new sessions.

A therapist profile is not a login. To let a therapist log in, the admin creates an account linked to the profile ([users.md](users.md#create-an-account)).

| Method | Path               | Needs                 | Send                                   | Returns               |
| ------ | ------------------ | --------------------- | -------------------------------------- | --------------------- |
| GET    | `/therapists`      | `reservations.view`   | list params + `isActive?`              | `Therapist[]` (paged) |
| GET    | `/therapists/free` | `reservations.manage` | `scheduledAt`, `excludeReservationId?` | `Therapist[]`         |
| POST   | `/therapists`      | Admin                 | `TherapistInput`                       | `Therapist` (201)     |
| GET    | `/therapists/:id`  | `reservations.view`   |                                        | `Therapist`           |
| PUT    | `/therapists/:id`  | Admin                 | `TherapistInput`                       | `Therapist`           |

## A therapist

```json
{
  "id": "6730b1...",
  "fullName": "Dr. Lina Khalil",
  "phone": "0598765432",
  "specialty": "Sports injuries",
  "isActive": true,
  "hasAccount": true,
  "schedule": [
    { "day": 0, "start": "08:00", "end": "14:00" },
    { "day": 2, "start": "12:00", "end": "19:00" }
  ],
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

| Field       | Rules                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `fullName`  | Required, 2-120 chars                                                                                                             |
| `phone`     | Optional, 6-30 chars                                                                                                              |
| `specialty` | Optional, max 120                                                                                                                 |
| `isActive`  | Optional, default `true`                                                                                                          |
| `schedule`  | Required. `day` `0` (Sunday) to `4` (Thursday); `start` and `end` in clinic time between `08:00` and `19:00`, `end` after `start` |

## Who is free at a given time

```
GET /api/therapists/free?scheduledAt=2026-11-02T06:00:00.000Z
```

Returns active therapists whose working hours cover the whole 45-minute session and who are not busy: a therapist is busy for **45 minutes** from the start of each accepted session, and sessions cannot overlap. The admin uses it to fill the therapist select when assigning or rescheduling. When rescheduling, pass `excludeReservationId` so the reservation does not block itself.

## List

Searches `fullName` and `specialty`. Sort by `fullName` or `createdAt`.
