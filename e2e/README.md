# E2E Tests

Playwright-based end-to-end tests. They run on the host: Playwright starts the app via its
`webServer` config (no Docker). `e2e/` is a standalone npm package so the heavy Playwright
browser deps stay isolated from the pnpm-managed app.

## Setup (one-time)

Install the e2e deps and the Playwright browser:

```bash
./cmd test e2e-setup
```

## Running Tests

Run from the repository root:

```bash
./cmd test e2e
```

Playwright launches the app (`pnpm dev`) and waits for it, then runs the specs against it.
If a dev server is already running on the base URL it is reused (locally). A trace is
recorded for every test case (screenshots, DOM snapshots, network logs).

The base URL defaults to `http://localhost:3000`; override it with `E2E_BASE_URL`.

## Viewing Reports

```bash
./cmd test e2e-report
```

Opens the HTML report with a trace viewer for each test.

## File Structure

```
e2e/
├── fixtures/
│   └── index.ts          # Central import point for test/expect
├── pages/
│   └── HomePage.ts       # Page Object Model
├── specs/
│   └── smoke.spec.ts      # Test scenarios
├── package.json
└── playwright.config.ts
```

### `playwright.config.ts`

- **`testDir`**: `./specs`
- **`use.baseURL`**: app URL under test (`E2E_BASE_URL`, default `http://localhost:3000`), so specs can use `page.goto('/')`
- **`use.trace`**: records a trace for every test
- **`reporter`**: `list` (terminal) + `html` (browser report)
- **`webServer`**: starts the root app (`pnpm dev`) and waits for `baseURL`; reuses an existing server locally

### `pages/` — Page Object Model (POM)

Each file represents one page and exposes its interactions as methods, encapsulating
locators and actions. When the UI changes, only the POM file needs updating.

### `specs/` — Test scenarios

`*.spec.ts` files describing _what_ to test. They import `test`/`expect` from
`../fixtures` and use the Page Objects in `pages/`.

```
specs/  (what to test)
    ↓ uses
pages/  (how to operate the UI)
    ↓ uses
Playwright API  (browser control)
```

### `fixtures/` — Shared test setup

`index.ts` re-exports `test` and `expect` from `@playwright/test`. As the suite grows,
additional fixtures (DB seed, API client, auth) can be composed here without changing
spec imports.

## Writing Tests

1. Add a Page Object in `pages/` if interactions are shared:

```typescript
// pages/UserPage.ts
import {Page, expect} from '@playwright/test';

export class UserPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/users');
  }
}
```

2. Create a spec that uses it:

```typescript
// specs/user.spec.ts
import {test, expect} from '../fixtures';
import {UserPage} from '../pages/UserPage';

test('user list is displayed', async ({page}) => {
  const userPage = new UserPage(page);
  await userPage.goto();
  await expect(page.getByRole('heading', {name: 'Users'})).toBeVisible();
});
```

### Common Playwright APIs

```typescript
await page.goto('/path');
page.getByRole('button', {name: 'Submit'});
page.getByText('Users');
page.getByLabel('Name');
await page.getByRole('button').click();
await expect(page).toHaveURL(/\/users/);
await expect(page.getByText('Done')).toBeVisible();
```
