## LinkedIn Data Hub (via RapidAPI) — Next.js + Cloudflare Workers

Production-ready full-stack app that proxies LinkedIn data from `linkedin-api-data.p.rapidapi.com` through secure Cloudflare Workers. Frontend is Next.js (TypeScript + Tailwind), with JWT auth, Stripe subscription tiers, caching, and rate limiting. Local dev uses SQLite; production can use Postgres. **RapidAPI keys are never exposed in the browser.**

---

## 🔐 **SECURITY WARNING**

**NEVER commit the following files:**
- `workers/.dev.vars` (contains real API keys)
- `app/.env` (contains secrets)
- Any file with actual API keys or secrets

**These files are in `.gitignore` - verify before pushing to GitHub!**

### Monorepo Layout
- `app/` — Next.js app (TypeScript, Tailwind, Prisma for local dev)
- `workers/` — Cloudflare Worker proxy (Hono + Zod, Cache API, KV rate-limiting)
- `infrastructure/` — CI/CD (GitHub Actions), deployment helpers
- `tests/` — Jest unit/integration tests, Cypress e2e
- `docs/` — OpenAPI spec, Postman collection, usage docs

### 🚀 Quick Start (Local Dev)

**1) Install Dependencies**
```bash
npm install
```

**2) Set Up Environment Variables**
```bash
# Copy example files
cp .env.example .env
cp workers/.dev.vars.example workers/.dev.vars
cp app/.env.example app/.env

# Edit workers/.dev.vars and add your REAL RapidAPI key
# IMPORTANT: Never commit this file!
```

**3) Initialize Database (SQLite)**
```bash
cd app
npx prisma migrate dev --name init
cd ..
```

**4) Run Worker (separate terminal)**
```bash
cd workers
npm run dev
# Worker runs on http://localhost:8787
```

**5) Run Frontend (another terminal)**
```bash
cd app
npm run dev
# App runs on http://localhost:3000
```

**6) Test Locally**
- Open http://localhost:3000
- Navigate to Search tab
- Search for "engineer"
- Click on a job to view details

---

## 🌐 **Production Deployment**

### Option 1: Automated Deployment (Recommended)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step guide.**

Quick summary:
1. Push code to GitHub (verify no secrets committed!)
2. Deploy Worker: `cd workers && wrangler deploy`
3. Set Worker secrets: `wrangler secret put RAPIDAPI_KEY`
4. Connect GitHub to Cloudflare Pages
5. Configure Pages environment variables

### Option 2: Manual Deployment Scripts

**Deploy Worker (PowerShell)**:
```powershell
.\infrastructure\deploy-worker.ps1
```

**Deploy Worker (Bash)**:
```bash
chmod +x infrastructure/deploy-worker.sh
./infrastructure/deploy-worker.sh
```

---

## 📚 **Documentation**

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[docs/openapi.yaml](./docs/openapi.yaml)** - API specification
- **[docs/curl-examples.md](./docs/curl-examples.md)** - API usage examples
- **[docs/postman_collection.json](./docs/postman_collection.json)** - Postman collection

---

## 🔒 **Security Best Practices**

- ✅ RapidAPI keys stored in Cloudflare Secrets (never in code)
- ✅ All inputs validated with Zod schemas
- ✅ CORS configured for specific origins only
- ✅ Rate limiting enforced per user/plan
- ✅ JWT-based authentication
- ✅ Sensitive data sanitized in logs
- ❌ **NEVER commit** `workers/.dev.vars` or `app/.env`

### License
MIT
