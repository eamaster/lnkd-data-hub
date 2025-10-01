# 🚀 Deploy NOW - Quick Guide

**For Cloudflare Account**: `767ce92674d0bd477eef696c995faf16`

Follow these steps to deploy your app to production in 15 minutes.

---

## 📋 Before You Start

- [ ] You have a GitHub account
- [ ] You're logged into Cloudflare: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16
- [ ] Your RapidAPI key ready

---

## Step 1: Secure Your Secrets (5 min)

### ⚠️ CRITICAL: Remove Secrets from Git

```powershell
# Check if secrets are tracked
git ls-files | Select-String "dev.vars"

# If workers/.dev.vars is listed, remove it:
git rm --cached workers/.dev.vars -f
git commit -m "security: remove dev.vars from git"
```

### Verify Security

```powershell
.\infrastructure\security-check.ps1
```

Should show: `✅ Security check PASSED`

If it fails, fix issues before proceeding!

---

## Step 2: Push to GitHub (3 min)

### Create GitHub Repository

1. Go to https://github.com/new
2. Name: `lnkd-data-hub`
3. Visibility: **Private** (recommended for safety)
4. **DO NOT** check "Add a README"
5. Click **Create repository**

### Push Code

```powershell
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/lnkd-data-hub.git

# Push
git branch -M main
git push -u origin main
```

### ✅ Verify Security on GitHub

Visit: `https://github.com/YOUR_USERNAME/lnkd-data-hub`

Check:
- ✅ `workers/.dev.vars.example` is visible
- ❌ `workers/.dev.vars` is NOT visible (if visible, STOP and remove!)
- ✅ `.env.example` is visible
- ❌ `.env` is NOT visible

---

## Step 3: Deploy Cloudflare Worker (5 min)

### Login to Wrangler

```powershell
cd workers
wrangler login
```

Browser opens → Login to Cloudflare → Authorize Wrangler

### Set Worker Secrets

```powershell
# 1. Set RapidAPI Key
wrangler secret put RAPIDAPI_KEY
# When prompted, paste: 4aaf9685f9msh91bb6936661eb07p1a7da5jsn7ff9f3fe3216

# 2. Set RapidAPI Host
"linkedin-api-data.p.rapidapi.com" | wrangler secret put RAPIDAPI_HOST

# 3. Generate and set JWT Secret
# Option A: Auto-generate
-join ((1..32) | ForEach-Object { Get-Random -Input ([char[]]'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') }) | wrangler secret put JWT_SECRET

# Option B: Manual (type a 32+ character random string)
wrangler secret put JWT_SECRET
```

### Deploy Worker

```powershell
wrangler deploy
```

**📝 SAVE THIS URL** from output:
```
Uploaded lnkd-data-hub-worker (X.XX sec)
Published lnkd-data-hub-worker (X.XX sec)
  https://lnkd-data-hub-worker.YOUR_SUBDOMAIN.workers.dev
```

### Test Worker API

```powershell
# Replace with YOUR actual Worker URL
curl "https://lnkd-data-hub-worker.YOUR_SUBDOMAIN.workers.dev/api/search/jobs?q=engineer&limit=2"
```

Should return JSON with job results. If you get an error, check:
- Secrets are set: `wrangler secret list`
- Worker is deployed: `wrangler deployments list`

---

## Step 4: Deploy Cloudflare Pages (7 min)

### Create Pages Project

1. Go to: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages
2. Click **Create a project**
3. Click **Connect to Git**

### Connect GitHub

1. **Select your repository**: `lnkd-data-hub`
2. Click **Begin setup**

### Configure Build Settings

**Framework preset**: `Next.js`

**Build configuration**:
```
Production branch: main

Build command:
cd app && npm install && npm run build

Build output directory:
app/.next

Root directory (Path):
/ (leave blank or default)
```

### Add Environment Variables

Click **Add variable** and add:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_WORKER_BASE_URL` | Paste your Worker URL from Step 3 |
| `NODE_VERSION` | `18` |

Example:
```
NEXT_PUBLIC_WORKER_BASE_URL = https://lnkd-data-hub-worker.abc123.workers.dev
NODE_VERSION = 18
```

### Deploy

1. Click **Save and Deploy**
2. Wait 2-5 minutes (watch build progress)
3. **📝 SAVE YOUR PAGES URL** when complete:
   ```
   https://lnkd-data-hub-ABC123.pages.dev
   ```

---

## Step 5: Update Worker CORS (CRITICAL! 3 min)

Now that you have your Pages URL, update Worker to allow it.

### Edit Worker CORS

Open `workers/src/index.ts` (line ~25-31) and update:

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://lnkd-data-hub-ABC123.pages.dev',  // ← Add your actual Pages URL
];
```

### Commit and Push

```powershell
git add workers/src/index.ts
git commit -m "fix: update CORS for production domain"
git push
```

### Redeploy Worker

```powershell
cd workers
wrangler deploy
```

OR use GitHub Actions (if configured):
- Push to main → Worker auto-deploys

---

## Step 6: Test Production! (3 min)

### Open Your Live App

Visit: `https://lnkd-data-hub-ABC123.pages.dev`

(Replace ABC123 with your actual Pages URL)

### Test All Features

1. **Search Jobs**:
   - Click "Search" tab (or should default to "jobs")
   - Type "software engineer"
   - Click Search button
   - ✅ Should see job results

2. **Job Details**:
   - Click on any job card
   - ✅ Should open job detail page
   - ✅ Should show full job description

3. **Location Filter**:
   - Type "New York" in Location field
   - Click "Apply Filters"
   - ✅ Should filter results

4. **Load More**:
   - Scroll down
   - Click "Load More"
   - ✅ Should load additional unique results

### Check Browser Console (F12)

Open DevTools → Console:
- ✅ Should see debug logs (🔍, 🌍, 🎯, 📊)
- ❌ Should NOT see CORS errors
- ❌ Should NOT see 404 or API errors

---

## 🎉 **SUCCESS!**

Your app is now live at:

- **Frontend**: `https://lnkd-data-hub-ABC123.pages.dev`
- **Backend Worker**: `https://lnkd-data-hub-worker.YOUR_SUBDOMAIN.workers.dev`

---

## 🔧 **Troubleshooting**

### Error: "Failed to fetch" in console

**Cause**: CORS not configured correctly

**Fix**:
1. Open browser DevTools → Network tab
2. Click failing request → Check response
3. If CORS error, verify Worker ALLOWED_ORIGINS includes your Pages domain
4. Redeploy Worker after updating

### Error: "Job Not Found" or 404

**Cause**: Worker endpoint not matching

**Fix**:
1. Check Worker URL in Pages environment
2. Test Worker directly: `curl YOUR_WORKER_URL/api/search/jobs?q=test&limit=1`
3. If Worker works but Pages doesn't, check `NEXT_PUBLIC_WORKER_BASE_URL`

### Error: Build Failed on Pages

**Cause**: Missing dependencies or wrong Node version

**Fix**:
1. Check build logs in Pages dashboard
2. Verify `NODE_VERSION = 18` in environment variables
3. Check build command is correct
4. Retry deployment

### Error: API returns 401 Unauthorized

**Cause**: RapidAPI key not set correctly

**Fix**:
```powershell
cd workers
wrangler secret put RAPIDAPI_KEY
# Re-enter your key
wrangler deploy
```

---

## 📈 **Post-Deployment Tasks**

### Update README

Add your live URLs to `README.md`:

```markdown
## 🌐 Live Demo

- **App**: https://lnkd-data-hub-ABC123.pages.dev
- **API**: https://lnkd-data-hub-worker.YOUR_SUBDOMAIN.workers.dev
```

### Monitor Usage

- **Cloudflare Analytics**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16/pages/view/lnkd-data-hub/analytics
- **Worker Logs**: `wrangler tail` (in workers directory)
- **RapidAPI Usage**: https://rapidapi.com/developer/dashboard

### Optional Enhancements

1. **Custom Domain**:
   - Pages Dashboard → Custom domains → Add your domain

2. **Error Tracking**:
   - Set up Sentry for both frontend and Worker

3. **Analytics**:
   - Enable Cloudflare Web Analytics
   - Add Google Analytics (optional)

---

## 🆘 **Need More Help?**

- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **GitHub Setup**: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Production Checklist**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Cloudflare Dashboard**: https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16

**Emergency**: If you exposed secrets on GitHub, see [GITHUB_SETUP.md](./GITHUB_SETUP.md#step-4-if-secrets-were-accidentally-committed)
