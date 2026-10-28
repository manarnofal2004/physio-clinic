# Reservations

Visitors book a time without logging in; logged-in patients can book too and see their own reservations. Staff accept or reject each request, assign a therapist, and can move it to another time.

## Booking rules

The server checks these on every create and every change.

1. **Days:** Sunday to Thursday, from today up to 30 days ahead. Friday and Saturday are closed.
2. **Times:** a slot every 15 minutes from 08:00 to 19:00, clinic time.
3. **A slot is free when** it is in the future and at least one active therapist works at that time and has no **accepted** reservation within 45 minutes of it.
4. **Pending reservations do not block slots.** Only accepting does.
5. **Taken slots are hidden**, not shown as disabled.
6. **Spam limits:** one phone number can have at most 2 pending reservations (`PENDING_LIMIT_REACHED`), and booking is rate limited per IP (`TOO_MANY_REQUESTS`).

## A reservation

```json
{
  "id": "6730e1...",
  "userId": null,
  "therapistId": null,
  "fullName": "Sara Odeh",
  "phone": "0597001122",
  "age": 28,
  "scheduledAt": "2026-11-02T08:00:00.000Z",
  "status": "pending",
  "notes": "Knee pain after running",
  "adminNotes": null,
  "reviewedAt": null,
  "previousScheduledAt": null,
  "rescheduledAt": null,
  "createdAt": "2026-10-28T12:00:00.000Z",
  "updatedAt": "2026-10-28T12:00:00.000Z"
}
```

- `userId` is `null` for guests.
- `therapistId` is set by staff when accepting.
- `status`: `pending` → `accepted` / `rejected`, or `cancelled`.

## Public endpoints (no login)

| Method | Path                                | Send               | Returns             |
| ------ | ----------------------------------- | ------------------ | ------------------- |
| GET    | `/public/reservations/date-options` |                    | Bookable days       |
| GET    | `/public/reservations/availability` | `?date=YYYY-MM-DD` | Free times that day |
| GET    | `/public/reservations/today`        |                    | Today's overview    |
| POST   | `/public/reservations`              | `ReservationInput` | `Reservation` (201) |

### The booking form flow

**1. Which days can I pick?**

```
GET /api/public/reservations/date-options
→ { "success": true, "data": ["2026-11-01", "2026-11-02", "2026-11-03"] }
```

**2. Which times are free on that day?**

```
GET /api/public/reservations/availability?date=2026-11-02
→ { "success": true, "data": { "date": "2026-11-02", "slots": ["08:00", "08:15", "09:30"] } }
```

**3. Book**

```
POST /api/public/reservations
{
  "fullName": "Sara Odeh",
  "phone": "0597001122",
  "age": 28,
  "scheduledAt": "2026-11-02T08:00:00.000Z",
  "notes": "Knee pain after running"
}
```

| Field         | Rules                         |
| ------------- | ----------------------------- |
| `fullName`    | Required, 2-120 chars         |
| `phone`       | Required, 6-30 chars          |
| `age`         | Required, 0-120               |
| `scheduledAt` | Required, must be a free slot |
| `notes`       | Optional, max 2000            |

Returns the reservation with `status: "pending"`. If the slot was taken in the meantime: `SLOT_UNAVAILABLE`. If a valid token is sent, the reservation is linked to that user.

### Today's overview (landing page)

```
GET /api/public/reservations/today
```

```json
{
  "success": true,
  "data": {
    "date": "2026-11-02",
    "now": "2026-11-02T08:20:00.000Z",
    "runningNow": 2,
    "sessions": [
      {
        "startsAt": "2026-11-02T06:00:00.000Z",
        "endsAt": "2026-11-02T06:45:00.000Z",
        "state": "done"
      },
      {
        "startsAt": "2026-11-02T08:00:00.000Z",
        "endsAt": "2026-11-02T08:45:00.000Z",
        "state": "running"
      }
    ],
    "availableSlotsLeft": 14
  }
}
```

Shows the sessions running right now. Never includes names or phone numbers.

## Logged-in endpoints

| Method | Path                        | Who               | Send                        | Returns                 |
| ------ | --------------------------- | ----------------- | --------------------------- | ----------------------- |
| GET    | `/reservations`             | Patient, Staff    | list params + filters below | `Reservation[]` (paged) |
| GET    | `/reservations/reschedules` | Staff (TENTATIVE) | `?date=YYYY-MM-DD`          | `RescheduleNews[]`      |
| GET    | `/reservations/:id`         | Owner, Staff      |                             | `Reservation`           |
| POST   | `/reservations`             | Patient           | `ReservationInput`          | `Reservation` (201)     |
| PUT    | `/reservations/:id`         | Staff             | `ReservationUpdate`         | `Reservation`           |

- A patient only sees their own reservations. Another patient's id returns `FORBIDDEN`.
- Filters: `status`, `therapistId`, `from`, `to`. Sort by `scheduledAt`, `createdAt` or `status`.

### Staff: accept, reject or reschedule

```
PUT /api/reservations/6730e1...
{ "status": "accepted", "therapistId": "6730b1...", "adminNotes": "First visit" }
```

- Changing `status` sets `reviewedAt`.
- Accepting needs a `therapistId` who is free then (get the list from `GET /therapists/free`), otherwise `SLOT_UNAVAILABLE`.
- Changing `scheduledAt` reschedules: the same booking rules apply, and the old time is saved in `previousScheduledAt` with `rescheduledAt` set to now.

### Rescheduling news

```
GET /api/reservations/reschedules?date=2026-11-02
→ [{ "reservationId": "6730e1...", "previousScheduledAt": "...", "scheduledAt": "...", "rescheduledAt": "..." }]
```

Reservations moved on that day, for the "rescheduling news" component.
