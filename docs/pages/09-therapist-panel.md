# 9. Therapist panel

| | |
| - | - |
| Route | `/therapist` and its pages |
| Access | Role `therapist`; each page needs its privilege |
| Built by | Bayan (task 2.6). Manar connected the reports and banners pages to it and restyled the shared panel layout. |

## Purpose

The physiotherapist's workspace. The menu shows only the pages the admin allowed through privileges.

## Files

| File | Role | By |
| ---- | ---- | -- |
| `features/therapist/TherapistLayout.tsx` | Filters `therapistNavItems` by the user's privileges and renders `PanelLayout` | Bayan |
| `features/therapist/therapistNavItems.tsx` | Home, dashboard, patients, reports, reservations, banners, each with its privilege | Bayan |
| `features/therapist/TherapistHomePage.tsx` | Welcome message with the therapist's name | Bayan |
| `features/therapist/PageNotReady.tsx` | Placeholder for pages not built yet | Bayan |
| `components/layout/PanelLayout.tsx` | Shared admin/therapist shell | Bayan (structure), Manar (design) |
| `app/AppRouter.tsx` | Maps built pages (`/therapist/reports`, `/therapist/banners`) and placeholders | Bayan / Manar |

## How it works

- **Guards:** the branch is wrapped in `RequireAuth roles={["therapist"]}`, and every page in its own `RequireAuth privilege=…`, so typing a URL cannot get around the menu (missing privilege → `ForbiddenPage`).
- **Panel layout:** deep olive sidebar (190 px) with the logo; the current page is a beige tab joined to the page sheet with curved corners (pseudo-elements with box-shadow curves); the page sits on a rounded beige sheet; the top bar has language, dark mode and the account menu. On phones the sidebar becomes a temporary drawer.
- **Built pages:** reports list and details ([reports 6](06-reports-list.md), [7](07-report-details.md)) and banners ([report 8](08-admin-banners.md)) work here with the same components as the admin, limited by the server to the therapist's scope.

## Not built yet

Dashboard, patients and reservations pages show "This page is not ready yet".
