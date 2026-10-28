# Dashboard

One endpoint with every number and chart on the admin dashboard.

| Method | Path               | Who   | Returns          |
| ------ | ------------------ | ----- | ---------------- |
| GET    | `/dashboard/stats` | Staff | `DashboardStats` |

```json
{
  "success": true,
  "data": {
    "totalPatients": 120,
    "activePatients": 85,
    "totalReports": 430,
    "pendingReservations": 6,
    "recentPatients": [
      {
        "id": "6730a1...",
        "fullName": "Ahmad Saleh",
        "condition": "Lower back pain",
        "lastVisit": "2026-10-20T09:00:00.000Z",
        "createdAt": "2026-10-01T08:00:00.000Z"
      }
    ],
    "reportsOverTime": [
      { "month": "2026-09", "count": 38 },
      { "month": "2026-10", "count": 45 }
    ],
    "progressCounts": { "improving": 250, "stable": 140, "worse": 40 },
    "conditionCounts": [
      { "condition": "Lower back pain", "count": 32 },
      { "condition": "Knee injury", "count": 21 }
    ]
  }
}
```

- `recentPatients`: the 5 newest patients.
- `reportsOverTime`: the last 12 months, including months with `0`.
- `conditionCounts`: the top 10 conditions.
- With an empty database every count is `0` and every list is `[]`.
