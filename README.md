# Food eQueue

Real-time food order queue system. Customers scan a QR code to track their order status; kitchen/counter staff manage the order queue from a staff-facing API.

## Tech Stack

| Layer | Technology |
|---|---|
| API | NestJS 10, TypeORM, SQLite, Socket.io, Passport JWT |
| Web | SvelteKit 2 (Svelte 5 runes), Tailwind CSS 4, Axios, socket.io-client |
| Monorepo | npm workspaces |
| CI/CD | Woodpecker CI → Docker Buildx → `docker compose` |

## Project Structure

```
food-equeue/
├── packages/
│   ├── api/     # NestJS backend (REST + WebSocket gateways)
│   └── web/     # SvelteKit customer-facing client
├── docs/        # Architecture notes
└── .woodpecker.yaml
```

The API is organized into `modules/client` (customer-facing, JWT-protected), `modules/staff` (kitchen/counter operations), and `modules/core` (shared domain entities like branches).

## Getting Started

### Prerequisites
- Node.js 22+
- npm

### Install

```bash
npm install
```

### Configure environment

Copy `packages/api/.example.env` to `packages/api/.env` and fill in the values:

| Variable | Description |
|---|---|
| `PORT` | API port (default `3002`) |
| `IS_DEV` | Enables dev-mode behavior |
| `IS_LOCAL_NETWORK_DEPLOY` | Serves the API for LAN access (kiosk/tablet use) |
| `CLIENT_APP_URL` | Public URL of the web client |
| `CLIENT_APP_LOCAL_NETWORK_URL` | LAN URL of the web client |
| `JWT_SECRET` | Secret for customer access tokens |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `3600s`) |

### Run in development

```bash
npm run dev        # runs API + web concurrently
npm run dev:api     # API only
npm run dev:web     # web only
```

The API starts on `http://localhost:3002` (or the LAN IP if `IS_LOCAL_NETWORK_DEPLOY=true`).

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

Pushes to `master` trigger the Woodpecker pipeline (`.woodpecker.yaml`): lint → build a Docker image (`packages/api/Dockerfile`) → `docker compose up -d` on the host.

## Architecture Notes

See [`docs/ARCHITECTURE-ANALYSIS.md`](docs/ARCHITECTURE-ANALYSIS.md) for the current analysis of the client/staff split, database choice, and scaling plan.
