# 6. Medical reports list

| | |
| - | - |
| Route | `/admin/reports`, `/therapist/reports` |
| Access | Privilege `reports.view` (admins always); writing needs `reports.edit` |
| Built by | Manar (tasks 4.8, 4.9, 4.10, 4.13) |

## Purpose

Find a patient's treatment reports, filter them, export them, and write new ones. Physiotherapists see only reports of patients in their scope (enforced by the server).

## Files

| File | Role |
| ---- | ---- |
| `features/reports/ReportsPage.tsx` | List, filters, export, "write a report" |
| `features/reports/ReportDialog.tsx` | Create / edit form (4.10) |
| `features/reports/FileUploader.tsx` | Drag-and-drop uploader and thumbnails (4.13) |
| `features/reports/ProgressChip.tsx` | Improving / stable / worse marker |
| `features/reports/api.ts` | Queries, mutations, upload, file and CSV download (4.8) |
| `features/reports/format.ts` | Report date format |

## Data and API

| Call | Notes |
| ---- | ----- |
| `GET /reports?page&limit&sort=-date&search&progress&from&to&patientId` | Newest first, server-side paging |
| `GET /reports/export?…same filters` | CSV fetched as a blob with the token, saved as `reports-YYYY-MM-DD.csv` |
| `POST /uploads` (multipart, field `files`) | Returns `Attachment[]`; files are stored in MongoDB GridFS |
| `GET /uploads/:id` | Blob → object URL for thumbnails |
| `POST /reports` / `PUT /reports/:id` | `ReportInput` with `attachmentIds`; on PUT the list replaces the old one |

After saving, the reports and patients queries refresh (a report updates the patient's last visit).

## How it works

- **Table:** date, patient, diagnosis (two lines max), progress, number of files; a row opens the report.
- **Filters:** search (debounced) on patient, diagnosis and plan; progress; from / to dates. Export uses the same filters.
- **Write a report:** patient (searchable), date (not in the future), physiotherapist (admin only; a therapist's report is theirs by default), diagnosis, plan, notes, progress, files. After saving, the new report opens.
- **Uploader:** drop files or click to choose; each is uploaded at once and listed with a preview, its size and a remove button. Client checks match the server: up to 5 files, JPEG/PNG/WebP/PDF, 5 MB each.
- Dates are sent at midday local time so the calendar day never shifts with the time zone.

## Validation and errors

Patient required; diagnosis and plan 2–2000; notes ≤ 5000; upload errors (too many, wrong type, too big, failed) under the uploader; save failures in an alert.

## States, languages, responsive

Loading spinner in the table, error with retry, "no reports match". Without `reports.edit` the write button is hidden. On phones the filters stack.

Dates use the shared `DateInput` (`@mui/x-date-pickers` + dayjs): `DD/MM/YYYY` in both languages, an Arabic calendar with Latin digits, weeks starting on Sunday. On phones each table row becomes a stacked block (label and value per column).

## Known limitations

- Task 4.12 (reports inside the patient page) waits for the patients pages.
