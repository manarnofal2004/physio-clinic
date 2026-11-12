# 8. Banners

| | |
| - | - |
| Route | `/admin/banners`, `/therapist/banners` |
| Access | Privilege `banners.manage` (admins always) |
| Built by | Manar (task 6.4) |

## Purpose

Manage the messages in the bar at the top of the public site: clinic announcements and schedule updates, in English and Arabic.

## Files

| File | Role |
| ---- | ---- |
| `features/banners/BannersPage.tsx` | List with order arrows, show/hide switch, edit, delete |
| `features/banners/BannerDialog.tsx` | Add / edit with a live preview |
| `features/banners/bannerStyle.ts`, `BannerTypeIcon.tsx` | Colours and icon per type, shared with the public bar |
| `features/banners/api.ts` | Public and admin queries, mutations |

## Data and API

| Call | Notes |
| ---- | ----- |
| `GET /banners?limit=100&sort=order` | Every banner, shown or hidden |
| `POST /banners` | New banners get `order = last + 1` |
| `PUT /banners/:id` | Edit |
| `PATCH /banners/:id` | `{ isActive }` from the switch, `{ order }` from the arrows |
| `DELETE /banners/:id` | After confirmation |

Every change refreshes both the admin list and the public bar (`["banners"]` prefix).

## How it works

- Each row: a type chip (announcement: olive, megaphone; schedule update: honey, clock), the message in the page language and the other language under it, the switch, edit and delete. Hidden banners stay in the list, faded.
- **Order arrows** swap a banner's `order` with its neighbour's (falling back to positions when two orders are equal). The order is the order the public bar rotates in.
- **Dialog:** type toggle, Arabic and English messages with a counter (max 300, same as the server), "Show on the site" switch, and a preview that looks exactly like the public bar.

## States, languages, responsive

Loading, error with retry, empty state; notifications for saved / deleted / failed. Arabic and English inputs have fixed directions. On phones each row stacks.
