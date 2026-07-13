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
   - Dev: <https://dev--marvelous-crepe-8a78fb.netlify.app> (the `dev` branch
     deploy)
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
`User` row in the database, so it takes effect on their next request — no
redeploy.

## Registering a user on their behalf (and fixing their email)

Sometimes you register an account for someone (e.g. a nursery or seeker joining
at launch) rather than having them self-register. The obstacle is the sign-up
one-time code: it goes to the email being registered, so you can't complete
sign-up with the customer's address unless you can read their inbox.

Work around it by signing up with an address you control, then swapping the
email over in two places — Logto (the source of truth for auth) and the `User`
row in the database (Neon), whose email is a mirror seeded once at registration
(`src/server/user.ts`) and never synced afterwards. Identity is keyed on the
Logto subject (`User.authId`), not email, so the account keeps working
throughout; the email swap just keeps the database mirror correct for admin
tooling, notifications, and display.

**Pick one environment and stay in it** — same rule as the admin grant above.
The Logto account and the database `User` row live in whichever environment you
target.

1. **Sign up (in a browser)** with an email you can receive mail at, and finish
   the registration step. This creates the Logto account and the `User` row in
   the database, both holding your temporary email:
   - Dev: <https://dev--marvelous-crepe-8a78fb.netlify.app>
   - Prod: <https://enmaru.kasumin.biz>

2. **Change the email in Logto.** In the Logto admin console, open Console >
   User management > (the account) and edit the **Email address** to the
   customer's real address. This is the source of truth for sign-in. You can
   also reset the password here to hand the customer initial credentials.

3. **Update the `User` row in the database** to match, from the **repository
   root** (same checkout you run `pnpm dev` from — it needs `package.json` and
   `scripts/update-email.mjs`). Pass the address you signed up with, then the
   customer's real address:
   - Dev — reads `DATABASE_URL` from `.env.local` (the dev Neon branch):
     ```bash
     cd <your enmaru checkout>
     pnpm email:update temp@yourdomain.com customer@example.com
     ```
   - Prod — pass the production `DATABASE_URL` explicitly instead:
     ```bash
     cd <your enmaru checkout>
     DATABASE_URL="<prod connection string>" node scripts/update-email.mjs temp@yourdomain.com customer@example.com
     ```

   The script prints the updated user, or errors if no row has the current email
   (wrong address, or wrong environment) or the new email is already taken.

The customer can then sign in with their real email and the initial password,
and change the password themselves via the "forgot password" link.

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
