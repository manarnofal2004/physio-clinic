# Therapists

The clinic has several physiotherapists, each with their own working hours. Patients never choose a therapist: therapists take reservations themselves, or the admin assigns one. Therapists are **not deleted**: set `isActive: false` to stop giving them new sessions.

A therapist profile is not a login. To let a therapist log in, the admin creates an account linked to the profile ([users.md](users.md#create-an-account)).

| Method | Path                    | Needs                 | Send                                   | Returns               |
| ------ | ----------------------- | --------------------- | -------------------------------------- | --------------------- |
| GET    | `/therapists`           | `reservations.view`   | list params + `isActive?`              | `Therapist[]` (paged) |
| GET    | `/therapists/free`      | `reservations.manage` | `scheduledAt`, `excludeReservationId?` | `Therapist[]`         |
| POST   | `/therapists`           | Admin                 | `TherapistInput`                       | `Therapist` (201)     |
| GET    | `/therapists/:id`       | `reservations.view`   |                                        | `Therapist`           |
| PUT    | `/therapists/:id`       | Admin                 | `TherapistInput`                       | `Therapist`           |
| GET    | `/therapists/:id/photo` | Logged in             |                                        | The image             |
| PUT    | `/therapists/:id/photo` | Admin                 | `multipart/form-data`, field `photo`   | `Therapist`           |
| DELETE | `/therapists/:id/photo` | Admin                 |                                        | `Therapist`           |

## A therapist

```json
{
  "id": "6730b1...",
  "fullName": "Dr. Lina Khalil",
  "phone": "0598765432",
  "specialty": "Sports injuries",
  "isActive": true,
  "hasAccount": true,
  "photoId": "6731d2...",
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

## Photo

Each therapist can have one photo, shown next to their name on staff pages. It is stored in its own GridFS bucket (`photos`).

- `photoId` is `null` until the admin adds a photo. A new photo gets a new `photoId`, so a client can cache the image per `photoId`.
- **Get:** `GET /api/therapists/:id/photo` returns the image itself (`Content-Type` of the image, `Cache-Control: private, max-age=86400`). Any logged-in user may get it. It needs the `Authorization` header like every call, so fetch it as a blob (see [README](README.md#downloads)). No photo: `NOT_FOUND`.
- **Add or replace:** `PUT /api/therapists/:id/photo` with `multipart/form-data` and one file in the field `photo`. JPEG, PNG or WebP, at most 2 MB. The content must match the type (a renamed file is refused). The old photo is deleted after the new one is saved. Returns the updated `Therapist`.
- **Remove:** `DELETE /api/therapists/:id/photo` returns the updated `Therapist` with `photoId: null`.
- Errors: `FILE_TOO_LARGE` (over 2 MB), `UNSUPPORTED_FILE_TYPE` (another type, or content that does not match), `NOT_FOUND` (no such therapist), `FORBIDDEN` (not the admin, for `PUT` and `DELETE`).

## List

Searches `fullName` and `specialty`. Sort by `fullName` or `createdAt`.
