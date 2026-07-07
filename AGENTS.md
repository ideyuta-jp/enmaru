<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project rules

Before writing code, read [`docs/design.md`](docs/design.md) — it defines where
every kind of code lands (directory roles, data-flow patterns, dependency
direction). Style and workflow rules are in
[`docs/conventions/`](docs/conventions/index.md). Start navigating from the
[README](README.md#where-to-look-next).

# Branch & PR discipline

Hard rules — violations have shipped PRs that carried other branches' files and
rolled back merged fixes (details:
[`docs/conventions/repo.md`](docs/conventions/repo.md)):

- Cut every work branch from freshly pulled `dev`
  (`git fetch origin && git switch -c <branch> origin/dev`). Never branch from
  another feature branch unless the PR is explicitly stacked and its body says
  so.
- Stage only the files that belong to the change. Never `git add -A` /
  `git add .` in a working tree that may hold unrelated edits.
- Before opening a PR, run `git diff origin/dev --stat` and confirm every
  listed file belongs to this change. Anything unrelated: stop and remove it.
- A PR ships at most one new migration. Finalize the schema, then run
  `pnpm db:migrate` once; if iteration created several migration directories,
  squash them before review
  ([procedure](docs/conventions/repo.md#database-migrations)).
