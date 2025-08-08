# Deploy Guide

## Cloudflare Workers (proxy)
1. Create KV namespace:
```bash
wrangler kv namespace create LINKEDIN_HUB_KV
```
2. Update `workers/wrangler.toml` with the KV id.
3. Set secrets:
```bash
cd workers
wrangler secret put RAPIDAPI_KEY
wrangler secret put JWT_SECRET
```
4. Deploy:
```bash
npm run -w workers deploy
```

## Cloudflare Pages (Next.js)
1. Create a Pages project targeting `app/` folder.
2. Set environment variables:
   - `NEXT_PUBLIC_WORKER_BASE_URL` to your Worker URL.
   - `DATABASE_URL` (use a managed DB for production; or disable auth features for demo).
3. Trigger a build from GitHub.
