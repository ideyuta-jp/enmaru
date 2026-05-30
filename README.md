# enmaru

Full-stack starter for LAplust web apps: **Next.js (App Router) + Prisma + Neon**, deployed
on **Vercel**, with MUI, Cloudflare R2 storage, Logto Cloud auth, ESLint/Prettier, Vitest
unit tests, and Playwright e2e tests.

## Stack

| Layer           | Choice                                                        |
| --------------- | ------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, TypeScript, `src/`)                   |
| Hosting         | Vercel (automatic deploys)                                    |
| Package manager | pnpm (pinned via corepack)                                    |
| UI              | MUI v9 (`@mui/material-nextjs` App Router integration)        |
| ORM             | Prisma 7 (`prisma-client` generator + `@prisma/adapter-neon`) |
| Database        | Neon (serverless PostgreSQL)                                  |
| Storage         | Cloudflare R2 (S3-compatible, `@aws-sdk/client-s3`)           |
| Auth            | Logto Cloud (`@logto/next`)                                   |
| Lint / Format   | ESLint + Prettier                                             |
| Unit test       | Vitest + Testing Library (jsdom)                              |
| E2E test        | Playwright (runs on the host, see `e2e/`)                     |
| CI              | GitHub Actions (lint / typecheck / unit / e2e)                |

There is no Docker: the app runs on the host locally (`pnpm dev`) and on Vercel's managed
runtime in production. The database, storage, and auth are managed cloud services.

## Directory layout

```
src/
├── app/            # Next.js routing (pages + route handlers — keep thin)
│   └── callback/   # Logto sign-in callback route handler
├── components/     # FE components
├── services/       # FE → own route handler HTTP layer (axios/fetch)
├── server/         # BE domain logic; server actions (e.g. auth.ts)
├── types/          # Types shared between FE and BE
├── lib/            # Shared clients/config
│   ├── prisma.ts   #   PrismaClient singleton (Neon adapter)
│   ├── storage.ts  #   Cloudflare R2 (S3) client
│   └── logto.ts    #   Logto config + getAuthContext()
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
- Accounts for the managed services: **Neon** (a dev branch), **Cloudflare R2** (a dev
  bucket), and **Logto Cloud** (a dev tenant/app)

## Setup

```bash
corepack enable
pnpm install            # also runs `prisma generate`
cp .env.example .env.local
```

Then fill `.env.local` with your **dev** cloud credentials (see `.env.example` for every
variable). `.env.local` is git-ignored.

## Environments (prod / dev separation)

Production and development always use **separate** Neon / R2 / Logto instances:

- **Local dev** reads credentials from `.env.local`, pointing at the dev branch / bucket /
  tenant.
- **Production & preview** read credentials from **Vercel environment variables**, set per
  environment in the Vercel project settings.

Next.js loads `.env.local` automatically; the Prisma CLI loads it via `@next/env` (see
`prisma.config.ts`), so `prisma migrate dev` / `prisma studio` also target the dev branch.

## Local development

```bash
pnpm dev                # http://localhost:3000
```

After editing `prisma/schema.prisma`:

```bash
pnpm db:migrate         # create + apply a migration against the dev Neon branch
pnpm prisma:generate    # regenerate the client (also runs on build)
```

## Deployment

Deploys are automatic via Vercel's GitHub integration:

- **Production** — push/merge to `main`
- **Preview** — every pull request

Set the production and preview environment variables in the Vercel project settings (the
same keys as `.env.example`). No deploy workflow lives in this repo; GitHub Actions only runs
the quality-gate CI.

## Commands

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `pnpm dev`              | Dev server (host)                     |
| `pnpm build`            | `prisma generate` + production build  |
| `pnpm lint`             | ESLint                                |
| `pnpm format`           | Prettier (write)                      |
| `pnpm typecheck`        | `tsc --noEmit`                        |
| `pnpm db:migrate`       | Prisma migration (dev)                |
| `pnpm db:studio`        | Prisma Studio                         |
| `./cmd test unit`       | Vitest unit tests                     |
| `./cmd test e2e-setup`  | Install Playwright browser (one-time) |
| `./cmd test e2e`        | Playwright e2e (host, via webServer)  |
| `./cmd test e2e-report` | Open the last e2e HTML report         |

## Tests

- **Unit** (Vitest + jsdom): `*.test.ts(x)` under `src/`. Run `./cmd test unit`.
- **E2E** (Playwright on the host): see [`e2e/README.md`](e2e/README.md). Run
  `./cmd test e2e-setup` once, then `./cmd test e2e`.

The shipped Vitest and Playwright tests are smoke tests proving the harnesses work; replace
them as real features land.
