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

   The script shows the target database host (labelled dev / prod when it is a
   known Neon endpoint) and the matched user, then asks for confirmation before
   writing anything (add `--dry-run` to stop after the preview). It errors if
   no user has that email — e.g. they haven't registered yet, or registered on
   a different environment than the one `DATABASE_URL` targets.

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

   The script shows the target database host (labelled dev / prod when it is a
   known Neon endpoint) and the matched user, then asks for confirmation before
   writing anything (add `--dry-run` to stop after the preview). It errors if
   no row has the current email (wrong address, or wrong environment) or the
   new email is already taken.

The customer can then sign in with their real email and the initial password,
and change the password themselves via the "forgot password" link.

## Replacing a seeker's 保有資格

`SeekerProfile.licenses` stores each qualification's label text, so changing
`LICENSE_OPTIONS` in `SeekerProfileForm` leaves existing profiles on the old
label. A checkbox no longer exists for it, so the seeker sees it (rendered by
`CheckboxGroup` as a retired value) and can uncheck it — but they cannot be
migrated automatically when one option was split into several, because only
they know which one they hold.

That is the case for #211, which split 幼稚園教諭免許 into 一種/二種/専修免許状.
Ask the affected seekers which one they hold, then apply each answer:

```bash
cd <your enmaru checkout>
# Dev
pnpm license:replace seeker@example.com 幼稚園教諭免許 幼稚園教諭一種免許状 --dry-run
# Prod — pass the production DATABASE_URL explicitly instead
DATABASE_URL="<prod connection string>" node scripts/replace-license.mjs \
  seeker@example.com 幼稚園教諭免許 幼稚園教諭一種免許状
```

The script shows the target database host (labelled dev / prod when it is a
known Neon endpoint) and the before/after array, then asks for confirmation
before writing anything (add `--dry-run` to stop after the preview). It
refuses a replacement that is not one of the current `LICENSE_OPTIONS`, a
seeker who does not hold the old label, and one who already holds the new one.
The replaced value keeps its position in the array.

Find who still needs it with:

```sql
SELECT u."email", p."realName", p."licenses"
FROM "SeekerProfile" p
JOIN "User" u ON u."id" = p."userId"
WHERE '幼稚園教諭免許' = ANY(p."licenses");
```

## Running database migrations

Deploys apply migrations automatically: the Netlify build command is
`pnpm exec prisma migrate deploy && pnpm run build`, so every deploy first
applies the pending committed migrations to that deploy context's database —
the prod Neon branch for production deploys (from `main`), the dev Neon branch
for `dev` branch deploys — and only then builds. Neon branches are database
branches, unrelated to the git branches beyond this mapping: there is no `prod`
git branch. If the migration step fails, the build fails and the
previous deploy keeps serving. One caveat: if the migration succeeds but the
subsequent build fails, the schema is already updated while the old code is
still live — recover by fixing the build and redeploying.

The build-time migration connects through `DATABASE_URL_UNPOOLED`, a Netlify
environment variable holding the **direct (unpooled)** connection string, set
per deploy context (Production / Branch deploys) alongside the pooled
`DATABASE_URL` the runtime uses. `prisma migrate` needs session features the
Neon pooler doesn't support, so `prisma.config.ts` points the Prisma CLI at
`DATABASE_URL_UNPOOLED` when it is set, falling back to `DATABASE_URL` (local
dev sets only the latter, already the direct endpoint).

New migration files are still created during development with `pnpm db:migrate`
(`prisma migrate dev`, dev Neon branch only); applying already-committed migrations
to an environment uses `prisma migrate deploy`, which the deploy now runs for
you.

**Never run `pnpm db:migrate` against prod** — `migrate dev` is for authoring
migrations (shadow database, interactive, can reset). Prod only ever gets
`migrate deploy`, which applies pending committed migrations non-interactively.

### Applying migrations manually (fallback)

Normally deploys handle this. Run `migrate deploy` by hand only when a
database needs migrating outside a deploy — e.g. recovering from a failed
build-time migration, or baselining.

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
   DATABASE_URL_UNPOOLED='<prod direct connection string>' pnpm exec prisma migrate deploy
   ```
   Use `DATABASE_URL_UNPOOLED` (not `DATABASE_URL`) — it is what
   `prisma.config.ts` prefers, so the inline value wins over anything in
   `.env.local` and the command cannot silently target the dev database. It
   applies any pending migrations, or prints "No pending migrations" if the
   database is already up to date.

If the database already has tables but no Prisma migration history, `migrate
deploy` stops with `P3005` (schema not empty) — that database must be baselined
first; do not force it blindly.

The same command migrates **dev** with the dev Neon branch's direct connection
string in `DATABASE_URL_UNPOOLED` (or just run `pnpm db:migrate` locally, which
both creates and applies against the dev Neon branch from `.env.local`).
