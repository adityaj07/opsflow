# OpsFlow: Smart Internal Operations System

OpsFlow is a lightweight internal operations platform focused on improving task execution clarity, accountability, and visibility.

Instead of feature-heavy task management, it emphasizes structured updates where every task clearly communicates:

- what was done
- blockers
- next steps

This helps teams reduce ambiguity and understand progress without relying on scattered communication.

## What this version focuses on

This MVP demonstrates core product thinking and system design:

- Role-based access (Admin, Manager, User)
- Task management and assignment
- Structured task updates
- Unified activity timeline
- Simple role-aware dashboards

The focus is on clarity of execution over feature breadth.

## Note

OpsFlow is a developing product. This version showcases key workflows and decisions, not a complete system.

Future improvements would include better collaboration, analytics, time tracking and estimation for each task and real-time capabilities.

## Tech stack

| Area     | Choices                                                                                       |
| -------- | --------------------------------------------------------------------------------------------- |
| Monorepo | Turborepo, Bun workspaces                                                                     |
| Web      | React 19, React Router 7, Vite, Tailwind CSS 4, TanStack Query, Zustand, React Hook Form, Zod |
| API      | Bun, Express 5, JWT (cookies), CORS                                                           |
| Data     | PostgreSQL, Prisma 7                                                                          |
| UI       | Shared `packages/ui` (shadcn-style components)                                                |

## Prerequisites

- [Bun](https://bun.sh) 1.2.x (see `packageManager` in root `package.json`)
- PostgreSQL 16+ (local install or Docker via `packages/db/docker-compose.yml`)

## Environment variables

Copy `packages/db/.env.example` and use the same values in:

- **`apps/server/.env`** (API and Prisma CLI; see `packages/db/prisma.config.ts`)
- **`packages/db/.env`** (admin seeder loads this when you run `seed:admin` from `packages/db`)

| Variable           | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `DATABASE_URL`     | PostgreSQL connection string                          |
| `CORS_ORIGIN`      | Allowed browser origin (e.g. `http://localhost:5173`) |
| `JWT_TOKEN_SECRET` | Secret for signing session tokens                     |

Optional (for `seed:admin`): `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `SEED_ADMIN_FORCE`.

Create **`apps/web/.env`** for the frontend:

| Variable          | Example                 |
| ----------------- | ----------------------- |
| `VITE_SERVER_URL` | `http://localhost:3000` |

## Setup

```bash
bun install
```

Start PostgreSQL if needed:

```bash
bun run db:start
```

Apply the schema (migrations are in `packages/db/prisma/migrations`):

```bash
bun run db:migrate
# or, for a quick local sync without migration history:
# bun run db:push
```

Seed the initial admin user (uses `apps/server/.env`):

```bash
bun --cwd packages/db run seed:admin
```

Run web and API together:

```bash
bun run dev
```

- Web: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000) (health: `GET /`)

Other useful scripts: `bun run db:studio`, `bun run build`, `bun run check-types`.

## Links

- **Deployed app:** add your production URL here.
- **Postman collection:** add your public or workspace collection link here.
