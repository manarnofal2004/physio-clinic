# Page reports

One technical report per page of the Sanad web app: what the page does, who built it, how it is built, which API it uses, and how it handles states, languages and screen sizes.

| # | Page | Route | Built by |
| - | ---- | ----- | -------- |
| 1 | [Landing page](01-landing-page.md) | `/` | Manar |
| 2 | [Booking section](02-booking.md) | `/#booking` | Bayan (logic), Manar (design) |
| 3 | [Login](03-login.md) | `/login` | Bayan (logic), Manar (design) |
| 4 | [Users and privileges](04-admin-users.md) | `/admin/users` | Manar |
| 5 | [Physiotherapists](05-admin-therapists.md) | `/admin/therapists` | Manar |
| 6 | [Medical reports list](06-reports-list.md) | `/admin/reports`, `/therapist/reports` | Manar |
| 7 | [Report details](07-report-details.md) | `/admin/reports/:id`, `/therapist/reports/:id` | Manar |
| 8 | [Banners](08-admin-banners.md) | `/admin/banners`, `/therapist/banners` | Manar |
| 9 | [Therapist panel](09-therapist-panel.md) | `/therapist` | Bayan |

Not built yet (they show a "This page is not ready yet" message): admin dashboard, patients and reservations pages, and the patient portal pages.

## Stack

| Concern | Choice |
| ------- | ------ |
| UI | React 19 + TypeScript 6 (strict) + Vite 8 |
| Components | MUI 9 for every UI component, styled with `sx` and one shared theme |
| Routing | React Router 7 (`createBrowserRouter`) |
| Server data | TanStack React Query 5 + Axios |
| Forms | React Hook Form + Zod (booking, login); controlled state for admin dialogs |
| Languages | i18next with typed `en.ts` / `ar.ts`, right-to-left layout for Arabic (Emotion RTL plugin) |
| Icons | lucide-react |
| Fonts | Redaction (Latin), IBM Plex Sans Arabic (Arabic body), El Messiri (Arabic titles), Amiri (Arabic intros), Caveat / Aref Ruqaa (handwriting) |

## Shared architecture

### Folders

```
client/src/
├── app/            AppProviders (providers), AppRouter (routes)
├── components/     shared UI: layouts, data table, feedback states, form fields, notifications
├── features/       one folder per feature: landing, booking, auth, banners, users, therapists, reports, therapist
├── i18n/           i18next setup and the en / ar dictionaries
├── lib/            API client, API error type, auth token storage, env
└── theme/          colours, typography, component overrides, fonts, light/dark + direction
```

Each feature folder keeps its own `api.ts` (requests and React Query hooks) next to its pages and dialogs.

### Providers (`app/AppProviders.tsx`)

`QueryClientProvider` → `ColorModeProvider` (light/dark mode and text direction, saved in `localStorage`) → `NotificationProvider` (snackbar messages) → `AuthProvider` (current user).

### Routing (`app/AppRouter.tsx`)

| Branch | Layout | Guard |
| ------ | ------ | ----- |
| `/`, `/login` | `PublicLayout` (announcement bar, navbar, page, footer) | none |
| `/admin/*` | `PanelLayout` with the admin links | `RequireAuth roles={["admin"]}`; banners also `privilege="banners.manage"` |
| `/therapist/*` | `TherapistLayout` (PanelLayout with the links the user's privileges allow) | `RequireAuth roles={["therapist"]}`, and each page checks its own privilege |
| `*` | none | `NotFoundPage` |

`RequireAuth` (Bayan) waits for the session check, sends logged-out users to `/login` (remembering where they were going), sends the wrong role to its own home, and shows `ForbiddenPage` when a privilege is missing. The server checks every request again; the guard only decides what to show.

### Talking to the API (`lib/api/client.ts`)

- One Axios instance with `baseURL = VITE_API_BASE_URL`.
- A request interceptor adds `Authorization: Bearer <token>` (token in `localStorage`).
- A response interceptor turns every failure into an `ApiError { status, code, message, details }`; on code `UNAUTHORIZED` the user is logged out.
- Responses follow the contract in [`docs/api`](../api/README.md): `{ success, data, meta? }`.
- Files and CSV exports need the token, so they are fetched as blobs and opened through object URLs.

### Look and feel (`theme/theme.ts`)

- Palette "olive and stone": olive `#4f6a2a`, deep olive `#3a4f1e`, pale olive tint `#e3ead6`, beige `#f5eee3`, honey `#9a6b1f`; matching dark-mode values.
- Component overrides give tables, dialogs, inputs, toggle buttons, tooltips and alerts the clinic's look, so pages do not repeat styling.
- Page titles use the same italic Redaction / El Messiri face as the landing section titles.

### Languages and direction

- Every visible string comes from `i18n/locales/en.ts`; `ar.ts` has the same keys (TypeScript checks this).
- Switching language also flips the page direction; MUI and Emotion mirror margins and paddings. Phone numbers, emails and times are forced left-to-right.

### States every page handles

Loading (`LoadingState`), error with retry (`ErrorState`), empty (`EmptyState`), success and failure messages (`useNotify`), and confirmation before deleting (`ConfirmDialog`).

### Deployment

- Frontend: built with `VITE_API_BASE_URL=https://sanad-clinic-api.vercel.app/api`, published to Surge (`sanad-clinic.surge.sh`), with `200.html` so deep links work.
- Backend: Vercel serverless function (`server/api/index.js`), MongoDB Atlas.
