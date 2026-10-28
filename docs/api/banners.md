# Banners

Short messages shown in a scrolling bar at the top of the public site: clinic announcements and schedule updates, in English and Arabic.

| Method | Path              | Who    | Send          | Returns                           |
| ------ | ----------------- | ------ | ------------- | --------------------------------- |
| GET    | `/public/banners` | Anyone |               | Active banners, sorted by `order` |
| GET    | `/banners`        | Admin  | list params   | `Banner[]` (paged)                |
| POST   | `/banners`        | Admin  | `BannerInput` | `Banner` (201)                    |
| PUT    | `/banners/:id`    | Admin  | `BannerInput` | `Banner`                          |
| DELETE | `/banners/:id`    | Admin  |               | `null`                            |

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

- Turn a banner on or off with `PUT` and `isActive`.
- The admin list sorts by `order` by default; `createdAt` also works.
