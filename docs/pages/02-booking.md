# 2. Booking section

| | |
| - | - |
| Route | `/#booking` (a section of the landing page) |
| Access | Public, no account needed |
| Built by | Bayan: API layer, validation, submit and error handling (tasks 5.6, 5.7, 6.10). Manar: day/time bubbles, appointment card, layout. |

## Purpose

Let a visitor request a 45-minute session at a free time. The clinic reviews the request and confirms by phone.

## Files

| File | Role | By |
| ---- | ---- | -- |
| `features/landing/BookingSection.tsx` | Section frame | Bayan / Manar |
| `features/booking/api.ts` | `fetchDateOptions`, `fetchAvailability`, `createReservation` | Bayan |
| `features/booking/hooks.ts` | `useDateOptions`, `useAvailability`, `useCreateReservation` (React Query) | Bayan |
| `features/booking/bookingSchema.ts` | Zod schema, same rules as the server, messages from `t()` | Bayan |
| `features/booking/BookingForm.tsx` | The form: validation, submit, error mapping (Bayan); bubbles and card layout (Manar) | Both |
| `features/booking/DayPicker.tsx`, `TimePicker.tsx`, `Bubble.tsx` | Days and times as bubbles | Manar |
| `features/booking/AppointmentCard.tsx` | Card that fills in while typing, stamp after sending | Manar |

## Data and API

| Call | When | React Query key |
| ---- | ---- | --------------- |
| `GET /public/reservations/date-options` | On load | `["public","reservations","date-options"]` |
| `GET /public/reservations/availability?date=YYYY-MM-DD` | After a day is chosen | `["public","reservations","availability",date]` |
| `POST /public/reservations` | Submit | mutation; afterwards all reservation queries refresh |

Body sent: `{ fullName, phone, age, scheduledAt, notes? }`. Only free times are returned by the server, so booked times are hidden (not disabled), as the supervisor asked.

## How it works

1. Days come from the server (Sunday to Thursday, Friday and Saturday off) and show five at a time with arrows.
2. Choosing a day clears the time and loads that day's free times, split into morning, midday, afternoon and evening.
3. Name, phone (left-to-right input), age and optional notes are validated by Zod on submit; messages are re-translated if the language changes.
4. While the visitor types, `AppointmentCard` shows the name, day and time in handwriting.
5. On success the form is replaced by a thank-you message and the card's "Waiting for confirmation" stamp is pressed on.

## Errors

| Server code | Message shown |
| ----------- | ------------- |
| `SLOT_UNAVAILABLE` | "That time was just taken" (the time is cleared and the list reloads) |
| `PENDING_LIMIT_REACHED` | The phone already has 2 requests waiting |
| `TOO_MANY_REQUESTS` | Too many requests, try later |
| `VALIDATION_ERROR` | Check your details |
| `NETWORK_ERROR` | Could not reach the server |

Loading, "no open days" and "no free times on this day" each have their own message with a retry where useful.

## Languages, responsive, accessibility

- Days use `Intl.DateTimeFormat` with Latin digits in Arabic; times are shown left-to-right.
- On phones the card moves under the form. On short laptop screens the card is shorter so the section fits one screen.
- Bubbles are buttons with `aria-pressed`; the card is an `aria-live` region.

## Known limitations

There is no review step before sending; the card plays that role visually.
