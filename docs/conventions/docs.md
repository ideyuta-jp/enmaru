# Documentation

These docs exist so that developers can work together without friction. Every
choice about what to include — and what to leave out — should serve that.

Two things make a doc useful:

- **The location for any question is obvious.** A reader arrives with a question,
  not a file. If they cannot tell at a glance which doc owns the answer, the
  structure has failed.
- **It carries what code cannot say on its own.** Hidden constraints, deploy
  behavior, placement rules, assumptions a name does not carry. Anything a reader
  can already pick up from the code, the diff, or a directory listing is
  restatement, and restatement raises cognitive cost rather than lowering it.

Cut what is already visible. Keep cutting only while a first-time reader can still
find the answer easily — past that point, brevity makes the doc harder to read,
not easier.

## Where to write what

Every fact has exactly one home; everywhere else links to it instead of repeating
it. When adding documentation, find the owning doc below — only create a new doc
when none of these owns the question.

| The reader's question                                               | Home                                         |
| ------------------------------------------------------------------- | -------------------------------------------- |
| What must the product do? Capabilities, rules, scope                | [`docs/requirements.md`](../requirements.md) |
| How do I set this up and run it? Commands, env vars, deploys        | [`README.md`](../../README.md)               |
| How is the system put together? What talks to what, directory roles | [`docs/architecture.md`](../architecture.md) |
| Where does this new code go?                                        | [`docs/design.md`](../design.md)             |
| How should the code be written? Style, naming, imports              | [`docs/conventions/coding.md`](coding.md)    |
| How do we branch / commit / write issues and PRs?                   | [`docs/conventions/repo.md`](repo.md)        |
| Where do tests live and how do they run?                            | [`docs/testing.md`](../testing.md)           |
| How do I write or run e2e tests specifically?                       | [`e2e/README.md`](../../e2e/README.md)       |
| What must a coding agent know before touching code?                 | [`AGENTS.md`](../../AGENTS.md)               |

For in-code comments, see [coding.md](coding.md#comments). The principles overlap,
but apply differently: code is read line by line, while docs are reached through
search and structure.
