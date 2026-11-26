# 10. Dashboard

|          |                                                               |
| -------- | ------------------------------------------------------------- |
| Route    | `/admin` (admin), `/therapist/dashboard` (therapist)          |
| Access   | Admins always; therapists need the privilege `dashboard.view` |
| Built by | Manar (tasks 7.3 to 7.7)                                      |

## Purpose

The first page staff see after logging in (requirement FR-7): the main numbers, reports over time, how patients are doing, the newest patients, the most common conditions, quick actions, and the clinic's calendar with each day's sessions.

## Layout

```
Greeting and date                         [Write a report] [Add a patient] [Visit the website]
┌ Patients ┐┌ Reports ~~ ┐┌ Waiting ┐┌ On duty (photos) ┐   ┌ Calendar (dots on days ┐
└──────────┘└────────────┘└─────────┘└──────────────────┘   │ with sessions)         │
┌ Reports over time  [6|12] ┐┌ How patients are doing ┐     ├ Sessions on the chosen │
│ area curve               ││ ring + rows             │     │ day, with therapist    │
└──────────────────────────┘└─────────────────────────┘     └────────────────────────┘
┌ Recently added patients ──┐┌ Most common conditions ┐
```

On a 1366×768 laptop the cards, both charts and the calendar fit the first screen. The sidebar can shrink to icons to give the page more room. On phones everything stacks, with the number cards two by two.

## Files

| File                                      | Role                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `features/dashboard/DashboardPage.tsx`    | Page: greeting, quick actions, loading/error, layout, privileges              |
| `features/dashboard/api.ts`               | `useDashboardStats` (7.3), `useMonthSessions` for the calendar                |
| `features/dashboard/StatCards.tsx`        | Four number cards; sparkline on reports; on-duty count with photos            |
| `features/dashboard/ReportsTrend.tsx`     | `LineChart` area curve and the 6/12 months toggle                             |
| `features/dashboard/ProgressDonut.tsx`    | `PieChart` ring with the improving share in the middle, and a row per state   |
| `features/dashboard/ScheduleRail.tsx`     | `DateCalendar` with dots on days with sessions, and the chosen day's sessions |
| `features/dashboard/RecentPatients.tsx`   | Five newest patients with condition and last visit                            |
| `features/dashboard/ConditionsChart.tsx`  | Horizontal bars, top 10 conditions                                            |
| `features/dashboard/Panel.tsx`            | The white card each block sits on, with a place for a control                 |
| `features/dashboard/format.ts`            | Month names, the clinic's clock and day, screen-reader-only style             |
| `features/therapists/TherapistAvatar.tsx` | A physiotherapist's photo or initials                                         |

## Data and API

| Call                                              | React Query key                      | Notes                                                                                                               |
| ------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `GET /dashboard/stats`                            | `["dashboard","stats"]`              | All numbers and chart data (`DashboardStats`)                                                                       |
| `GET /therapists?limit=100`                       | `["therapists","admin"]`             | For "on duty now" and the session list; only with `reservations.view`                                               |
| `GET /reservations?from&to&status&page&limit=100` | `["reservations","month","YYYY-MM"]` | The calendar month: waiting and confirmed asked for separately, page by page, so nothing is cut off in a busy month |
| `GET /therapists/:id/photo?v=photoId`             | `["therapists","photo",id,photoId]`  | Photo as a blob (it needs the login); a new photo has a new id                                                      |

The server counts only the patients in the user's scope. Writing, editing or deleting a report refreshes the dashboard, and the numbers and the calendar refresh every minute, so a dashboard left open all day stays right.

## How it works

- **Greeting** by the clinic's hour (Asia/Hebron), not the computer's.
- **Quick actions** follow privileges: "Write a report" (`reports.edit`) opens the reports form here and then the new report; "Add a patient" (`patients.edit`) goes to the patients page; "Visit the website" opens the public site in a new tab.
- **Cards:** patients (and how many are still in treatment), reports (with a 12-month sparkline and this month's count), waiting booking requests (link to reservations), physiotherapists on duty right now, worked out from their weekly hours and the clinic's clock, with their photos.
- **Charts use MUI X Charts** (`@mui/x-charts`): a `LineChart` with a fading olive fill and a `monotoneX` curve that never overshoots the real numbers; a `PieChart` ring with gaps between slices. Every chart has tooltips and its own keyboard access; the curve also has a hidden data table.
- **Colour is never the only clue:** a palette check showed red and honey look alike to many colour-blind readers, so each progress state has its own row with an arrow icon, its name, count and share.
- **Calendar** (`DateCalendar` from MUI X): Fridays and Saturdays are disabled; days with sessions have a honey dot; choosing a day lists its sessions with time (clinic time), patient, physiotherapist (photo and name) and a "Waiting" or "Confirmed" label. On wide screens it stays in view while the page scrolls.
- **Recent patients:** each name opens the patient's page (for users with `patients.view`).
- **Physiotherapist photos:** the admin adds them on the physiotherapists page (JPEG, PNG or WebP up to 2 MB); the server keeps them in their own GridFS bucket.

## States

| State       | Shown                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Loading     | Spinner (the calendar has its own)                                                                          |
| Server down | "We couldn't load the dashboard." with Try again; the calendar has its own "We couldn't load the sessions." |
| No data     | Each block shows its own sentence; numbers show 0; a day without sessions says so                           |

## Languages, responsive, accessibility

- Texts in `en.ts` / `ar.ts` under `dashboard.*`; Arabic month names with Latin digits; the time axis runs left to right in both languages, and in Arabic every other month is labelled over a year so the long names never overlap.
- `axe` finds no serious issues in English, Arabic, light and dark mode.

## Known limitations

- Clicking a session in the calendar does nothing yet; it will open the reservation once the reservations page is built.
