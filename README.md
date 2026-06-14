# enmaru

<!-- The overview below is intentionally in Japanese (exception to the English-docs policy): it describes the service for its Japanese-speaking stakeholders. -->

**えんまーる**は、保育士資格を持ちながら現場を離れている「潜在保育士」と、人手不足に悩む保育園を、いきなり就職ではなく**段階的につなぐ**マッチングプラットフォームです。応募 → 業務 → 相互評価までを一つの流れとして設計することで、ミスマッチを防ぎ、双方が安心して関係を築ける仕組みを提供します。

えんまーるは[合同会社KASUMIN](https://kasumin.biz/)が運営しており、現在は[Notion 上に構築されたページ](https://laplust.notion.site/2dec08e5f34c80dd90c9e62a74946408)として試験運用されています。このリポジトリは、現・えんまーるの Web アプリ化を実現するものです。

## Stack

| Layer           | Choice                                                        |
| --------------- | ------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, TypeScript, `src/`)                   |
| Hosting         | Netlify (automatic deploys)                                   |
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

There is no Docker: the app runs on the host locally (`pnpm dev`) and on Netlify's managed
runtime in production. The database, storage, and auth are managed cloud services.

The directory layout and the rules for where new code lands are documented in
[`docs/architecture.md`](docs/architecture.md) and [`docs/design.md`](docs/design.md).

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
- **Production & dev (branch deploy)** read credentials from **Netlify environment
  variables**, scoped per deploy context (Production / Branch deploys) in the Netlify site
  settings.

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

Deploys are automatic via Netlify's GitHub integration:

- **Production** — push/merge to `main` → https://enmaru.kasumin.biz
- **dev** — push to the `dev` branch (Netlify branch deploy) →
  https://dev--marvelous-crepe-8a78fb.netlify.app

Set the environment variables per deploy context (Production / Branch deploys) in the
Netlify site settings (the same keys as `.env.example`). No deploy workflow lives in this
repo; GitHub Actions only runs the quality-gate CI.

## Commands

| Command                    | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `pnpm dev`                 | Dev server (host)                                                    |
| `pnpm build`               | `prisma generate` + production build                                 |
| `pnpm lint`                | ESLint                                                               |
| `pnpm format`              | Prettier (write)                                                     |
| `pnpm typecheck`           | `tsc --noEmit`                                                       |
| `pnpm db:migrate`          | Prisma migration (dev)                                               |
| `pnpm db:studio`           | Prisma Studio                                                        |
| `pnpm admin:grant <email>` | Grant the ADMIN role to a user ([operations.md](docs/operations.md)) |
| `./cmd test unit`          | Vitest unit tests                                                    |
| `./cmd test e2e-setup`     | Install Playwright browser (one-time)                                |
| `./cmd test e2e`           | Playwright e2e (host, via webServer)                                 |
| `./cmd test e2e-report`    | Open the last e2e HTML report                                        |

## Where to look next

Find the right document by the question you have:

- **What must the product do?**
  - [Requirements](docs/requirements.md) — capabilities and rules, tech-independent
- **How is the system put together?**
  - [Architecture](docs/architecture.md) — system diagram, tiers, directory roles
- **Where does this new code go?**
  - [Design](docs/design.md) — roles, data-flow patterns, dependency direction
- **What conventions does the project follow?**
  - [Conventions](docs/conventions/index.md) — coding, repo, docs
- **How is the project tested?**
  - [Testing](docs/testing.md) — where each layer's tests live, how to run them
- **How do I run an operator task?**
  - [Operations](docs/operations.md) — operator procedures
- **How do I write or run e2e tests specifically?**
  - [`e2e/README.md`](e2e/README.md) — Playwright structure, page objects, fixtures

The shipped Vitest and Playwright tests are smoke tests proving the harnesses work; replace
them as real features land.
