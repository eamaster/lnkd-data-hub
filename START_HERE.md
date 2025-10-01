# 🎯 START HERE - LinkedIn Data Hub

Welcome! This document will guide you through getting started with the LinkedIn Data Hub project.

---

## 🤔 **What Is This Project?**

A production-ready web application that provides:
- **Job Search** with advanced filters (location, function, industry)
- **Company Profiles** with employee data
- **Product Discovery** and trending products
- **Event Listings** for LinkedIn events
- **Post Viewing** and engagement

**Tech Stack**:
- **Frontend**: Next.js + TypeScript + TailwindCSS
- **Backend**: Cloudflare Workers (secure API proxy)
- **Data Source**: LinkedIn API via RapidAPI
- **Database**: SQLite (local) / Postgres (production)

---

## 🚀 **Quick Start Options**

### Option 1: Local Development (Recommended First)

Perfect for testing and development.

**Time**: 10 minutes

**Steps**:
1. Run setup script:
   ```powershell
   # Windows
   .\setup.ps1
   ```
   ```bash
   # Linux/Mac
   chmod +x setup.sh
   ./setup.sh
   ```

2. Edit `workers/.dev.vars` and add your RapidAPI key

3. Start development servers:
   ```powershell
   # Terminal 1: Worker
   cd workers
   npm run dev
   
   # Terminal 2: Frontend
   cd app
   npm run dev
   ```

4. Open http://localhost:3000

**Full Guide**: See [README.md](./README.md#-quick-start-local-dev)

---

### Option 2: Deploy to Production NOW

Deploy your app to the internet in 15 minutes.

**Requirements**:
- GitHub account
- Cloudflare account (https://dash.cloudflare.com/767ce92674d0bd477eef696c995faf16)
- RapidAPI key

**Quick Deploy**: See [DEPLOY_NOW.md](./DEPLOY_NOW.md)

**Detailed Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📚 **Documentation Index**

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [README.md](./README.md) | Main project documentation | Start here for overview |
| [START_HERE.md](./START_HERE.md) | You are here! | First-time setup |
| [DEPLOY_NOW.md](./DEPLOY_NOW.md) | Quick deployment (15 min) | Deploy to production fast |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Comprehensive deployment | Detailed production setup |
| [GITHUB_SETUP.md](./GITHUB_SETUP.md) | GitHub security guide | Before pushing to GitHub |
| [SECURITY.md](./SECURITY.md) | Security policy | Security best practices |
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Pre-deployment audit | Before going live |

---

## 🔐 **Security First!**

**CRITICAL**: This project contains API keys that must be protected.

### Files with Secrets (NEVER COMMIT):
- ❌ `workers/.dev.vars`
- ❌ `app/.env`
- ❌ `.env`

### Safe to Commit:
- ✅ `workers/.dev.vars.example`
- ✅ `app/.env.example`
- ✅ All source code

### Before Pushing to GitHub:

```powershell
# Run security check
.\infrastructure\security-check.ps1

# Should output: "Security check PASSED"
```

**More Info**: See [SECURITY.md](./SECURITY.md)

---

## 🗂️ **Project Structure**

```
lnkd-data-hub/
├── app/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (search, jobs, companies)
│   │   └── lib/           # API client, utilities
│   ├── .env.example       # Frontend env template
│   └── package.json
├── workers/               # Cloudflare Worker (API proxy)
│   ├── src/
│   │   ├── index.ts      # Main Worker routes
│   │   └── utils/        # Cache, rate limit, validation
│   ├── .dev.vars.example # Worker secrets template
│   └── package.json
├── infrastructure/        # Deployment scripts
│   ├── deploy-worker.ps1 # Deploy Worker (Windows)
│   ├── deploy-worker.sh  # Deploy Worker (Linux/Mac)
│   └── security-check.* # Security audit scripts
├── .github/workflows/    # CI/CD automation
├── docs/                 # API docs, examples
├── DEPLOYMENT.md         # Deployment guide
├── DEPLOY_NOW.md         # Quick deploy guide
└── SECURITY.md           # Security policy
```

---

## 🎓 **Learning Path**

### New to the Project?

1. **Read** [README.md](./README.md) - Understand what the project does
2. **Run** setup script - Get local dev environment running
3. **Test** locally - Try searching for jobs
4. **Explore** code - Check out `app/src/app/search/page.tsx`

### Ready to Deploy?

1. **Security check** - Run `.\infrastructure\security-check.ps1`
2. **Push to GitHub** - See [GITHUB_SETUP.md](./GITHUB_SETUP.md)
3. **Deploy Worker** - See [DEPLOY_NOW.md](./DEPLOY_NOW.md)
4. **Deploy Pages** - Cloudflare Pages auto-deploys from GitHub
5. **Test production** - Verify all features work

### Contributing?

1. **Fork** repository on GitHub
2. **Create** feature branch
3. **Make** changes
4. **Test** thoroughly
5. **Run** security check before commit
6. **Submit** pull request

---

## ❓ **Common Questions**

### Q: Do I need a RapidAPI account?

**A**: Yes, to get your API key. Sign up at https://rapidapi.com/ (free tier available).

### Q: Can I use a different API?

**A**: Yes, but you'll need to modify the Worker proxy code in `workers/src/`.

### Q: Is there a free hosting option?

**A**: Yes! Cloudflare Workers and Pages both have generous free tiers:
- Workers: 100,000 requests/day
- Pages: Unlimited requests

### Q: How do I add new features?

**A**: 
1. Update Worker route in `workers/src/index.ts`
2. Update API client in `app/src/lib/api.ts`
3. Create/update React component in `app/src/app/`

### Q: The app isn't working locally. Help!

**A**:
1. Check Worker is running (Terminal 1)
2. Check Frontend is running (Terminal 2)
3. Verify `workers/.dev.vars` has your real API key
4. Check browser console for errors
5. Test Worker directly: `curl http://localhost:8787/api/search/jobs?q=test&limit=1`

---

## 🆘 **Getting Help**

### Documentation
- Start with [README.md](./README.md)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review [SECURITY.md](./SECURITY.md) for security questions

### Logs & Debugging
```powershell
# Worker logs (local)
cd workers
npm run dev
# Shows requests in console

# Worker logs (production)
wrangler tail

# Frontend (browser)
F12 → Console tab
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 404 errors | Worker not running or wrong URL |
| CORS errors | Update ALLOWED_ORIGINS in Worker |
| "Job Not Found" | API endpoint issue - check Worker logs |
| Build fails | Check Node version (need 18+) |

---

## ✅ **Next Steps**

Choose your path:

### Path A: Local Development
1. [ ] Run `.\setup.ps1` (or `./setup.sh`)
2. [ ] Add RapidAPI key to `workers/.dev.vars`
3. [ ] Start Worker: `cd workers && npm run dev`
4. [ ] Start Frontend: `cd app && npm run dev`
5. [ ] Open http://localhost:3000
6. [ ] Try searching for jobs!

### Path B: Deploy to Production
1. [ ] Run security check: `.\infrastructure\security-check.ps1`
2. [ ] Push to GitHub (see [GITHUB_SETUP.md](./GITHUB_SETUP.md))
3. [ ] Deploy Worker (see [DEPLOY_NOW.md](./DEPLOY_NOW.md))
4. [ ] Deploy Pages via Cloudflare dashboard
5. [ ] Test production site
6. [ ] Share your live URL!

---

**Ready to start? Pick a path above and let's go! 🚀**

