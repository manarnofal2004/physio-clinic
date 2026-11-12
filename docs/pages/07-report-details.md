# 7. Report details

| | |
| - | - |
| Route | `/admin/reports/:id`, `/therapist/reports/:id` |
| Access | `reports.view`; edit and delete need `reports.edit` |
| Built by | Manar (task 4.11) |

## Purpose

Read one treatment session's report and open its files; edit or delete it.

## Files

`features/reports/ReportDetailsPage.tsx`, reusing `ReportDialog`, `AttachmentThumb` (from `FileUploader.tsx`), `ProgressChip` and `ConfirmDialog`.

## Data and API

| Call | Notes |
| ---- | ----- |
| `GET /reports/:id` | `useReport(id)`; a report outside the user's scope returns `NOT_FOUND` |
| `GET /therapists` | To show the physiotherapist's name |
| `GET /uploads/:id` | Thumbnails and opening files |
| `PUT /reports/:id`, `DELETE /reports/:id` | Edit and delete (deleting also deletes the files on the server) |

## How it works

- Header: patient name, date, physiotherapist, progress; Edit and Delete buttons for users who may write reports.
- Body: diagnosis, treatment plan and notes, keeping the line breaks they were written with.
- Files: image thumbnails (fetched with the token) and a PDF icon; clicking opens the file in a new tab. The tab is opened at the click and filled when the file arrives, so browsers do not block it.
- The back link returns to the list it came from (`/admin/reports` or `/therapist/reports`), worked out from the current URL.

## States, languages, responsive

Loading; "This report could not be found" with a way back; delete asks first and shows a notification. Arrow icons flip in Arabic. On phones the header stacks above the buttons.
