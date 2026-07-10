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

- Start every work item with `pnpm work:start <type>/<name>`. It fetches,
  guarantees a clean working tree (leftovers are stashed or removed —
  interactively, or abort without a TTY), and creates the branch **at the tip
  of `origin/dev` — every work branch starts there, no exception**. Do not
  hand-roll branch creation.
- Dependent work is serialized: wait for the parent PR to be reviewed and
  merged, then start the child from the updated `dev`. Stacking on an
  unmerged branch is an expert-mode exception — declare it in the PR body
  (see docs/conventions/repo.md "Dependent work").
- Keep the working tree owned by exactly one work item. Files that should
  never be tracked belong in `.gitignore`; check `git status` before staging.
- Before opening a PR, run `git fetch origin && git diff origin/dev --stat`
  and judge every listed file against the work item's scope. This gate is
  yours to run — do not delegate it to the human. Anything you cannot explain
  from the issue: stop, report it, and remove it.
- Before requesting review, squash the branch's commits into a coherent set —
  one commit per logical change, often just one. Iteration noise (typo fixes,
  formatting passes, "wip") must not reach the reviewer. This cleanup is your
  job, not the human's.
- A PR ships at most one new migration. Finalize the schema, then run
  `pnpm db:migrate` once; if iteration created several migration directories,
  squash them before review
  ([procedure](docs/conventions/repo.md#database-migrations)).
