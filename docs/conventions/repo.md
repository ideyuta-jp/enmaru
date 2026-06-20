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

## Commits

- Small, focused commits; imperative mood for the subject line.
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

## Coding agent setup

The canonical agent guide is [`AGENTS.md`](../../AGENTS.md). Point your coding
agent at it; `CLAUDE.md` already references it.
