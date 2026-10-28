# Physio Clinic

Physiotherapy Clinic Management System: a public website where visitors book appointments, and an admin panel where clinic staff manage patients, treatment reports, reservations and announcements.

## Tech stack

- **client/**: React, TypeScript, MUI, React Query, React Hook Form, Zod
- **server/**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Zod

## Prerequisites

- Node.js 20 or later
- MongoDB (local, or a MongoDB Atlas connection string)

## Setup

```bash
git clone https://github.com/manarnofal2004/physio-clinic.git
cd physio-clinic
npm install

# Server
cd server
npm install
cp .env.example .env   # then fill in the values
npm run dev

# Client (in a second terminal)
cd client
npm install
cp .env.example .env
npm run dev
```

## Scripts (root)

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run lint`         | Check the code with ESLint       |
| `npm run lint:fix`     | Fix ESLint problems that can be  |
| `npm run format`       | Format every file with Prettier  |
| `npm run format:check` | Check formatting without writing |

## Workflow

- Never commit to `main`; open a pull request from a branch.
- Every pull request needs one approval before merging.
