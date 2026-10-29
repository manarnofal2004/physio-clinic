# Reports and uploads

A report records one treatment session for a patient: diagnosis, plan, notes, progress and attached files (images or PDFs).

| Method | Path              | Needs          | Send                                 | Returns              |
| ------ | ----------------- | -------------- | ------------------------------------ | -------------------- |
| GET    | `/reports`        | `reports.view` | list params + filters below          | `Report[]` (paged)   |
| GET    | `/reports/export` | `reports.view` | same params as the list              | CSV file             |
| POST   | `/reports`        | `reports.edit` | `ReportInput`                        | `Report` (201)       |
| GET    | `/reports/:id`    | `reports.view` |                                      | `Report`             |
| PUT    | `/reports/:id`    | `reports.edit` | `ReportInput`                        | `Report`             |
| DELETE | `/reports/:id`    | `reports.edit` |                                      | `null`               |
| POST   | `/uploads`        | `reports.edit` | `multipart/form-data`, field `files` | `Attachment[]` (201) |
| GET    | `/uploads/:id`    | `reports.view` |                                      | The file itself      |

Only reports of patients in the user's [patient scope](users.md#patient-scope) are visible; others return `NOT_FOUND`.

## A report

```json
{
  "id": "6730c1...",
  "patient": { "id": "6730a1...", "fullName": "Ahmad Saleh" },
  "therapistId": "6730b1...",
  "date": "2026-10-20T09:00:00.000Z",
  "diagnosis": "Muscle strain, L4-L5",
  "treatmentPlan": "Heat therapy and core exercises, 2 sessions a week",
  "sessionNotes": "Pain reduced from 7/10 to 5/10",
  "progress": "improving",
  "attachments": [
    {
      "id": "6730d1...",
      "filename": "x-ray.png",
      "mimeType": "image/png",
      "size": 284311,
      "uploadedAt": "2026-10-20T08:55:00.000Z"
    }
  ],
  "createdAt": "2026-10-20T09:05:00.000Z",
  "updatedAt": "2026-10-20T09:05:00.000Z"
}
```

## Saving a report with files: 2 steps

**1. Upload the files**

```
POST /api/uploads   (multipart/form-data, field "files", 1 to 5 files)
```

- JPEG, PNG, WebP or PDF only, max 5 MB each.
- Files are stored in MongoDB GridFS.
- Returns the `Attachment` objects; keep their `id`s.

**2. Save the report with those ids**

```
POST /api/reports
{
  "patientId": "6730a1...",
  "therapistId": "6730b1...",
  "date": "2026-10-20T09:00:00.000Z",
  "diagnosis": "Muscle strain, L4-L5",
  "treatmentPlan": "Heat therapy and core exercises",
  "progress": "improving",
  "attachmentIds": ["6730d1..."]
}
```

| Field           | Rules                                              |
| --------------- | -------------------------------------------------- |
| `patientId`     | Required, must exist and be in scope (`NOT_FOUND`) |
| `therapistId`   | Optional; defaults to the logged-in therapist      |
| `date`          | Required                                           |
| `diagnosis`     | Required, 2-2000 chars                             |
| `treatmentPlan` | Required, 2-2000 chars                             |
| `sessionNotes`  | Optional, max 5000                                 |
| `progress`      | `improving`, `stable` or `worse`                   |
| `attachmentIds` | Optional, max 5                                    |

On `PUT`, `attachmentIds` is the full new list: files left out are deleted. Uploaded files not attached to any report within 24 hours are deleted.

## What happens automatically

- Creating, editing or deleting a report updates the patient's `lastVisit` to the date of their latest report.
- Deleting a report deletes its files.

## List, filter and sort

```
GET /api/reports?patientId=6730a1...&progress=improving&from=2026-10-01&to=2026-10-31
```

- Filters: `patientId`, `progress`, `from`, `to` (days, `YYYY-MM-DD`).
- Searches `diagnosis`, `treatmentPlan` and the patient's name.
- Sort by `date`, `progress` or `createdAt`.
- The CSV export includes the patient's name.
