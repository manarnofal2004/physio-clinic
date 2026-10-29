# Physio Clinic

Physiotherapy Clinic Management System: a public website where visitors book appointments, and an admin panel where clinic staff manage patients, treatment reports, reservations and announcements.

## Tech stack

- **client/**: React, TypeScript, MUI, React Query, React Hook Form, Zod
- **server/**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Zod
- **shared/**: TypeScript types for API data, used by both apps

The API contract (every endpoint, request and response) is in [docs/api/](docs/api/README.md).

## Prerequisites

- Node.js 20.19+ (or 22.13+ / 24+), required by ESLint 10
- pnpm (`npm install -g pnpm`)
- MongoDB: a MongoDB Atlas connection string (free tier is enough) or a local MongoDB

## Setup

```bash
git clone https://github.com/manarnofal2004/physio-clinic.git
cd physio-clinic
pnpm install

# Server
cd server
pnpm install
cp .env.example .env   # then fill in the values (see below)
pnpm seed              # first admin and sample data
pnpm dev               # http://localhost:5000/api/health

# Client (in a second terminal)
cd client
pnpm install
cp .env.example .env
pnpm dev
```

## Server

### Environment variables (`server/.env`)

| Variable              | Required | Default       | What it is                                                                |
| --------------------- | -------- | ------------- | ------------------------------------------------------------------------- |
| `MONGODB_URI`         | Yes      |               | Connection string, ending with the database name: `.../physio-clinic?...` |
| `JWT_SECRET`          | Yes      |               | Random text that signs login tokens. At least 32 characters in production |
| `CLIENT_URL`          | Yes      |               | The client's address; several can be separated by commas                  |
| `PORT`                | No       | `5000`        | Port the API listens on                                                   |
| `JWT_EXPIRES_IN`      | No       | `1d`          | How long a login lasts                                                    |
| `CLINIC_TIMEZONE`     | No       | `Asia/Hebron` | Timezone for booking days and times                                       |
| `TRUST_PROXY`         | No       | `0`           | Number of proxies in front of the server when deployed                    |
| `SEED_ADMIN_EMAIL`    | No       | see below     | Email of the admin `pnpm seed` creates                                    |
| `SEED_ADMIN_PASSWORD` | No       | see below     | Password of that admin                                                    |

The server checks these at startup and stops with a clear message if one is missing or invalid. Never commit `.env`.

### Sample data and default accounts

`pnpm seed` creates the accounts below, 12 patients, 2 therapists, 60 reports, 9 reservations and 3 banners. It is safe to run again: anything already there is left alone.

| Role      | Email               | Password       |
| --------- | ------------------- | -------------- |
| Admin     | `admin@clinic.com`  | `Admin12345`   |
| Therapist | `lina@clinic.com`   | `Therapist123` |
| Patient   | `ahmad@example.com` | `Patient123`   |

Change these passwords (or set `SEED_ADMIN_*`) before using real data.

### Scripts (`server/`)

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Run the API and restart on changes        |
| `pnpm build`     | Compile TypeScript to `dist/`             |
| `pnpm start`     | Run the compiled API (after `pnpm build`) |
| `pnpm seed`      | Create the first admin and sample data    |
| `pnpm test`      | Run the API tests (Vitest + Supertest)    |
| `pnpm typecheck` | Type-check the source and the tests       |

Tests use a separate database, `physio-clinic-test`, on the same server as `MONGODB_URI`. It is emptied between tests and dropped at the end, so your data is never touched.

If `pnpm typecheck` stops with "out of memory" on a busy machine, run `npx tsc -p tsconfig.test.json --singleThreaded`.

### Folder structure (`server/src/`)

```
config/        environment variables, validated with zod
db/            MongoDB connection
models/        Mongoose schemas: User, Therapist, Patient, Report, Reservation, Banner
validators/    zod schemas for each endpoint's body, query and params
routes/        URLs and the checks in front of them (login, role, privilege, validation)
controllers/   read the request, call services and models, send the response
services/      business rules: access and scope, booking slots, reports, uploads, dashboard
middleware/    auth, validation, uploads, rate limits, errors
utils/         AppError, response helper, pagination, search, CSV, clinic time
scripts/       seed
```

### How the API works

- **Roles:** admin, therapist, patient. Visitors need no account. Only the admin creates accounts.
- **Privileges:** the admin picks what each therapist may do (for example `patients.view`, `reports.edit`, `reservations.take`) and which patients they see (all, or a chosen list).
- **Responses:** `{ "success": true, "data": ..., "meta"?: ... }` or `{ "success": false, "error": { "code", "message", "details"? } }`.
- **Files** (report attachments) are stored in MongoDB GridFS. Unused uploads are deleted after 24 hours.
- **Security:** Helmet headers, CORS limited to `CLIENT_URL`, rate limits on login and booking, bcrypt passwords, 1-day JWT, input validated on every endpoint.

## Scripts (root)

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `pnpm lint`         | Check the code with ESLint       |
| `pnpm lint:fix`     | Fix ESLint problems that can be  |
| `pnpm format`       | Format every file with Prettier  |
| `pnpm format:check` | Check formatting without writing |

## Workflow

- Never commit to `main`; work on a branch per task (small related tasks can share one).
- Open a pull request when the task is done. The other developer checks out the branch, runs it and tests it, then approves.
- Every pull request needs one approval before merging. Branches are kept after merging.
- Merged work moves to QA on Trello.
