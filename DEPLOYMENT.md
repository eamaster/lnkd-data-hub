# 🚀 Deployment Guide - LinkedIn Data Hub

This guide covers deploying the application to production with **Cloudflare Workers** (backend) and **Cloudflare Pages** (frontend).

---

## 📋 Prerequisites

1. **Cloudflare Account**: https://dash.cloudflare.com/
2. **GitHub Account**: For source code hosting
3. **RapidAPI Key**: https://rapidapi.com/rockapis/api/linkedin-api-data
4. **Node.js 18+** and **npm**
5. **Wrangler CLI**: `npm install -g wrangler`

---

## 🔐 **CRITICAL SECURITY STEPS** (Do This First!)

### 1. Secure Your Secrets

The file `workers/.dev.vars` contains **REAL API KEYS** and must **NEVER** be committed to GitHub!

```bash
# Verify .gitignore includes these:
cat .gitignore
```

Ensure these lines are in `.gitignore`:
```
.env
.env*.local
workers/.dev.vars
app/.env
app/.env*.local
```

### 2. Remove Secrets from Git History (if already committed)

```bash
# Check if secrets were committed
git log --all --full-history -- workers/.dev.vars

# If found, remove from history (DANGER: rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch workers/.dev.vars" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🛠️ **Step 1: Set Up Cloudflare Workers (Backend)**

### 1.1 Login to Cloudflare

```bash
wrangler login
```

This opens your browser to authenticate with Cloudflare.

### 1.2 Configure Your Worker

Edit `workers/wrangler.toml` and update:

```toml
name = "lnkd-data-hub-worker"  # Choose a unique name
compatibility_date = "2024-01-01"

# For production KV (optional, for rate limiting)
# [[kv_namespaces]]
# binding = "LINKEDIN_HUB_KV"
# id = "your_kv_namespace_id"
```

### 1.3 Create KV Namespace (Optional - for rate limiting)

```bash
cd workers
wrangler kv:namespace create "LINKEDIN_HUB_KV"
```

Copy the `id` from output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "LINKEDIN_HUB_KV"
id = "abc123..."  # Paste your KV namespace ID
```

### 1.4 Set Cloudflare Secrets

```bash
cd workers

# Set RapidAPI Key (NEVER commit this!)
wrangler secret put RAPIDAPI_KEY
# When prompted, paste: 4aaf9685f9msh91bb6936661eb07p1a7da5jsn7ff9f3fe3216

# Set RapidAPI Host
wrangler secret put RAPIDAPI_HOST
# When prompted, paste: linkedin-api-data.p.rapidapi.com

# Set JWT Secret (generate a strong random string)
wrangler secret put JWT_SECRET
# When prompted, paste a secure random string (e.g., openssl rand -hex 32)
```

### 1.5 Deploy Worker

```bash
cd workers
npm run deploy
# OR
wrangler deploy
```

**Save the Worker URL** from output (e.g., `https://lnkd-data-hub-worker.your-subdomain.workers.dev`)

---

## 🌐 **Step 2: Set Up GitHub Repository**

### 2.1 Create GitHub Repository

1. Go to https://github.com/new
2. Create repository: `lnkd-data-hub`
3. Set to **Public** or **Private** (your choice)
4. **DO NOT** initialize with README (we already have one)

### 2.2 Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - LinkedIn Data Hub"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/lnkd-data-hub.git
git branch -M main
git push -u origin main
```

### 2.3 Verify Secrets Are NOT in GitHub

After pushing, check your GitHub repository and ensure:
- ❌ `workers/.dev.vars` is **NOT** visible
- ❌ `app/.env` is **NOT** visible
- ✅ `workers/.dev.vars.example` **IS** visible
- ✅ `.env.example` **IS** visible

---

## 📱 **Step 3: Deploy Frontend to Cloudflare Pages**

### 3.1 Connect GitHub to Cloudflare Pages

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages
2. Click **"Create a project"**
3. Click **"Connect to Git"**
4. Select your GitHub repository: `lnkd-data-hub`
5. Click **"Begin setup"**

### 3.2 Configure Build Settings

**Framework preset**: `Next.js`

**Build configuration**:
```
Build command: cd app && npm install && npm run build
Build output directory: app/.next
Root directory: /
```

**Environment variables** (click "Add variable"):
```
NEXT_PUBLIC_WORKER_BASE_URL = https://lnkd-data-hub-worker.your-subdomain.workers.dev
NODE_VERSION = 18
```

### 3.3 Deploy

1. Click **"Save and Deploy"**
2. Wait 2-5 minutes for build
3. Your site will be live at: `https://lnkd-data-hub.pages.dev`

### 3.4 Custom Domain (Optional)

1. Go to your Pages project
2. Click **"Custom domains"**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update DNS as instructed

---

## ⚙️ **Step 4: Configure Production Environment**

### 4.1 Update Worker CORS (if needed)

If your Pages domain is different from your Worker domain, update CORS in `workers/src/index.ts`:

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://lnkd-data-hub.pages.dev',  // Add your Pages URL
  'https://app.yourdomain.com'  // Add custom domain if used
];
```

Redeploy worker:
```bash
cd workers && wrangler deploy
```

### 4.2 Update Frontend Environment

Go to Cloudflare Pages dashboard → Your project → Settings → Environment variables

Update `NEXT_PUBLIC_WORKER_BASE_URL` to your Worker URL.

Redeploy Pages (Settings → Deployments → Retry deployment)

---

## 🔒 **Step 5: Security Checklist**

Before going live, verify:

- [ ] `workers/.dev.vars` is in `.gitignore`
- [ ] `.env` files are in `.gitignore`
- [ ] RapidAPI key is set as Cloudflare Secret (not in code)
- [ ] JWT secret is set as Cloudflare Secret
- [ ] No secrets visible in GitHub repository
- [ ] Worker CORS allows only your frontend domains
- [ ] HTTPS is enabled on both Worker and Pages
- [ ] Rate limiting is configured in Worker

---

## 🧪 **Step 6: Test Production Deployment**

### 6.1 Test Worker API

```bash
# Test search endpoint
curl https://lnkd-data-hub-worker.your-subdomain.workers.dev/api/search/jobs?q=engineer&limit=5

# Should return JSON with job results
```

### 6.2 Test Frontend

1. Visit: `https://lnkd-data-hub.pages.dev`
2. Navigate to Search page
3. Search for "engineer"
4. Click on a job to view details
5. Check browser console for errors

---

## 🔄 **Continuous Deployment**

### GitHub Actions (Already Configured)

The `.github/workflows/test.yml` runs automatically on every push:
- ✅ Lints code
- ✅ Runs tests
- ✅ Builds project

### Auto-Deploy on Push

**Worker**: To enable auto-deploy:
```bash
cd workers
wrangler deploy --triggers
```

**Pages**: Automatically deploys on every push to `main` branch.

---

## 📊 **Monitoring & Logs**

### View Worker Logs

```bash
wrangler tail
```

Or in dashboard:
https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/workers/services/view/lnkd-data-hub-worker

### View Pages Logs

Dashboard → Pages → Your Project → Deployments → View build logs

---

## 🐛 **Troubleshooting**

### Worker Returns 404

**Solution**: Check Worker routes in Cloudflare dashboard
- Ensure Worker is deployed
- Verify `wrangler.toml` name matches deployed worker

### Frontend Can't Connect to Worker

**Solution**: Check CORS
1. Inspect browser console for CORS errors
2. Update `ALLOWED_ORIGINS` in `workers/src/index.ts`
3. Redeploy worker

### RapidAPI Returns 401/403

**Solution**: Check API key
```bash
wrangler secret list  # Should show RAPIDAPI_KEY (but not value)
wrangler secret put RAPIDAPI_KEY  # Re-enter if needed
```

### Build Fails on Cloudflare Pages

**Solution**: Check Node version
- Ensure `NODE_VERSION = 18` is set in environment variables
- Check build logs for specific errors

---

## 💰 **Cost Optimization**

### Cloudflare Free Tier Limits

- **Workers**: 100,000 requests/day (free)
- **Pages**: Unlimited static requests (free)
- **KV**: 100,000 reads/day, 1,000 writes/day (free)

### RapidAPI Costs

- Check your plan at: https://rapidapi.com/rockapis/api/linkedin-api-data/pricing
- Monitor usage in RapidAPI dashboard

---

## 🔐 **Rotating Secrets**

### Update RapidAPI Key

```bash
cd workers
wrangler secret put RAPIDAPI_KEY
# Enter new key
wrangler deploy
```

### Update JWT Secret

```bash
cd workers
wrangler secret put JWT_SECRET
# Enter new secret
wrangler deploy
```

**Note**: Rotating JWT_SECRET will invalidate all existing user sessions.

---

## 📞 **Support Resources**

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/
- **RapidAPI Support**: https://rapidapi.com/rockapis/api/linkedin-api-data/

---

## ✅ **Production Deployment Checklist**

- [ ] Secrets removed from code
- [ ] `.gitignore` configured
- [ ] Code pushed to GitHub
- [ ] Worker deployed with secrets
- [ ] KV namespace created (if using rate limiting)
- [ ] Pages connected to GitHub
- [ ] Environment variables set in Pages
- [ ] Custom domain configured (optional)
- [ ] CORS configured
- [ ] Production tested
- [ ] Monitoring enabled
- [ ] Error tracking configured (Sentry)

---

**🎉 Your application should now be live!**

Frontend: `https://lnkd-data-hub.pages.dev`  
Backend: `https://lnkd-data-hub-worker.your-subdomain.workers.dev`

