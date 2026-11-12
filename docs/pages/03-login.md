# 3. Login

| | |
| - | - |
| Route | `/login` |
| Access | Public; logged-in users are sent to their home page |
| Built by | Bayan: form, validation, session handling (tasks 2.5, 2.6). Manar: page design. |

## Purpose

Staff and patients with accounts created by the clinic sign in. Visitors who only want to book are pointed to the booking form.

## Files

| File | Role | By |
| ---- | ---- | -- |
| `features/auth/LoginPage.tsx` | Form logic (Bayan); "open door" layout (Manar) | Both |
| `features/auth/loginSchema.ts` | Zod: valid email, password required | Bayan |
| `features/auth/AuthProvider.tsx` | `login`, `logout`, current user, session restore | Bayan |
| `features/auth/api.ts` | `POST /auth/login`, `GET /auth/me` | Bayan |
| `features/auth/homePath.ts` | Where each role lands: admin `/admin`, therapist `/therapist`, patient `/` | Bayan |
| `lib/authToken.ts` | Token in `localStorage` | Bayan |

## Flow

1. Submit runs the Zod schema; field errors show under the fields.
2. `login(email, password)` posts to `/auth/login`, stores the JWT (valid 1 day) and puts the user in the React Query cache (`["auth","me"]`).
3. The page re-renders with a user and redirects to where the user was going (saved by `RequireAuth`) or to their home.
4. On page refresh `AuthProvider` reads the token and calls `/auth/me` to restore the session.
5. Any later `UNAUTHORIZED` response logs the user out (token expired or account turned off).

## Errors

`INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`, `TOO_MANY_REQUESTS`, `NETWORK_ERROR` and others map to translated messages in an alert above the form.

## Design

- A full-screen photo of the clinic's open door (made for a 16:9 screen; mirrored in Arabic so the door stays clear of the form).
- The form sits on a torn-paper sheet with the logo, a handwritten "Welcome back", the italic title and a link to booking.
- `object-position` keeps the door's arch whole on short wide screens; tighter spacing below 700 px height.

## Languages, responsive, accessibility

Email input is left-to-right; dark mode uses the dark paper; on phones the photo is a background behind the full-width form. Labels on every field, errors linked to fields, focus outlines.
