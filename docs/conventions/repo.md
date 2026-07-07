# Repo Conventions

## Branch flow: `feature` → `dev` → `main`

Two long-lived branches map to two Netlify environments:

- `dev` — the dev/staging environment (Netlify branch deploy,
  https://dev--marvelous-crepe-8a78fb.netlify.app)
- `main` — production (push deploys to https://enmaru.kasumin.biz)

Work branches (`feature/...`, `fix/...`, etc.) open their PR against `dev`. Once
verified on the dev deploy, `dev` is promoted to `main` to release. So merging a
work PR is _not_ releasing — promoting `dev` → `main` is. There is no release tag.
Keep both branches deployable: CI green, verified behavior.

## Branch naming

Branches use a `<type>/<description>` form. Common types:

- `feature/...` — new functionality
- `fix/...` — bug fix
- `chore/...` — documentation, configuration, or other non-behavior changes
- `refactor/...` — internal restructuring without behavior change

When the work has a related issue, prefix the description with the issue number
for traceability: `feature/12-reservation-list`, `chore/5-implementation-policy-docs`.

## Cutting a branch

Always cut a work branch from a freshly pulled `dev`:

```bash
git fetch origin
git switch -c feature/12-reservation-list origin/dev
```

Never branch from another feature branch, and never commit from a working tree
that still holds another branch's edits. A branch cut from stale or foreign
state drags other PRs' files into yours — migrations, `schema.prisma` state,
and pre-review copies of files a merged PR already fixed, which a merge would
then silently roll back. If two PRs genuinely must stack, set the dependent
PR's base branch accordingly and say so in its body.

Before opening the PR, verify the branch contains only your change:

```bash
git diff origin/dev --stat
```

Every listed file must belong to this PR. Anything unrelated means the branch
was cut or staged wrong — fix that before asking for review.

## Commits

- Small, focused commits; imperative mood for the subject line.
- Stage explicitly (`git add <paths>`), never `git add -A` / `git add .` from a
  working tree that may hold unrelated edits — that is how foreign files end up
  committed (see "Cutting a branch").
- Separate subject and body with a blank line; the body explains _why_ and _how_.
- Prefix the subject with an emoji to categorize the change:

| Emoji | Meaning                 |
| :---: | :---------------------- |
| `🔖`  | Version tag / release   |
| `✨`  | New feature             |
| `🐛`  | Bug fix                 |
| `♻️`  | Refactoring             |
| `🎨`  | UI/UX                   |
| `🐎`  | Performance             |
| `🔧`  | Tooling / configuration |
| `🚨`  | Tests                   |
| `📝`  | Documentation           |
| `💩`  | Deprecation             |
| `🗑️`  | Removal                 |
| `🚧`  | Work in progress        |

Keep history readable on `main`. On a working branch, commit however you need to
while working — but before merging, clean up the history (squash, rebase, reword)
so that what lands reads as a coherent set of meaningful commits.

## Database migrations

- **One squashed migration per PR.** Finalize the schema change first, then run
  `pnpm db:migrate` once. If iterating left several migration directories in
  the PR (e.g. a CREATE TABLE followed by an ALTER of the same table minutes
  later), squash them before review: delete the extra directories and
  regenerate a single migration's SQL from the schema diff —

  ```bash
  git show origin/dev:prisma/schema.prisma > /tmp/dev-schema.prisma
  pnpm exec prisma migrate diff \
    --from-schema /tmp/dev-schema.prisma \
    --to-schema prisma/schema.prisma \
    --script > prisma/migrations/<timestamp>_<name>/migration.sql
  ```

  Squashing is safe only while the migrations are unapplied outside your own
  dev work — which is the normal state until the PR merges.

- **Never edit or rename an applied migration.** Prisma records each applied
  migration's checksum in `_prisma_migrations`; changing the file afterwards
  makes every database that ran it report drift and demand a reset.
- Deploys do not run migrations; applying them to an environment is a manual
  step — see
  [`docs/operations.md`](../operations.md#running-database-migrations). Note
  that the dev database is shared by local development and the dev deploy, so
  `pnpm db:migrate` on a work branch changes it for everyone.

## Issues

- State precisely what is observed or what is needed — nothing less, nothing
  more. Speculation about causes belongs in a PR or a comment, not the issue
  body.
- Include observed details (timing, environment, error messages, reproduction
  steps) when they may be useful clues.
- Title is descriptive; no emoji or bracket prefix (e.g., `[Feature]`).
- Set properties (assignee, labels, etc.) appropriately.

## Pull Requests

- Describe what changes and why — precisely, no excess. The diff shows _what_;
  the description carries the _why_ and any non-obvious context.
- Record decisions: when an approach was chosen over alternatives, note the
  trade-offs that led to it. This prevents the same question from being
  re-evaluated later.
- Include evidence of verification (what was tested, what was observed) in a test
  plan. CI covers format / lint / typecheck / unit, but not feature behavior — see
  "Ship with care" in [`index.md`](index.md).
- Title is descriptive; no emoji or bracket prefix.
- Link the related issue with `Closes #N`.
- Before requesting review, walk the pre-review checklist in the PR template
  (branch cut from `dev`, `git diff origin/dev --stat` clean, at most one new
  migration).

## Coding agent setup

The canonical agent guide is [`AGENTS.md`](../../AGENTS.md). Point your coding
agent at it; `CLAUDE.md` already references it.
