# Food eQueue — Architecture Analysis: Client vs Staff

Date: 2026-07-16
Context: the customer queue client app already exists; a staff client app and staff API are in progress. Expected scale — dozens of branches, dozens of orders per branch.

> **Update (2026-07-22):** Action item #3 (migrate SQLite → PostgreSQL) has been completed — the API now runs on Postgres, and a root `docker-compose.yml` provisions `postgres` + `api` + `web` together. The rest of this document reflects the state and recommendations as of the original analysis date; items #1, #2, #4, #5 in the action plan below are still open.

## Current state of the project

- **Monorepo (npm workspaces)**: `packages/api` (NestJS 10 + TypeORM + Socket.io) and `packages/web` (SvelteKit 2 / Svelte 5).
- The API is already logically split into `modules/client`, `modules/staff`, `modules/core`, `modules/shared` — a solid foundation for further separation.
- **Database — SQLite**, a single file in a Docker volume, deployed on one VPS via Woodpecker CI (`docker compose up`), currently running on a local network (`192.168.100.11`). *(See update above — this has since moved to PostgreSQL.)*
- **Critical finding**: the `staff` controllers (`staff-orders.controller.ts`, `staff-products.controller.ts`, etc.) currently have **no guards at all** — not a single staff endpoint is protected by authentication/authorization. This isn't an architecture question, it's a hole that needs closing before the staff API goes to production.

## 1. Should the staff API and client API be separated?

**Separate at the logic/security level — yes, right now. Separate at the physical deployment level (two services) — not yet.**

What's already been done (`modules/client` vs `modules/staff`) is the right first step, but it's not enough. Still needed:

- **A dedicated auth boundary for staff**: its own JWT audience/secret, its own guards, most likely username/password + roles (cashier/cook/manager/branch owner) rather than the hash-based identify flow used for customers. Don't reuse the `customer-auth` infrastructure for staff, even partially.
- **Dedicated route prefixes** — `/staff/*` already exists de facto; it's worth formalizing `/api/client/*` and `/api/staff/*` at the reverse-proxy/versioning level so traffic can be filtered/rate-limited by prefix later without refactoring.
- **Dedicated rate-limit/CORS policies** — both gateways currently use `origin: "*"`, which is especially risky for staff since that API can create/modify orders.

Splitting into two fully independent services only pays off once there's a concrete reason: different load profiles requiring independent scaling, different teams releasing independently, or a need for independent availability (staff API staying up even if the client API goes down, or vice versa). At "dozens of branches, dozens of orders per branch," that scale isn't there yet — two processes instead of one would mean double the operational overhead (two deployments, two configs, inter-service auth, duplicated access to shared order tables) without real benefit.

A modular monolith with clear internal boundaries — which is effectively what already exists — is the right choice at this stage. It also provides a low-cost path to extracting a staff service later if it's ever needed, since the module boundaries are already in place.

## 2. Which database fits best?

**Migrate to PostgreSQL.** SQLite is fine for a single local prototype, but at the stated scale (dozens of branches × dozens of orders, concurrent writes from cashiers/cooks alongside reads from the customer gateway) it will start to get in the way:

- SQLite allows a single writer at a time (file locking); concurrent order-status updates from staff plus reads from the customer gateway will become a bottleneck.
- No built-in replication/backup story, no managed offerings.
- Doesn't play well with horizontally scaling the API (multiple Node instances can't sensibly share one SQLite file).

Since TypeORM is already in use, migrating to Postgres is mostly mechanical (swap the driver, add migrations) rather than a rewrite of domain logic. The data is relational (orders, branches, products, customers with explicit relations), which favors Postgres over a document store (Mongo and similar would offer no benefit here, only a loss of integrity via FKs/transactions).

Not needed: NoSQL, sharded/distributed databases (CockroachDB, etc.) — that's a solution for a scale that's still far off, and not worth the operational complexity.

Hosting: either self-hosted Postgres in the same compose setup (since the project is already self-hosted on a VPS) or a managed option (Neon/Supabase/DO Managed Postgres) — managed removes the backup burden given the small team size.

## 3. Which platform should the staff client app be built on?

**A SvelteKit PWA — the same stack as the existing client app** — rather than a native app (React Native/Flutter) or Electron.

Reasoning:
- The Socket.io client, UI kit (`lib/components/ui`), store patterns (Svelte 5 runes), and stack familiarity already exist on the team — a second SvelteKit app adds almost no cognitive overhead.
- Based on the description, the staff app is a screen on a tablet/kiosk in the kitchen/register area: it doesn't need native phone APIs (background push, camera as a core feature, etc.) — a browser is enough. A PWA provides offline caching and "add to home screen" without an App Store/Play Store release cycle — for an internal tool this is significantly easier to maintain and update (ship once, every branch gets it immediately).
- A native app is only justified if a hard requirement emerges: receipt printer/barcode scanner SDK integration, kiosk-lock mode, reliable push while the screen is inactive. None of that is in the requirements yet, so it's not worth paying the native development cost upfront.

Structurally, in the monorepo: either a separate package `packages/staff-web` (a second SvelteKit app) or a route group inside the existing `packages/web`. Given that client and staff have fundamentally different auth models and likely different UX/layout, **a separate package is cleaner** than mixing two different role models under one layout in a single app. Either way, shared types/DTOs must go into `packages/shared` — it's currently empty, and adding a third client will triple the type duplication for order/status models if that isn't fixed first.

## Scaling under "dozens of branches × dozens of orders"

That order of magnitude is hundreds to low thousands of orders per day, and perhaps hundreds of concurrent socket connections at peak. A single Node instance + Postgres handles this comfortably — no microservices or queues needed. The one thing worth keeping in mind early: if more than one API instance behind a load balancer is ever needed (for availability, not for load), Socket.io across multiple instances without a Redis adapter will silently drop events between instances. That's not a problem today (single instance), but it's the first thing to add when scaling the API out — cheaper to know this now than to debug a "notification never arrived" bug in production across 30 branches.

## Action plan, in order

1. Close the guard gap on staff endpoints — this is a security blocker, not an architecture decision.
2. Introduce a dedicated auth boundary for staff (roles, JWT audience).
3. ~~Migrate SQLite → Postgres while the data volume is still small — cheap now, only gets more expensive later.~~ **Done (2026-07-22).**
4. Populate `packages/shared` before starting the third app.
5. Build the staff client as a separate SvelteKit PWA package in the same monorepo.
