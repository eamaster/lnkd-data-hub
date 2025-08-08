## LinkedIn Data Hub (via RapidAPI) — Next.js + Cloudflare Workers

Production-ready full-stack app that proxies LinkedIn data from `linkedin-api-data.p.rapidapi.com` through secure Cloudflare Workers. Frontend is Next.js (TypeScript + Tailwind), with JWT auth, Stripe subscription tiers, caching, and rate limiting. Local dev uses SQLite; production can use Postgres. RapidAPI keys are never exposed in the browser.

### Monorepo Layout
- `app/` — Next.js app (TypeScript, Tailwind, Prisma for local dev)
- `workers/` — Cloudflare Worker proxy (Hono + Zod, Cache API, KV rate-limiting)
- `infrastructure/` — CI/CD (GitHub Actions), deployment helpers
- `tests/` — Jest unit/integration tests, Cypress e2e
- `docs/` — OpenAPI spec, Postman collection, usage docs

### Quick Start (Local Dev)
1) Install
```bash
npm install
```
2) Env
```bash
cp .env.example .env
cp app/.env.example app/.env
```
3) DB (SQLite)
```bash
cd app && npx prisma migrate dev --name init && cd ..
```
4) Run Worker
```bash
cd workers && npm run dev
```
5) Run App
```bash
cd app && npm run dev
```

Configure the app to talk to the Worker via `NEXT_PUBLIC_WORKER_BASE_URL`.

### Deploy
- Use Cloudflare Workers for proxy. Set secrets with `wrangler secret put`.
- Use Cloudflare Pages for `app/`.
- See `docs/` for OpenAPI, curl examples, and Postman collection.

### Security
- Do not commit secrets. Use Cloudflare Secrets and Pages project env vars.
- All inputs validated and sanitized at the Worker.

### License
MIT
