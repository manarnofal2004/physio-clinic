# Patient portal (`/me`)

A logged-in patient's own information: their patient record, their treatment reports and the files attached to them. Read only. Patients cannot see anyone else's data, and if the admin hides the patient they see nothing.

| Method | Path              | Who     | Send        | Returns            |
| ------ | ----------------- | ------- | ----------- | ------------------ |
| GET    | `/me/patient`     | Patient |             | `Patient`          |
| GET    | `/me/reports`     | Patient | list params | `Report[]` (paged) |
| GET    | `/me/reports/:id` | Patient |             | `Report`           |
| GET    | `/me/files/:id`   | Patient |             | The file itself    |

Their reservations are at `GET /reservations` ([reservations.md](reservations.md#logged-in-endpoints)).

## My record

`GET /api/me/patient` returns the same `Patient` object staff see ([patients.md](patients.md#a-patient)). Returns `NOT_FOUND` if the account has no patient record or the patient is hidden.

## My reports

```
GET /api/me/reports?page=1&limit=10&sort=-date
```

Same `Report` objects as [reports.md](reports.md#a-report), newest first by default. Sort by `date` or `createdAt`. Another patient's report id returns `NOT_FOUND`.

## My files

`GET /api/me/files/:id` downloads a file attached to one of the patient's reports (use `attachments[].id` from a report). Fetch it with the token and show it as a blob ([Downloads](README.md#downloads)). Any other file returns `NOT_FOUND`.
