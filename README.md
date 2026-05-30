# enmaru

Full-stack starter for LAplust web apps: **Next.js (App Router) + Prisma + MySQL**, with
MUI, ESLint/Prettier, Vitest unit tests, and Playwright e2e tests (Docker-based, modeled on
CTI-Edge).

## Stack

| Layer           | Choice                                                                          |
| --------------- | ------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, TypeScript, `src/`)                                     |
| Package manager | pnpm (pinned via corepack)                                                      |
| UI              | MUI v9 (`@mui/material-nextjs` App Router integration)                          |
| ORM             | Prisma 7 (`prisma-client` generator + `@prisma/adapter-mariadb` driver adapter) |
| Database        | MySQL 8 (Docker Compose)                                                        |
| Lint / Format   | ESLint + Prettier                                                               |
| Unit test       | Vitest + Testing Library (jsdom)                                                |
| E2E test        | Playwright (runs in Docker, see `e2e/`)                                         |

## Directory layout

```
src/
├── app/            # Next.js routing (pages + route handlers — keep thin)
├── components/     # FE components
├── services/       # FE → own route handler HTTP layer (axios/fetch)
├── server/         # BE domain logic / DB access
├── types/          # Types shared between FE and BE
├── lib/prisma.ts   # PrismaClient singleton (MySQL driver adapter)
└── generated/      # Prisma client output (git-ignored, run `prisma generate`)
prisma/schema.prisma  # datasource + generator (models go here)
e2e/                  # Playwright e2e (see e2e/README.md)
```

`src/app/` is the only directory whose structure is dictated by Next.js. Everything else is
convention. In the App Router, BE code (route handlers, server components, server actions)
lives alongside FE code under `src/app/`; keep the routing layer thin and put logic in
`server/` / `services/`.

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm via corepack: `corepack enable`
- Docker (for MySQL and e2e tests)

## Setup

```bash
corepack enable
pnpm install            # also runs `prisma generate`
cp .env.example .env    # adjust credentials if needed
```

## Local development

Start MySQL in Docker, then run the app on the host for fast iteration:

```bash
docker compose up -d db
pnpm dev                # http://localhost:3000
```

After editing `prisma/schema.prisma`:

```bash
pnpm db:migrate         # create + apply a migration (dev)
pnpm prisma:generate    # regenerate the client (also runs on build)
```

## Full stack in Docker

```bash
./cmd up                # build + start db and app
./cmd down -v           # stop and remove (with volumes)
```

## Commands

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `pnpm dev`              | Dev server (host)                    |
| `pnpm build`            | `prisma generate` + production build |
| `pnpm lint`             | ESLint                               |
| `pnpm format`           | Prettier (write)                     |
| `pnpm typecheck`        | `tsc --noEmit`                       |
| `./cmd test unit`       | Vitest unit tests                    |
| `./cmd test e2e`        | Playwright e2e in Docker             |
| `./cmd test e2e-report` | Serve the last e2e HTML report       |

## Tests

- **Unit** (Vitest + jsdom): `*.test.ts(x)` under `src/`. Run `./cmd test unit`.
- **E2E** (Playwright in Docker): see [`e2e/README.md`](e2e/README.md). Run `./cmd test e2e`.

The shipped Vitest and Playwright tests are smoke tests proving the harnesses work; replace
them as real features land.
