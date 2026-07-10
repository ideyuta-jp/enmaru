# Development

The path from "I have a task" to "review requested". The conventions behind
each step live in [`conventions/repo.md`](conventions/repo.md).

## 1. Start the work item

```bash
cd <your enmaru checkout>
pnpm work:start <type>/<name>
```

`type` is one of `feature` / `fix` / `chore` / `refactor`. `<name>` is
kebab-case; starting it with the issue number is recommended
(`feature/130-preview-button`).

The command fetches, makes sure the working tree is clean — leftovers from
earlier work are listed and you choose stash / delete / abort — and creates
the branch **at the tip of `origin/dev`. Every work branch starts there, no
exception.** Nothing is ever deleted without your confirmation.

## 2. Develop

```bash
pnpm dev        # http://localhost:3000
```

Changed `prisma/schema.prisma`? Finalize the change first, then run
`pnpm db:migrate` once.

## 3. Check

```bash
./cmd check     # the exact gate CI runs
```

## 4. Commit

```bash
git status      # look at what you are about to stage
git add -A
git commit      # emoji-prefixed subject (see conventions/repo.md)
```

## 5. Open the PR and request review

```bash
git fetch origin
git diff origin/dev --stat    # every listed file yours? then:
git push -u origin <branch>
gh pr create --base dev
```

Fill in the template, tick its checklist, and request a review. Before the
PR opens, the branch history is squashed into reviewable commits — when a
coding agent drives the work, the agent does this.
