# Auth

Staff and patients log in with email and password. There is no sign-up page: staff create patient logins (see [patients.md](patients.md#create-a-login-for-a-patient)).

| Method | Path          | Who       | Returns         |
| ------ | ------------- | --------- | --------------- |
| POST   | `/auth/login` | Anyone    | `LoginResponse` |
| GET    | `/auth/me`    | Logged in | `User`          |

## Log in

```
POST /api/auth/login
{ "email": "admin@clinic.com", "password": "secret123" }
```

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "6730a1...",
      "fullName": "Clinic Admin",
      "email": "admin@clinic.com",
      "role": "admin",
      "patientId": null,
      "therapistId": null,
      "createdAt": "2026-10-28T10:00:00.000Z",
      "updatedAt": "2026-10-28T10:00:00.000Z"
    }
  }
}
```

- Wrong email and wrong password both return `INVALID_CREDENTIALS`, so nobody can guess which emails exist.
- Too many attempts return `TOO_MANY_REQUESTS`.

## Who am I

`GET /api/auth/me` with the token returns the same `user` object. The client calls it on page load to restore the session.
