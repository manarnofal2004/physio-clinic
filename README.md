# Physio Clinic

Physiotherapy Clinic Management System: a public website where visitors book appointments, and an admin panel where clinic staff manage patients, treatment reports, reservations and announcements.

## Tech stack

- **client/**: React, TypeScript, Vite, MUI, React Router, React Query, Axios, React Hook Form, Zod
- **server/**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Zod

## Prerequisites

- Node.js 20 or later
- pnpm (`npm install -g pnpm`)
- MongoDB (local, or a MongoDB Atlas connection string)

## Setup

```bash
git clone https://github.com/manarnofal2004/physio-clinic.git
cd physio-clinic
pnpm install

# Server
cd server
pnpm install
cp .env.example .env   # then fill in the values
pnpm dev

# Client (in a second terminal)
cd client
pnpm install
cp .env.example .env
pnpm dev
```

## Scripts (root)

| Command             | What it does                     |
| ------------------- | -------------------------------- |
| `pnpm lint`         | Check the code with ESLint       |
| `pnpm lint:fix`     | Fix ESLint problems that can be  |
| `pnpm format`       | Format every file with Prettier  |
| `pnpm format:check` | Check formatting without writing |

## Client

The client runs at http://localhost:5173. The server must be running for API calls to work.

### Environment variables

| Variable       | Description                 | Example                 |
| -------------- | --------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000` |

Restart `pnpm dev` after changing `.env`. Commit only `.env.example`, never `.env`.

### Scripts (client/)

| Command      | What it does                        |
| ------------ | ----------------------------------- |
| `pnpm dev`   | Start the dev server                |
| `pnpm build` | Type-check and build for production |
| `pnpm lint`  | Check the client code with ESLint   |

### Path aliases

| Alias      | Points to                    |
| ---------- | ---------------------------- |
| `@/`       | `client/src/`                |
| `@shared/` | `shared/` (shared API types) |

Example: `import { apiClient } from '@/lib/api/client'`

### Folder structure

```
client/src/
  app/          App providers and router
  features/     One folder per feature (patients, reports, ...)
  components/   Reusable UI components
  lib/          Env config, Axios instance, query client
  routes/       Route definitions and guards
```

## Workflow

- Never commit to `main`; open a pull request from a branch.
- Every pull request needs one approval before merging.