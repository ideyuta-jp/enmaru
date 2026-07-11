# Design — where code lands

A conceptual map of the codebase: which **role** a piece of code plays (which
directory owns it) and which **concept** it is about. Use this to decide where new
code should land. The failure mode this doc exists to prevent: implementations of
the same role scattered across many places, which makes the application impossible
to operate long-term.

## How to use this doc

Before adding a module or function, locate:

1. **Role**: what kind of code is this? (routing, UI, domain logic,
   external-service client, shared type, client-side HTTP)
2. **Concept**: what is this code _about_? (user, reservation, file, …)

If both questions resist a clean answer, you are almost certainly trying to solve
more than one problem at once. Split it into smaller problems first, then place
each piece.

## Roles

One directory per role under `src/`:

| Directory     | Role                                                                                            | Runs on          |
| ------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| `app/`        | Routing surface: pages, layouts, route handlers. Wires a URL to implementations — keep it thin. | server (entry)   |
| `components/` | UI building blocks.                                                                             | server or client |
| `server/`     | Domain logic: Prisma queries, R2 operations, Server Actions.                                    | server only      |
| `services/`   | Client-side HTTP layer: typed wrappers around this app's own route handlers.                    | client only      |
| `lib/`        | Clients/config for external managed services (Neon/Prisma, R2, Logto).                          | server only      |
| `types/`      | Types shared between server and client code.                                                    | both             |
| `utils/`      | Pure, domain-agnostic helper functions shared between server and client code.                   | both             |
| `generated/`  | Generated code (Prisma client). Never edited by hand.                                           | server only      |

### `app/` — routing only

Next.js dictates this directory's structure (the file path is the URL). Treat it as
the routing surface and nothing more:

- A `page.tsx` composes components and awaits `server/` functions for its data.
  Logic beyond that belongs in `server/` (behavior) or `components/` (UI).
- A `route.ts` parses and validates the request, calls one `server/` function, and
  shapes the response. No domain logic inline.
- Prefer placing non-route code outside `app/` in the role directories rather than
  colocating it inside route segments.

### `server/` — domain logic

- One file per concept (`server/reservation.ts`), not grab-bag files
  (`server/utils.ts`).
- The only code that imports `lib/` clients and the `generated/` Prisma client.
- Server Actions (`'use server'`) live here, next to the logic they expose
  (e.g. `server/auth.ts`).
- Must never reach the client bundle. The only thing client code may import from
  `server/` is a `'use server'` file — React compiles that into an RPC stub.
- **Authorization belongs here, at the data layer.** A `server/` function that
  returns or mutates real data must verify the caller's role/ownership itself
  (e.g. via `requireRole`), not assume an upstream guard ran. The route-group
  `layout.tsx` guards (`app/(seeker|nursery|admin)/layout.tsx`) are redirect UX
  and protect direct/initial requests, but Next does not re-run layouts on
  client-side soft navigation between sibling pages — so the layout is not the
  authorization boundary for data.

### `components/` — UI

- Receive data via props; trigger mutations via Server Actions.
- Components never talk to the network themselves — reads come from the page,
  client-side fetching goes through `services/`.
- Put `'use client'` on the leaf interactive component, not on a page or layout.
  Everything imported from a client module joins the client bundle.

### `services/` — client-side HTTP

- The only place client code is allowed to call this app's route handlers.
- A `services/` file exists only when a concept actually needs client-side
  fetching (see the table below). Reads that happen at render time do not go
  through HTTP at all.

### `lib/` — external service clients

- Knows how to _connect_ (endpoints, credentials, client construction, env vars);
  knows nothing about the domain. Domain usage of these clients lives in
  `server/`.
- One file per service. A new managed service means a new `lib/` file, not inline
  client construction at the call site.

### `types/` — shared shapes

- Domain types shared across tiers, one file per concept
  (`types/Reservation.ts`).
- Leaf module: imports nothing from `src/`.
- Non-trivial value conversion between wire shape and domain shape (e.g. unix
  timestamp → `Date`) lives here as `encodeXxx` / `decodeXxx` helpers, colocated
  with the type they convert.

### `utils/` — shared pure helpers

- Pure, domain-agnostic functions usable from both tiers (date formatting,
  string/array helpers, …). No I/O, no env access, no React.
- One file per topic (`utils/date.ts`) — never a single grab-bag `utils.ts`.
- Leaf module like `types/`: imports nothing from `src/`.
- Placement test before adding a function here: if it knows a domain concept, it
  belongs with that concept (`types/` for conversions, `server/` for behavior);
  if it touches env vars or `lib/` clients, it is not tier-neutral and belongs
  in `server/` or `lib/`.

## Data flow — pick the pattern

| You need                                                                 | Use                                                                         | Lands in                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| Page data (read at render)                                               | Server Component awaits a `server/` function directly — no HTTP to yourself | `app/**/page.tsx` → `server/`                             |
| Mutation from the UI                                                     | Server Action invoked from a form `action` or event handler                 | `server/`, invoked from `components/`                     |
| Client-side fetching (polling, search-as-you-type, load-on-interaction)  | Route handler + `services/` wrapper                                         | `app/api/**/route.ts` → `server/`; called via `services/` |
| Endpoint for an external caller (webhook, OAuth callback, file download) | Route handler                                                               | `app/**/route.ts` → `server/`                             |
| Talking to a new managed service                                         | Client singleton                                                            | `lib/`, used from `server/`                               |

Server Actions are the default mutation path. Route handlers are for callers that
are not this app's UI, or for cases where a URL is the contract (webhooks,
redirects, downloads).

Server Actions return `ActionResult` (`src/types/ActionResult.ts`) and leave
navigation to the caller — the client checks `result.ok` and runs
`router.push(...)` itself. Never end an action that a client component awaits
with `redirect()`: this Next.js signals an action redirect by **rejecting** the
awaited promise (navigation is handed off to the RedirectBoundary separately),
so a client-side `catch` reads every success as a failure — the false
"registration failed" bug of #81. `redirect()` inside an action is reserved for
genuine auth bounces (e.g. the session died mid-form), where landing on the
sign-in page matters more than the transient error state.

## One concept, many manifestations

Roles are concept-neutral: a single domain concept appears once per role it needs.
For a concept `reservation`:

- `prisma/schema.prisma` — the model
- `src/types/Reservation.ts` — the shared type
- `src/server/reservation.ts` — queries, mutations, Server Actions
- `src/app/reservations/page.tsx` — the route
- `src/components/ReservationCard.tsx` — the UI
- `src/app/api/reservations/route.ts` + `src/services/reservation.ts` — only if
  the concept needs client-side fetching

All manifestations share the concept's name, so finding every piece of
`reservation` is a filename search. When adding to an existing concept, extend its
existing files; do not start a parallel home for it.

## Dependency direction

```
app/ ──▶ components/ ──▶ services/ ──▶ types/, utils/
 │             │
 │             └─(Server Actions only)─┐
 ├──▶ server/ ◀────────────────────────┘
 │      ├──▶ lib/ ──▶ generated/
 │      └──▶ types/, utils/
 └──▶ lib/ (wiring-level glue only, e.g. auth callback)
```

- Nothing imports from `app/` — routes are entry points, not a library.
- `server/` never imports `services/`: server code calls `server/` functions
  directly, never its own HTTP API.
- `types/` and `utils/` are leaves any role may import; they import nothing
  from `src/`. `lib/` imports only external packages and `generated/`.

A reverse arrow is a smell: it usually means domain logic has leaked into the
wrong role.

## Anti-patterns

- **Infrastructure outside its role**: Prisma, R2, or Logto imports anywhere but
  `server/` / `lib/`. The blast radius of a service change must stay inside one
  directory.
- **Components fetching**: `fetch`/HTTP calls in `components/` or `app/` pages.
  Reads belong to the Server Component, client fetching to `services/`.
- **Fat routes**: domain logic written inline in `page.tsx` or `route.ts`. The
  routing layer should read as a wiring diagram.
- **Wholesale `'use client'`**: marking a page or layout as a client component
  drags everything below it into the client bundle.
- **Grab-bag modules**: a `utils.ts` / `helpers.ts` file accumulating unrelated
  code. Shared pure helpers go to `utils/` as topic-named files; everything
  else belongs to a concept or role directory.
