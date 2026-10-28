# Therapists

The clinic has several physiotherapists, each with their own working hours. Patients do not choose a therapist; staff assign one when they accept a reservation. Therapists are **not deleted**: set `isActive: false` to stop giving them new sessions.

| Method | Path               | Who   | Send                                   | Returns               |
| ------ | ------------------ | ----- | -------------------------------------- | --------------------- |
| GET    | `/therapists`      | Staff | list params + `isActive?`              | `Therapist[]` (paged) |
| GET    | `/therapists/free` | Staff | `scheduledAt`, `excludeReservationId?` | `Therapist[]`         |
| POST   | `/therapists`      | Admin | `TherapistInput`                       | `Therapist` (201)     |
| GET    | `/therapists/:id`  | Staff |                                        | `Therapist`           |
| PUT    | `/therapists/:id`  | Admin | `TherapistInput`                       | `Therapist`           |

## A therapist

```json
{
  "id": "6730b1...",
  "fullName": "Dr. Lina Khalil",
  "phone": "0598765432",
  "specialty": "Sports injuries",
  "isActive": true,
  "schedule": [
    { "day": 0, "start": "08:00", "end": "14:00" },
    { "day": 2, "start": "12:00", "end": "19:00" }
  ],
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

- `day`: `0` = Sunday ... `4` = Thursday. The clinic is closed Friday and Saturday.
- `start` and `end` are clinic time, between `08:00` and `19:00`, and `end` is after `start`.

## Who is free at a given time

```
GET /api/therapists/free?scheduledAt=2026-11-02T08:00:00.000Z
```

Returns active therapists who work at that time and have no **accepted** reservation within 45 minutes of it. Staff use it to fill the therapist select when accepting or rescheduling. When rescheduling, pass `excludeReservationId` so the reservation does not block itself.

## List

Searches `fullName` and `specialty`. Sort by `fullName` or `createdAt`.
