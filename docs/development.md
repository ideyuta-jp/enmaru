# Development

The path from "I have a task" to "review requested". The conventions behind
each step live in [`conventions/repo.md`](conventions/repo.md).

## 1. Start the work item

```bash
cd </path/to/enmaru>
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

## Screenshots for the PR

UI changes should come with before/after screenshots in the PR description.
`pnpm screenshot` automates the capture against your local dev server —
including pages behind login (it drives the Logto sign-in for you).

One-time setup:

```bash
npx playwright install chromium   # downloads the browser the script drives
```

For authenticated pages, put a dev test account in `.env.local` (the account
must have a **password** in Logto — OTP-only accounts won't work):

```bash
SCREENSHOT_EMAIL="dev-test-account@example.com"
SCREENSHOT_PASSWORD="..."
```

Usage — with `pnpm dev` running:

```bash
pnpm screenshot /profile before   # signs in with SCREENSHOT_*
pnpm screenshot /profile after
pnpm screenshot /nursery/mypage after abc@example.com password   # one-off account via arguments
```

The second argument is a **name prefix without extension**. Each run writes
two full-page shots: `pnpm screenshot /profile before` produces
`before-mobile.png` (390×844) and `before-desktop.png` (1280×800). Both
patterns are gitignored, so they never end up in a commit. Drag the files
into the PR description to attach them.
