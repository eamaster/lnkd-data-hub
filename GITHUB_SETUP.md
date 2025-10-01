# 📘 GitHub Repository Setup Guide

This guide helps you securely push your code to GitHub and set up GitHub Secrets for CI/CD.

---

## ⚠️ **CRITICAL: Before Pushing to GitHub**

### 1. Run Security Check

```powershell
# PowerShell (Windows)
.\infrastructure\security-check.ps1
```

```bash
# Bash (Linux/Mac)
chmod +x infrastructure/security-check.sh
./infrastructure/security-check.sh
```

This script verifies:
- ✅ No `.env` or `.dev.vars` files are being committed
- ✅ No hardcoded API keys in code
- ✅ `.gitignore` is properly configured

### 2. Verify .gitignore

Ensure these files are **NEVER** committed:
```
workers/.dev.vars  ❌ NEVER COMMIT
app/.env           ❌ NEVER COMMIT
.env               ❌ NEVER COMMIT
```

But these **SHOULD** be committed:
```
workers/.dev.vars.example  ✅ Commit
app/.env.example           ✅ Commit
.env.example               ✅ Commit
```

---

## 📦 **Creating GitHub Repository**

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: `lnkd-data-hub`
3. **Description**: "LinkedIn Data Hub - Next.js + Cloudflare Workers"
4. **Visibility**: Choose Public or Private
5. **DO NOT** check "Add a README" (we already have one)
6. Click **Create repository**

### Step 2: Push Code to GitHub

```bash
# If not already initialized
git init

# Stage all files
git add .

# Verify what's being committed (IMPORTANT!)
git status

# Check for any sensitive files
git status | grep -E '(\.dev\.vars|\.env$)'
# Should return NOTHING - if it shows files, STOP and fix .gitignore!

# Commit
git commit -m "feat: initial commit - LinkedIn Data Hub

- Next.js frontend with search and job details
- Cloudflare Worker proxy for RapidAPI
- Advanced job filters (location, function, industry)
- Load more pagination with deduplication
- Comprehensive documentation and deployment guides"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/lnkd-data-hub.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Verify on GitHub

After pushing, visit your repository on GitHub and verify:

**Files that SHOULD be visible:**
- ✅ `README.md`
- ✅ `DEPLOYMENT.md`
- ✅ `.env.example`
- ✅ `workers/.dev.vars.example`
- ✅ `app/.env.example`
- ✅ All source code files

**Files that should NOT be visible:**
- ❌ `workers/.dev.vars` (if you see this, DELETE IT IMMEDIATELY!)
- ❌ `app/.env`
- ❌ `.env`

### Step 4: If Secrets Were Accidentally Committed

**DANGER: This rewrites git history!**

```bash
# Remove sensitive file from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch workers/.dev.vars" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only do this if absolutely necessary)
git push origin --force --all

# Immediately rotate your API keys!
```

---

## 🔑 **Setting Up GitHub Secrets**

For automated deployments, you need to set GitHub Secrets.

### Step 1: Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Permissions:
   - Account: Workers Scripts - Edit
   - Zone: Workers Routes - Edit
5. Click **Continue to summary** → **Create Token**
6. **Copy the token** (you won't see it again!)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | `your_token_from_step1` | For deploying Worker |
| `RAPIDAPI_KEY` | `4aaf9685f9msh91bb6936661eb07p1a7da5jsn7ff9f3fe3216` | Your RapidAPI key |
| `RAPIDAPI_HOST` | `linkedin-api-data.p.rapidapi.com` | RapidAPI host |
| `JWT_SECRET` | `your_secure_random_32+_char_string` | For JWT signing |

### Step 3: Update Workflow File

Edit `.github/workflows/deploy.yml` and replace:
```yaml
curl -f https://lnkd-data-hub-worker.your-subdomain.workers.dev/...
```

With your actual Worker URL after first deployment.

---

## 🚀 **Automated Deployment**

Once GitHub Secrets are set, pushing to `main` branch will:
1. ✅ Run tests
2. ✅ Run security checks
3. ✅ Deploy Worker to Cloudflare
4. ✅ Test deployment

Pages deployment is handled by Cloudflare (connected to GitHub).

---

## 🔄 **Branch Protection (Recommended)**

Protect your main branch:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
5. Save changes

---

## 📊 **Monitoring Your Repository**

### Enable Dependabot

1. Go to **Settings** → **Code security and analysis**
2. Enable:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Dependabot version updates

### Secret Scanning

GitHub automatically scans for known secret patterns. If detected:
- You'll receive an alert
- Immediately rotate the exposed secret
- Update Cloudflare Worker secrets

---

## 🧑‍🤝‍🧑 **Team Collaboration**

### For Team Members

When cloning the repository:

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/lnkd-data-hub.git
cd lnkd-data-hub

# Run setup
npm install

# Copy environment files
cp .env.example .env
cp workers/.dev.vars.example workers/.dev.vars
cp app/.env.example app/.env

# Get RapidAPI key from team lead and add to workers/.dev.vars
# NEVER commit this file!
```

### Sharing Secrets Securely

**DO NOT share secrets via:**
- ❌ GitHub (public or private repo)
- ❌ Email
- ❌ Slack/Discord messages
- ❌ Any version control system

**DO share secrets via:**
- ✅ Password manager (1Password, LastPass, Bitwarden)
- ✅ Encrypted messaging (Signal)
- ✅ In-person or secure video call

---

## ✅ **Pre-Commit Checklist**

Before every `git push`:

- [ ] Run `npm run lint` (passes)
- [ ] Run `npm test` (passes)
- [ ] Run security check script
- [ ] Verify no `.env` or `.dev.vars` in `git status`
- [ ] Review changed files in `git diff`
- [ ] No hardcoded API keys or secrets in code

---

## 📞 **Support**

If you accidentally committed secrets:
1. **IMMEDIATELY** rotate the exposed keys
2. Remove from git history (see "If Secrets Were Accidentally Committed" above)
3. Force push to GitHub
4. Update Cloudflare Worker secrets
5. Update GitHub Secrets

**Prevention is better than cure - use the security check script!**

