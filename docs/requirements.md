# Requirements — what enmaru must do

The capabilities enmaru must provide and the rules they must obey, stated
independently of how they are built. This is the **What**; the **How** lives in
[`architecture.md`](architecture.md) (what runs where) and [`design.md`](design.md)
(where code lands).

Everything here is technology-neutral on purpose: it must survive a swap of auth
provider, database, or notification channel without edits.

## Provenance

Requirements are derived from the spec authored by the service owner (合同会社
KASUMIN), mirrored at
[yoppii12/enmaru `docs/`](https://github.com/yoppii12/enmaru/tree/main/docs). That
spec mixes What and How, and its How assumes a different stack than this repo uses.
This doc is the source of truth for What. The original spec — including its
implementation guide and DB schema — is reference material only, not a contract.

Scope decisions below also reflect what the reference implementation has actually
built (yoppii12's `feature/a1-5-notifications` branch), so that capabilities proven
there are treated as in-scope rather than deferred.

## The product in one sentence

enmaru connects 潜在保育士 (licensed but non-practicing childcare workers) with
保育園 (nurseries) for short-term work, and makes the relationship trustworthy by
letting both sides review each other **only after real work has happened**.

## Actors

| Actor                  | Who                                        | Primary stance                              |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| Seeker (潜在保育士)    | License holder, often with a career gap    | Wants flexible work, low re-entry pressure  |
| Nursery (保育園)       | Director / hiring staff                    | Wants to fill shifts and avoid mismatches   |
| Admin (事務局/KASUMIN) | Operator                                   | Keeps the service healthy and trustworthy   |
| Public (未ログイン)    | Anyone browsing                            | Evaluates the service before signing up     |

## Core lifecycle — the backbone

enmaru is built around one progression, from a posting to a reviewed piece of work:

```
nursery posts a job → seeker applies → seeker works the shift
→ both confirm completion → both review each other
```

These are the actions that drive the flow. The match's formal statuses are in the
table below.

**Matching is immediate and first-come.** The moment a seeker applies to a posting,
the match is formed and the posting closes to further applicants. There is no
separate screening or manual-approval step (per the spec's
`06_feature_additions.md`: 即時マッチング・面接なし・先着順).

A match then moves through three statuses:

| Status      | Meaning                                  | Entered when                                    |
| ----------- | ---------------------------------------- | ----------------------------------------------- |
| `matched`   | Seeker and nursery are paired            | Seeker applies (the posting closes, first-come) |
| `working`   | The shift is underway                    | Seeker marks the work as started                |
| `completed` | The shift is done and confirmed          | The work-completion report(s) are in            |

Review progress is tracked alongside the status: `none` → `partial` (one side has
reviewed) → `done` (both sides have reviewed). A review may be submitted only once
the match is `completed`, and only by the two parties to that match.

Two rules this implies, which must hold everywhere:

- **Which status changes are allowed, and who may cause each, is defined in one
  place** — not re-decided inside each screen. (This is a design instruction; it
  exists here because the lifecycle is the requirement it protects.)
- **Whether a review may be submitted is read from the match status (`completed`)
  and the reviewer's identity** — not re-checked with separate logic in each
  screen.

## Capabilities (MVP)

What each actor must be able to do for the core flow to work end to end. This set
mirrors what the reference implementation already has working.

### Seeker

- Register, sign in, and record agreement to the terms.
- Create and edit a profile: display name, area, preferred working styles, career
  gap, experience, what they value, strengths, NG conditions.
- Submit the required documents for admin verification: résumé information (as an
  in-app form **or** an uploaded image), childcare license, health certificate
  (some postings additionally require a stool-test result).
- Browse nurseries and their open job postings.
- Apply to a posting — allowed only when the documents that posting requires are
  verified. Applying forms the match immediately.
- Mark work as started, and file a work-completion report.
- Chat with the nursery within the match (time-bounded — see cross-cutting rules).
- Review the nursery after completion (numeric criteria + optional comment +
  "would work again" Yes/No).

### Nursery

- Register a nursery account, sign in, and record agreement to the terms.
- Create and edit a nursery profile: name, area, address, contact, concept, policy.
- Create, edit, and close job postings (title, work content, date, time, optional
  hourly wage, target person, remarks), and set which documents each posting
  requires.
- See incoming matches.
- File a work-completion report (see open question below).
- Chat with the seeker within the match (time-bounded).
- Review the seeker after completion (numeric criteria + optional comment +
  "would rehire" Yes/No).

### Admin

- Verify or reject submitted documents one by one, by eye (no auto-verification). A
  rejection carries a reason and notifies the seeker.
- Oversee matches; correct a match's status when needed (the normal flow is
  automatic, per the lifecycle above).
- Read submitted reviews, check them for problems, and control their publication
  (reviews start private — see below).

### Public

- View the top page, the service explanation, the nursery list, individual nursery
  pages, and the terms / privacy pages.

## Cross-cutting requirements

These are properties of the system, not features of one screen. They constrain
every capability above.

- **Personal-information boundary.** Real name, street address, and phone number
  are visible to admin only. The public / seeker / nursery views of a profile are a
  strictly narrower shape than the stored record — the boundary must be
  structural, not a per-screen reminder.
- **Document gate.** A seeker can apply to a posting only when every document that
  posting requires has been verified by admin. Verification is manual.
- **Review-after-work.** Reviews cannot exist before a match is `completed`. This
  is the lifecycle constraint above, stated from the review's side.
- **Reviews start private.** A submitted review is not public by default; admin
  reviews the content, then publication widens in stages. Any aggregate score shown
  publicly must respect the current publication scope.
- **Time-bounded chat.** Chat within a match is available from when the match forms
  until 24 hours after the work is completed; outside that window it is closed.
- **Notifications.** The system must notify the relevant parties at key lifecycle
  events — at least: a match forming, a document being verified or rejected, and a
  review being requested. LINE is the primary channel (the official account is
  friend-added at registration); email is the fallback for users not reachable on
  LINE.
- **Device emphasis.** Seekers are phone-first, nurseries are PC-first. Both must
  work well.

## Non-functional requirements

| Area            | Requirement                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| Privacy         | Protect personal data; enforce the information boundary above.                       |
| Discoverability | Public nursery and posting pages must be findable by search engines.                 |
| Usability       | Intuitive for non-technical nursery staff and seekers; keep the admin's manual operating load low. |
| Trust           | Evaluations reflect real, completed work.                                            |
| Region          | Initial target is Nagasaki (default area selection).                                 |

## Scope and phasing

Phasing says what must work first and what may wait. The split also reflects the
reference implementation: capabilities already built there are MVP, not deferred.

### MVP — the core flow, end to end

Auth & registration (incl. terms agreement and the LINE friend-add path) · seeker
profile · nursery profile · job-posting CRUD with per-posting required documents ·
document submission & admin verification · application with the document gate
(immediate, first-come match) · work-start & work-completion reporting · mutual
review with admin-controlled publication · time-bounded chat · in-app and LINE
notifications · public pages.

### Later phase — additions not yet built

Recorded now so the model accounts for them; built after the MVP flow is solid:

- **Posting capacity & display window.** A posting carries a slot count and a
  start/end window; reaching capacity or the end time auto-closes it; manual close
  is also possible; a closed posting cannot be reopened, but may be copied into a
  new one.
- **Visit (見学).** Modeled as a zero-wage posting reusing the existing flow —
  explicitly **not** a separate subsystem.
- **Groups (favorites).** A nursery can group seekers it has worked with and offer
  future postings to the group before the public.
- **Time clock.** Both sides confirm start/end in-app (no QR); a clock-in URL is
  pushed before the shift.
- **Past-worker document export.** Nurseries export verified documents of seekers
  who worked in a given period (ZIP, filtered by last work date), for audits.
- Spec phase-2 items: nursery search/filtering, seeker list for nurseries, staged
  review publication, browse/apply history, admin dashboard & reports, settings,
  contact form.

### Undecided — needs design before it can be a requirement

Do not build these; their rules do not exist yet (the spec marks them "別途
ディスカッション"):

- Cancellation policy and penalties (both sides).
- Time-clock UX after the URL is opened.
- Group visibility toggle (public ↔ group-only) UI.
- No-show definition and automatic detection.

## Open questions — confirm with KASUMIN

- **Does the nursery also file a work-completion report?** The spec and the
  reference implementation both have *both* sides report, and gate `completed` on
  both. The likely rationale is mutual confirmation that the shift actually happened
  before reviews open. Confirm whether the nursery must report too, or whether the
  seeker's report (perhaps with a lightweight nursery acknowledgement) is enough.

## What this doc deliberately omits

Schema, endpoints, directory layout, and stack choices are **How** and live
elsewhere ([`design.md`](design.md), [`architecture.md`](architecture.md)) or in
their own issues. If you came here for those, this doc has correctly refused to
answer.
