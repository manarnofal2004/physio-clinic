# 11. Patients

|          |                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------- |
| Route    | `/admin/patients`, `/admin/patients/:id`, `/therapist/patients`, `/therapist/patients/:id`     |
| Access   | `patients.view`; adding, editing and status need `patients.edit`; hiding is for the admin only |
| Built by | Bayan (tasks 3.6 to 3.10)                                                                      |

## Purpose

The clinic's patient records: find a patient, add or edit one, mark treatment as completed, and export the list. Nobody is deleted: when treatment ends the patient is marked as completed, and the admin can hide a record so only the admin sees it.

## Files

| File                                       | Role                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `features/patients/PatientsPage.tsx`       | List: search, status filter, hidden switch (admin), table, CSV export |
| `features/patients/PatientDetailsPage.tsx` | One patient: profile, status and hide buttons, reports section        |
| `features/patients/PatientDialog.tsx`      | Add or edit a patient                                                 |
| `features/patients/patientSchema.ts`       | Zod rules (same as the server), form values to API input              |
| `features/patients/api.ts`                 | Queries, mutations and the CSV download                               |

## Data and API

| Call                                                     | Notes                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET /patients?page&limit&sort&search&status&hidden`     | One page; `keepPreviousData` so the table does not jump                                  |
| `GET /patients/:id`                                      | A patient outside the user's scope answers `NOT_FOUND`                                   |
| `POST /patients`, `PUT /patients/:id`                    | Add, edit                                                                                |
| `PATCH /patients/:id/status`, `PATCH /patients/:id/hide` | `{ status }` (active / completed), `{ isHidden }` (admin)                                |
| `GET /patients/export?…same filters`                     | CSV as a blob with the token; phones keep their leading 0 in Excel, dates are plain days |

Every change refreshes the patients, the reports and the dashboard, because a hidden patient disappears from all three.

## How it works

- **Table** (`DataTable`): name, phone (left-to-right), age, condition, status chip, last visit, and an edit button; sortable by name, age and last visit; clicking a row opens the patient.
- **Filters:** search on name, phone and condition (350 ms after typing stops), status, and for the admin a "Hidden patients" switch. Any filter change goes back to page 1.
- **Form:** full name, phone (digits, `+`, spaces and dashes), age, gender, condition, address and notes. Clearing address or notes clears them in the record too.
- **Details page:** status, "hidden" and "has an account" chips; Edit, "Mark as completed" / "Back in treatment", and for the admin Hide (asks first) or Show again.
- Patient names on the dashboard and on report pages link here.

## States, languages, responsive

Loading, error with retry, "no patients yet" or "no match" (only after a search or filter), notifications after each change. Arrow icons flip in Arabic. On phones the filters stack and the dialog fills the screen.

## Known limitations

- The reports section on the details page still says the reports are coming; it can list them with `GET /reports?patientId=…`.
