# Testing

One layer for now: unit tests sit alongside the code they cover.

| Layer | Location                          | Scope                                                                       |
| ----- | --------------------------------- | --------------------------------------------------------------------------- |
| Unit  | `src/**/*.test.ts(x)` (colocated) | Components (Testing Library + jsdom), `server/` logic, `types/` conversions |

## Running

```bash
./cmd check              # the full CI gate: format check, lint, typecheck, unit
./cmd test unit          # Vitest only
pnpm test:unit:watch     # Vitest watch mode while developing
```

CI runs `./cmd check` on every push to `main` / `dev` and every pull request
targeting them ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)), so
`./cmd check` locally mirrors CI exactly.

## Placement

- **Colocate** a unit test next to the file it covers:
  `src/components/ReservationCard.test.tsx` beside
  `src/components/ReservationCard.tsx`. Vitest picks up
  `src/**/*.{test,spec}.{ts,tsx}` (see [`vitest.config.ts`](../vitest.config.ts)).

## What to test where

- **Unit** — behavior that can be verified without the real cloud services:
  component rendering and interaction, `server/` logic with `lib/` clients
  mocked, pure conversions in `types/`.

Feature behavior that crosses the tiers (page → server → page) is not covered by
CI — verify it by running the app against the dev cloud instances and exercising
it in a browser before merging.
