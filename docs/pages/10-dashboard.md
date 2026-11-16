# 10. Dashboard

| | |
| - | - |
| Route | `/admin` (admin), `/therapist/dashboard` (therapist) |
| Access | Admins always; therapists need the privilege `dashboard.view` |
| Built by | Manar (tasks 7.3 to 7.7) |

## Purpose

The first page staff see after logging in (requirement FR-7): the main numbers, how many reports are written each month, how patients are doing, the newest patients, the most common conditions, and quick actions.

## Files

| File | Role |
| ---- | ---- |
| `features/dashboard/DashboardPage.tsx` | Page: greeting, quick actions, loading/error, layout |
| `features/dashboard/api.ts` | `useDashboardStats` (7.3) |
| `features/dashboard/StatStrip.tsx` | Patients, reports and waiting booking requests on one sheet |
| `features/dashboard/ReportsOverTime.tsx` | Bar chart, reports per month for 12 months |
| `features/dashboard/ProgressOverview.tsx` | Share of reports improving / stable / worse |
| `features/dashboard/RecentPatients.tsx` | Five newest patients with condition and last visit |
| `features/dashboard/ConditionsChart.tsx` | Horizontal bars, top 10 conditions |
| `features/dashboard/Panel.tsx` | The white sheet each block sits on |
| `features/dashboard/format.ts` | Month names, round chart tops, the clinic's clock, screen-reader-only style |

## Data and API

| Call | React Query key | Notes |
| ---- | --------------- | ----- |
| `GET /dashboard/stats` | `["dashboard","stats"]` | One call returns everything (`DashboardStats` in `shared/api-types.ts`) |

The server counts only the patients in the user's scope, so a therapist limited to some patients sees only theirs; hidden patients count for the admin only. Writing, editing or deleting a report refreshes the dashboard (`useReportMutations` invalidates `["dashboard"]`).

## How it works

- **Greeting** by the clinic's hour (Asia/Hebron), not the computer's: good morning / afternoon / evening, and today's date.
- **Quick actions** depend on privileges: "Write a report" (`reports.edit`) opens the same `ReportDialog` as the reports page and then opens the new report; "Add a patient" (`patients.edit`) goes to the patients page; "Visit the website" opens the public site in a new tab.
- **Numbers:** total and active patients, total reports and this month's, waiting booking requests with a link to reservations (`reservations.view`).
- **Charts are drawn with MUI components** (no chart library), so they follow the theme, dark mode and right-to-left layout by themselves:
  - Reports over time: one olive bar per month on a scale rounded to 5/10/20/50…, only the latest month labelled, the value in a tooltip on hover (the whole column reacts, not only the thin bar), every other month name on phones.
  - Progress: a headline percentage of improving reports, then one row per state with an arrow icon, its name, count and percentage. The colours were checked with a palette validator: red and honey are too close for colour-blind readers, so each state has its own labelled row and never depends on colour alone.
  - Conditions: name, bar and count on every row; long names are cut with "…" and shown whole in the tooltip.
- Each chart has a table with the same numbers that only screen readers read.

## States

| State | Shown |
| ----- | ----- |
| Loading | Spinner |
| Server down | "We couldn't load the dashboard." with Try again |
| No data | Each block shows its own sentence (for example "No reports in the last 12 months", "No patients yet"); the numbers show 0 |

## Languages, responsive, accessibility

- All texts in `en.ts` / `ar.ts` under `dashboard.*`; months in the page language with Latin digits; charts mirror in Arabic.
- Two columns from 900 px; one column on phones, where the three numbers stack.
- `axe` finds no serious issues in light or dark mode; sections are landmarks named by their titles.

## Known limitations

- "Add a patient" leads to the patients page, which is not built yet.
- The recent patients list is not clickable until the patient details page exists.
