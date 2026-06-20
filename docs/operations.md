# Operations

Operational procedures the operator (KASUMIN) runs to administer the service.
For everyday setup and commands, see the [README](../README.md).

## Granting an admin

Admins (the KASUMIN operator) are not self-registered — sign-up only creates
seeker / nursery accounts, and the `(admin)` area is role-guarded. So you create
an admin in two steps: the person signs up through the app normally, then you
promote their account.

**Pick one environment and stay in it.** The person must sign up on the same
environment whose database you then run the grant against (both dev, or both
prod). They are separate databases, so an account created on dev does not exist
in prod.

1. **Sign up (in a browser).** The person opens the app for that environment and
   registers — any role, since it gets overwritten:
   - Dev: <http://localhost:3000> (your local `pnpm dev`)
   - Prod: <https://enmaru.kasumin.biz>

   Click ログイン / 新規登録 → sign in via Logto → finish the registration step.
   This creates their `User` row (keyed by email) in that environment's database.

2. **Promote.** Run the grant from the **repository root** on your machine —
   the same checkout you run `pnpm dev` from (it needs `package.json` and
   `scripts/grant-admin.mjs`, so it can't be run from an arbitrary directory).
   The command connects to whichever database `DATABASE_URL` points at, so use
   the form that matches where they signed up:
   - Dev — reads `DATABASE_URL` from the `.env.local` in that directory (the dev
     Neon branch, same as `pnpm dev`):
     ```bash
     cd <your enmaru checkout>
     pnpm admin:grant person@example.com
     ```
   - Prod — pass the production `DATABASE_URL` explicitly instead:
     ```bash
     cd <your enmaru checkout>
     DATABASE_URL="<prod connection string>" node scripts/grant-admin.mjs person@example.com
     ```

   The script prints the updated user, or errors if no user has that email — e.g.
   they haven't registered yet, or registered on a different environment than the
   one `DATABASE_URL` targets.

Verify by signing in as that person and opening `/admin`. The role lives on the
`User` row, so it takes effect on their next request — no redeploy.

## Running database migrations

Deploys do **not** run migrations: the Netlify build is `prisma generate &&
next build` only, so applying a schema change to a database is a manual step
(automating this is tracked in #78). New migration files are created during
development with `pnpm db:migrate` (`prisma migrate dev`, dev branch only);
applying already-committed migrations to an environment uses `prisma migrate
deploy`.

**Never run `pnpm db:migrate` against prod** — `migrate dev` is for authoring
migrations (shadow database, interactive, can reset). Prod only ever gets
`migrate deploy`, which applies pending committed migrations non-interactively.

To migrate **prod** (run from a checkout of the released commit, usually `main`):

1. Get the prod **direct (unpooled)** connection string. The runtime
   `DATABASE_URL` in Netlify is the _pooled_ endpoint; `migrate` needs the direct
   one. In the Neon console, select the **prod branch**, open Connect, and turn
   **Connection pooling off** — or take the pooled string and remove `-pooler`
   from the host (`ep-xxx-pooler.…` → `ep-xxx.…`).
2. Run, with the URL in **single quotes** (it contains `&` / `?`, which the shell
   would otherwise parse):
   ```bash
   cd <your enmaru checkout>   # on the released commit (main)
   DATABASE_URL='<prod direct connection string>' pnpm exec prisma migrate deploy
   ```
   The inline `DATABASE_URL` takes precedence over any `.env.local` (same pattern
   as the admin grant above). It applies any pending migrations, or prints
   "No pending migrations" if the database is already up to date.

If the database already has tables but no Prisma migration history, `migrate
deploy` stops with `P3005` (schema not empty) — that database must be baselined
first; do not force it blindly.

The same command migrates **dev** with the dev branch's direct `DATABASE_URL`
(or just run `pnpm db:migrate` locally, which both creates and applies against the
dev branch from `.env.local`).
