# Auth

Admins, therapists and patients log in with email and password, or with Google when their account uses the same email. There is no sign-up: the admin creates every account (see [users.md](users.md)).

| Method | Path           | Who       | Returns         |
| ------ | -------------- | --------- | --------------- |
| POST   | `/auth/login`  | Anyone    | `LoginResponse` |
| POST   | `/auth/google` | Anyone    | `LoginResponse` |
| GET    | `/auth/me`     | Logged in | `User`          |

## Log in

```
POST /api/auth/login
{ "email": "lina@clinic.com", "password": "secret123" }
```

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "6730a9...",
      "fullName": "Dr. Lina Khalil",
      "email": "lina@clinic.com",
      "role": "therapist",
      "isActive": true,
      "patientId": null,
      "therapistId": "6730b1...",
      "privileges": ["patients.view", "reports.view", "reports.edit", "reservations.take"],
      "patientScope": { "all": false, "patientIds": ["6730a1...", "6730a2..."] },
      "createdAt": "2026-10-28T10:00:00.000Z",
      "updatedAt": "2026-10-28T10:00:00.000Z"
    }
  }
}
```

- Wrong email and wrong password both return `INVALID_CREDENTIALS`, so nobody can guess which emails exist.
- An account the admin turned off returns `ACCOUNT_DISABLED`.
- Too many attempts return `TOO_MANY_REQUESTS`.

## Log in with Google

```
POST /api/auth/google
{ "credential": "eyJhbGciOiJSUzI1NiIs..." }
```

`credential` is the ID token the "Sign in with Google" button gives the page. The server checks it with Google (it must be made for our `GOOGLE_CLIENT_ID` and have a verified email) and answers like `/auth/login`.

- Google sign-in never creates an account: the email must already belong to one, or the answer is `NO_ACCOUNT`.
- A token that fails the check returns `INVALID_CREDENTIALS`; a turned-off account returns `ACCOUNT_DISABLED`.
- Without `GOOGLE_CLIENT_ID` on the server the answer is `NOT_FOUND`.
- Shares the login rate limit (`TOO_MANY_REQUESTS`).

## Who am I

`GET /api/auth/me` with the token returns the same `user` object. The client calls it on page load to restore the session, and uses `privileges` to show or hide pages and buttons.

- **Admin:** `privileges` lists every privilege and `patientScope` is `{ "all": true }`.
- **Patient:** `privileges` is `[]` and `patientScope` is `null`.
