# Physio Clinic

Physiotherapy Clinic Management System: a public website where visitors book appointments, and an admin panel where clinic staff manage patients, treatment reports, reservations and announcements.

## Tech stack

- **client/**: React, TypeScript, MUI, React Query, React Hook Form, Zod
- **server/**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Zod
- **shared/**: TypeScript types for API data, used by both apps

The API contract (every endpoint, request and response) is in [docs/api/](docs/api/README.md).

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

## Workflow

- Never commit to `main`; open a pull request from a branch.
- Every pull request needs one approval before merging.
