# Banners

Short messages shown in a scrolling bar at the top of the public site: clinic announcements and schedule updates, in English and Arabic.

| Method | Path              | Needs            | Send          | Returns                           |
| ------ | ----------------- | ---------------- | ------------- | --------------------------------- |
| GET    | `/public/banners` | Anyone           |               | Active banners, sorted by `order` |
| GET    | `/banners`        | `banners.manage` | list params   | `Banner[]` (paged)                |
| POST   | `/banners`        | `banners.manage` | `BannerInput` | `Banner` (201)                    |
| PUT    | `/banners/:id`    | `banners.manage` | `BannerInput` | `Banner`                          |
| PATCH  | `/banners/:id`    | `banners.manage` | `BannerPatch` | `Banner`                          |
| DELETE | `/banners/:id`    | `banners.manage` |               | `null`                            |

## A banner

```json
{
  "id": "6730f1...",
  "type": "schedule_update",
  "messageEn": "The clinic is closed on Sunday, November 8.",
  "messageAr": "العيادة مغلقة يوم الأحد 8 تشرين الثاني.",
  "isActive": true,
  "order": 1,
  "createdAt": "2026-10-28T12:00:00.000Z",
  "updatedAt": "2026-10-28T12:00:00.000Z"
}
```

| Field       | Rules                                    |
| ----------- | ---------------------------------------- |
| `type`      | `announcement` or `schedule_update`      |
| `messageEn` | Required, max 300 chars                  |
| `messageAr` | Required, max 300 chars                  |
| `isActive`  | Optional, default `true`                 |
| `order`     | Optional, default `0`; lower shows first |

- `PUT` replaces the whole banner. `PATCH` changes only the fields sent: turn a banner on or off with `PATCH /api/banners/:id` and `{ "isActive": false }`, or move it with `{ "order": 2 }`. An empty body returns `VALIDATION_ERROR`.
- The admin list sorts by `order` by default; `createdAt` also works.
