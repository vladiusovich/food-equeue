# Food eQueue

Real-time food order queue system. Customers scan a QR code to track their order status; kitchen/counter staff manage the order queue from a staff-facing API.

## Tech Stack

| Layer | Technology |
|---|---|
| API | NestJS 10, TypeORM, PostgreSQL, Socket.io, Passport JWT |
| Web | SvelteKit 2 (Svelte 5 runes, `adapter-static` — client-rendered SPA), Tailwind CSS 4, Axios, socket.io-client |
| Monorepo | npm workspaces |
| Local/full-stack run | `docker-compose.yml` (postgres + api + web) |
| CI/CD | Woodpecker CI (`.woodpecker.yaml`) |

## Project Structure

```
food-equeue/
├── packages/
│   ├── api/     # NestJS backend (REST + WebSocket gateways), own Dockerfile
│   └── web/     # SvelteKit customer-facing client (static SPA), own Dockerfile + nginx.conf
├── docs/        # Architecture notes
├── docker-compose.yml   # postgres + api + web, for local/full-stack runs
├── .env.example          # template for docker-compose.yml variables
└── .woodpecker.yaml
```

The API is organized into `modules/client` (customer-facing, JWT-protected), `modules/staff` (kitchen/counter operations), and `modules/core` (shared domain entities like branches).

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Docker (only if running the full stack via `docker compose`)

### Option A — run the full stack with Docker Compose (recommended for a quick start)

```bash
cp .env.example .env   # fill in real values (DB credentials, JWT secret, etc.)
docker compose up --build
```

This builds and starts three containers:

| Service | URL | Notes |
| --- | --- | --- |
| `web` | <http://localhost:3001> | Static SPA served by nginx |
| `api` | <http://localhost:3000> | NestJS, connects to the `postgres` service |
| `postgres` | localhost:5432 (bound to `127.0.0.1` only) | Data persisted in the `postgres_data` volume |

Notes:

- `PUBLIC_FOOD_SERVER_URL` / `PUBLIC_FOOD_SERVER_SOCKET_URL` are inlined into the web bundle at **build time** (SvelteKit `$env/static/public`). Changing them requires `docker compose build web`, not just a restart.
- Setting `IS_DEV=true` in `.env` runs the database seeder on API startup (sample branches/products/orders — see `packages/api/src/modules/core/seeder/seeder.service.ts`), useful for a fresh empty Postgres volume.

### Option B — run packages natively (for day-to-day development)

Install dependencies from the repo root (npm workspaces):

```bash
npm install
```

Configure environment:

- API: copy `packages/api/.example.env` to `packages/api/.env` and fill in the values (see table below). Requires a reachable Postgres instance — either point `DB_HOST`/`DB_PORT` at the `postgres` service from `docker compose up postgres`, or use your own.
- Web: copy `packages/web/.env.example` to `packages/web/.env`.

| Variable | Description |
|---|---|
| `PORT` | API port (default `3002`) |
| `IS_DEV` | Enables dev-mode behavior (also runs the DB seeder) |
| `IS_LOCAL_NETWORK_DEPLOY` | Serves the API for LAN access (kiosk/tablet use) |
| `CLIENT_APP_URL` | Public URL of the web client |
| `CLIENT_APP_LOCAL_NETWORK_URL` | LAN URL of the web client |
| `JWT_SECRET` | Secret for customer access tokens |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `3600s`) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | PostgreSQL connection |

Run:

```bash
npm run dev        # runs API + web concurrently
npm run dev:api     # API only
npm run dev:web     # web only
```

The API starts on <http://localhost:3002> (or the LAN IP if `IS_LOCAL_NETWORK_DEPLOY=true`).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start API and web together |
| `npm run format:check` / `format:fix` | Prettier across the whole repo |

Package-specific scripts (build, lint, test) live in `packages/api/package.json` and `packages/web/package.json`.

## API Overview

| Area | Endpoints |
|---|---|
| Staff — Orders | `GET/POST/PUT /staff/orders` |
| Staff — Products | `GET/POST/PUT/DELETE /staff/products` |
| Staff — QR Code | `GET /staff/orders/qr-code` |
| Branches | `GET /branches` |
| Client — Auth | `POST /customer/auth/identify` |
| Client — Customer | `POST /customer/order` (JWT) |
| Client — Orders | `GET /orders`, `GET /orders/customer` (JWT) |

A Postman collection covering all endpoints is available in the team workspace ("Food eQueue").

## Deployment

Pushes to `master` trigger the Woodpecker pipeline (`.woodpecker.yaml`):

1. `build-api` — builds `packages/api` with Docker Buildx, tags the image `food-equeue/api:latest` and `food-equeue/api:<short-sha>`.
2. `build-web` — builds `packages/web` the same way, tagged `food-equeue/web:latest` / `food-equeue/web:<short-sha>`.
3. `deploy` — runs `docker compose -f docker-compose.yml up -d --force-recreate` on the CI host.

Both build steps use `output: type=docker`, meaning the image is written straight into the CI agent's local Docker daemon — there's no external registry (Docker Hub, GHCR, etc.) in this setup. That's why `deploy` can skip `--build`: `docker-compose.yml` pins `image: food-equeue/api:latest` / `image: food-equeue/web:latest` on those services, which are exactly the tags the build steps just produced, so compose picks them up directly instead of rebuilding.

### CI server (Woodpecker)

The Woodpecker server and agent that execute the pipeline above are **infrastructure external to this repository** — nothing in `food-equeue` starts them, and they live in their own project directory with their own `docker-compose.yml`. One Woodpecker instance can serve CI for several repositories, not just this one, which is why it's kept separate rather than vendored in here.

Reference (official docs):

- Woodpecker docs: <https://woodpecker-ci.org/docs/intro>
- Server configuration (all env vars): <https://woodpecker-ci.org/docs/administration/configuration/server>
- GitHub integration setup: <https://woodpecker-ci.org/docs/administration/configuration/forges/github>

#### Example: how this project's Woodpecker instance is run

This is the shape of the `docker-compose.yml` used to run the Woodpecker server/agent for this project (real values redacted to `XXXX` — see the table below for what each one is and where it comes from):

```yaml
services:
  woodpecker-server:
    image: woodpeckerci/woodpecker-server:v3
    ports:
      - 8000:8000
    volumes:
      - woodpecker-server-data:/var/lib/woodpecker/
    environment:
      - WOODPECKER_OPEN=true
      - WOODPECKER_HOST=XXXX
      - WOODPECKER_GITHUB=true
      - WOODPECKER_GITHUB_CLIENT=XXXX
      - WOODPECKER_GITHUB_SECRET=XXXX
      - WOODPECKER_AGENT_SECRET=XXXX
      - WOODPECKER_ADMIN=XXXX

  woodpecker-agent:
    image: woodpeckerci/woodpecker-agent:v3
    command: agent
    restart: always
    depends_on:
      - woodpecker-server
    volumes:
      - woodpecker-agent-config:/etc/woodpecker
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WOODPECKER_SERVER=woodpecker-server:9000
      - WOODPECKER_AGENT_SECRET=XXXX

volumes:
  woodpecker-server-data:
  woodpecker-agent-config:
```

| Variable | Description |
|---|---|
| `WOODPECKER_OPEN` | `true` lets any GitHub user who logs in register their own repos on this instance. Fine for a single-admin/personal setup; turn off before giving other people access. [Docs](https://woodpecker-ci.org/docs/administration/configuration/server#woodpecker_open) |
| `WOODPECKER_HOST` | The public URL this Woodpecker instance is reachable at. GitHub delivers webhooks (push events) here, and the OAuth login redirect goes through it too — `localhost` doesn't work for either. This is the ngrok forwarding URL in a local setup (see below). [Docs](https://woodpecker-ci.org/docs/administration/configuration/server#woodpecker_host) |
| `WOODPECKER_GITHUB` | `true` enables the GitHub forge integration. |
| `WOODPECKER_GITHUB_CLIENT` / `WOODPECKER_GITHUB_SECRET` | OAuth App credentials, created at GitHub → Settings → Developer settings → OAuth Apps → New OAuth App (<https://github.com/settings/developers>). The app's **Authorization callback URL** must be set to `<WOODPECKER_HOST>/authorize`. [Docs](https://woodpecker-ci.org/docs/administration/configuration/forges/github) |
| `WOODPECKER_AGENT_SECRET` | A shared secret so the agent can authenticate to the server — any random string, e.g. generated once with `openssl rand -hex 32`. Must be identical on both `woodpecker-server` and `woodpecker-agent`. [Docs](https://woodpecker-ci.org/docs/administration/configuration/server#woodpecker_agent_secret) |
| `WOODPECKER_ADMIN` | Email of the GitHub account that should get admin rights in the Woodpecker UI (must match the email on the GitHub account used to log in). [Docs](https://woodpecker-ci.org/docs/administration/configuration/server#woodpecker_admin) |

`woodpecker-agent` mounts `/var/run/docker.sock` from the host — that's what lets pipeline steps (`build-api`, `build-web`, `deploy`) run `docker buildx` and `docker compose` directly against the host's own Docker daemon, rather than in a nested/isolated Docker-in-Docker environment.

Start it: `docker compose up -d` (in that project's own directory) — UI at <http://localhost:8000>.

### Registering this repo with Woodpecker

Once the server is running and reachable (see ngrok section below if it's only on a local machine):

1. Open the Woodpecker UI and log in with the GitHub account that has access to `food-equeue`.
2. Find `food-equeue` in the repo list and enable it. Woodpecker registers a GitHub webhook on the repo automatically at that point — visible under the GitHub repo's **Settings → Webhooks**.
3. From then on, every push to `master` notifies Woodpecker via that webhook and triggers `.woodpecker.yaml`.

### Exposing the CI server to GitHub via ngrok

This project's Woodpecker instance runs on a local machine without a public domain, so [ngrok](https://ngrok.com/) is used to tunnel it to a public HTTPS URL — that's the URL GitHub actually sends webhooks and OAuth redirects to.

Official ngrok docs: <https://ngrok.com/docs>

1. [Sign up for a free ngrok account](https://dashboard.ngrok.com/signup) — required to get an auth token. The free tier is enough for this (one HTTPS tunnel, random subdomain).
2. Install the ngrok CLI (<https://ngrok.com/docs/getting-started/#step-1-install-ngrok>) and authenticate once with the token from the ngrok dashboard:

   ```bash
   ngrok config add-authtoken XXXX
   ```

3. Start the tunnel, pointing at the port the Woodpecker server listens on (`8000` here):

   ```bash
   ngrok http 8000
   ```

4. ngrok prints a forwarding URL, e.g. `https://xxxx-xxxx-xxxx.ngrok-free.dev`. Set that as `WOODPECKER_HOST` in the Woodpecker server's `.env`, and as the GitHub OAuth app's callback URL (`<forwarding-url>/authorize`) — then restart the Woodpecker server (`docker compose up -d`) so it picks up the new host.

**Free-tier caveat:** without a paid ngrok plan, the forwarding URL is random and changes every time the tunnel restarts. `WOODPECKER_HOST` and the GitHub OAuth app's callback URL need to be updated — and the Woodpecker server restarted — after every ngrok restart, or webhooks/login will silently fail against the stale URL. A paid ngrok plan (static domain) or a real public domain (VPS, Cloudflare Tunnel, etc.) removes this by surviving restarts.

### Deploying without Woodpecker

None of the above is required to run the project — it's only needed for push-to-deploy automation. For a manual deploy (or if Woodpecker isn't reachable), run the same steps `.woodpecker.yaml` automates by hand, or just use the plain Docker Compose flow described in [Option A](#option-a--run-the-full-stack-with-docker-compose-recommended-for-a-quick-start) above, which doesn't involve Woodpecker or ngrok at all.

## Architecture Notes

See [`docs/ARCHITECTURE-ANALYSIS.md`](docs/ARCHITECTURE-ANALYSIS.md) for the current analysis of the client/staff split, database choice, and scaling plan.
