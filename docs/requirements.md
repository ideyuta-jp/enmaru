# Requirements — what enmaru must do

The capabilities enmaru must provide and the rules they must obey, stated
independently of how they are built. This is the **What**; the **How** lives in
[`architecture.md`](architecture.md) (what runs where) and [`design.md`](design.md)
(where code lands). When a requirement here and an implementation detail there
disagree, this doc is wrong only if the capability changed — otherwise the
implementation is.

Everything here is technology-neutral on purpose: it must survive a swap of auth
provider, database, or notification channel without edits.

## Provenance

Requirements are derived from the spec authored by the service owner (合同会社
KASUMIN) and LAplust, mirrored at
[yoppii12/enmaru `docs/`](https://github.com/yoppii12/enmaru/tree/main/docs). That
spec mixes What and How, and its How assumes a Supabase stack this repo does not
use (see [`architecture.md`](architecture.md) — Logto / Neon / R2). **This doc is
the source of truth for What; the original spec is reference material only.** Its
implementation guide and DB schema are drafts to learn from, not contracts to
follow.

## The product in one sentence

enmaru connects 潜在保育士 (licensed but non-practicing childcare workers) with
保育園 (nurseries) for short-term work, and makes the relationship trustworthy by
letting both sides review each other **only after real work has happened**.

The two things that make it enmaru, not a generic job board:

- **Trust through mutual review.** Reviews are bidirectional and gated on completed
  work, so they reflect lived experience rather than intent.
- **Continuity over one-off.** The flow is designed so a good match can recur and
  grow into ongoing employment, not just fill a single shift.

## Actors

| Actor                  | Who                                        | Primary stance                              |
| ---------------------- | ------------------------------------------ | ------------------------------------------- |
| Seeker (潜在保育士)    | License holder, often with a career gap    | Wants flexible work, low re-entry pressure  |
| Nursery (保育園)       | Director / hiring staff                    | Wants to fill shifts and avoid mismatches   |
| Admin (事務局/KASUMIN) | Operator                                   | Keeps the service healthy and trustworthy   |
| Public (未ログイン)    | Anyone browsing                            | Evaluates the service before signing up     |

## Core lifecycle — the backbone

Every substantive capability hangs off one progression:

```
job posted → application → match agreed → work performed → work completed
           → mutual review → trust accumulates (informs the next match)
```

Modeled as a match state machine. The states are domain vocabulary (they appear in
the admin's operations runbook), not an implementation detail:

```
applied → screening → matched → working → completed → review_open → review_done
```

| Transition           | Trigger (who / when)                                    | Mode   |
| -------------------- | ------------------------------------------------------- | ------ |
| → applied            | Seeker submits an application                            | auto   |
| applied → screening  | Admin begins coordinating the match                     | manual |
| screening → matched  | Both sides agree                                        | manual |
| matched → working    | The work day arrives / work begins                      | manual |
| working → completed  | Both sides have filed a work-completion report          | manual |
| completed → review_open | Admin opens reviewing and sends review links         | manual |
| review_open → review_done | Both sides have submitted their review              | auto-derived |

Two requirements follow from this and must hold everywhere:

- **The set of legal transitions and who may cause each is a single rule**, not a
  per-screen decision. The operations runbook (spec `04_operations_manual.md`) is
  its behavioral specification.
- **Review eligibility is derived from match state**, never asserted ad hoc: a
  review may be submitted only at `completed` / `review_open`, and only by the two
  parties to that match.

## Capabilities (MVP)

What each actor must be able to do for the core flow to work end to end.

### Seeker

- Register and sign in; record agreement to the terms.
- Create and edit a profile: display name, area, preferred working styles, career
  gap, experience, what they value, strengths, NG conditions.
- Browse nurseries and their open job postings.
- Apply to a posting (optionally with a message and a contact-OK flag).
- File a work-completion report after a shift.
- Review the nursery after completion (numeric criteria + optional comment +
  "would work again" Yes/No).

### Nursery

- Register a nursery account and sign in.
- Create and edit a nursery profile: name, area, address, contact, concept, policy.
- Create, edit, open and close job postings (title, work content, date, time,
  optional hourly wage, target person, remarks).
- Receive and review incoming applications.
- File a work-completion report after a shift.
- Review the seeker after completion (numeric criteria + optional comment +
  "would rehire" Yes/No).

### Admin

- Drive matches through the state machine (the manual transitions above).
- Read the reviews, check them for problems, and control their publication
  (reviews start unpublished — see below).

### Public

- View the top page, the service explanation, the nursery list, individual nursery
  pages, and the terms / privacy pages.

## Cross-cutting requirements

These are properties of the system, not features of one screen. They constrain
every capability above.

- **Personal-information boundary.** Real name, street address, and phone number
  are visible to admin only. The public/seeker/nursery views of a profile are a
  strictly narrower shape than the stored record — the boundary must be
  structural, not a per-screen reminder.
- **Review-after-work.** Reviews cannot exist before `completed`. This is the same
  rule as the lifecycle constraint above, stated from the review's side.
- **Reviews start private.** A submitted review is not public by default; admin
  reviews content, then publication widens in stages. Aggregate scores shown
  publicly must respect the current publication scope.
- **Notifications.** The system notifies the relevant parties at lifecycle events
  (application received, match agreed, review requested, …). LINE is the primary
  channel and friend-adding the official account is required at registration;
  email is the fallback for users not reachable on LINE. Which event fires which
  message is a requirement; the channel is a swappable detail.
- **Device emphasis.** Seekers are phone-first, nurseries are PC-first. Both must
  work; neither is "desktop only" or "mobile only".

## Non-functional requirements

| Area          | Requirement                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| Privacy       | Protect personal data; enforce the information boundary above.              |
| SEO           | Public nursery and posting pages must be indexable by search engines.       |
| Usability     | Intuitive enough for non-technical nursery staff and returning seekers.     |
| Trust         | Evaluations reflect real, completed work.                                   |
| Extensibility | Capabilities are added in phases; the model must absorb the later phase without a rewrite. |
| Operability   | Keep the admin's manual workload low.                                       |
| Region        | Initial target is Nagasaki (default area selection).                        |

## Scope and phasing

Phasing is itself a requirement: it says what must work first and what may wait. It
does **not** license building the model so narrowly that the later phase forces a
rewrite — the data model is designed once, against all of the below.

### MVP — make the core flow work end to end

Auth & registration (incl. LINE friend-add path) · seeker profile · nursery
profile · job-posting CRUD · application · admin match management · work-completion
report · **mutual review (the most important capability)** · public pages · core
LINE notifications (application / match / review request).

### Later phase — additions from the spec (`06_feature_additions.md`)

Recorded as requirements now so the model accounts for them, built after the MVP
flow is proven:

- **Document gate.** Seekers submit documents (résumé info as form *or* upload,
  childcare license, health certificate, stool-test result); admin verifies each by
  eye (no auto-verification); a posting declares the documents it requires; applying
  is blocked until the required documents are verified.
- **Posting capacity & period.** Postings carry a slot count and a display window;
  reaching capacity or the end time auto-closes the posting; manual close is also
  possible; a closed posting cannot be reopened, but may be copied into a new one.
- **Visit (見学).** Modeled as a zero-wage posting reusing the existing
  posting/application/match/review flow — explicitly **not** a separate subsystem.
- **Groups (favorites).** A nursery can group seekers it has worked with and offer
  future postings to the group before the public.
- **Time clock.** Both sides confirm start/end in-app (no QR); a clock-in URL is
  pushed before the shift.
- **Past-worker document export.** Nurseries export verified documents of seekers
  who worked in a given period, for audits.
- Spec phase-2 items: nursery search/filtering, seeker list for nurseries, staged
  review publication, browse/apply history, admin dashboard & reports, settings,
  contact form.

### Undecided — needs design before it can be a requirement

Do not build these; their rules do not exist yet (spec `06` marks them "別途
ディスカッション"):

- Cancellation policy and penalties (both sides).
- Time-clock UX after the URL is opened.
- Group visibility toggle (public ↔ group-only) UI.
- No-show definition and automatic detection.

## What this doc deliberately omits

Schema, endpoints, directory layout, and stack choices are **How** and live
elsewhere ([`design.md`](design.md), [`architecture.md`](architecture.md)) or in
their own issues. If you came here for those, this doc has correctly refused to
answer.
