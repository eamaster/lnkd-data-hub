# 🔐 Security Policy

This document outlines security best practices for the LinkedIn Data Hub project.

---

## 🚨 **Reporting Security Issues**

If you discover a security vulnerability, please email the maintainers directly. **DO NOT** create a public GitHub issue.

---

## 🔑 **Secret Management**

### Secrets that MUST be protected:

1. **RapidAPI Key**: `RAPIDAPI_KEY`
   - Used to authenticate with LinkedIn API
   - **NEVER** commit to Git
   - Store in: Cloudflare Worker Secrets

2. **JWT Secret**: `JWT_SECRET`
   - Used to sign authentication tokens
   - Minimum 32 characters, cryptographically random
   - **NEVER** commit to Git
   - Store in: Cloudflare Worker Secrets

3. **Database Credentials**: `DATABASE_URL`
   - Contains database password
   - **NEVER** commit to Git
   - Store in: Environment variables

4. **Stripe Keys**: `STRIPE_SECRET_KEY`
   - Payment processing credentials
   - **NEVER** commit to Git
   - Store in: Environment variables

### Where Secrets Are Stored

| Secret | Local Dev | Production |
|--------|-----------|------------|
| `RAPIDAPI_KEY` | `workers/.dev.vars` | Cloudflare Worker Secrets |
| `JWT_SECRET` | `workers/.dev.vars` | Cloudflare Worker Secrets |
| `DATABASE_URL` | `app/.env` | Cloudflare Pages Env Vars |
| `STRIPE_SECRET_KEY` | `app/.env` | Cloudflare Pages Env Vars |

### Files That Contain Secrets (NEVER COMMIT)

```
❌ workers/.dev.vars         # Local Worker secrets
❌ app/.env                  # Local app secrets
❌ .env                      # Root environment file
❌ app/.env.local            # Local overrides
❌ app/.env.production.local # Production overrides
```

### Example Files (SAFE TO COMMIT)

```
✅ .env.example
✅ workers/.dev.vars.example
✅ app/.env.example
```

---

## 🛡️ **Security Measures Implemented**

### 1. API Key Protection

- ✅ RapidAPI key is NEVER exposed to browser
- ✅ All API calls go through Cloudflare Worker proxy
- ✅ Worker validates all inputs before calling RapidAPI
- ✅ Keys stored in Cloudflare Secrets (encrypted at rest)

### 2. Input Validation

- ✅ All inputs validated with Zod schemas
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React auto-escaping)
- ✅ CSRF protection (SameSite cookies)

### 3. Rate Limiting

- ✅ Per-user rate limits enforced
- ✅ Per-plan quotas (BASIC, PRO, ULTRA, MEGA)
- ✅ Exponential backoff for RapidAPI calls
- ✅ Concurrent request limiting

### 4. Authentication

- ✅ JWT-based authentication
- ✅ Passwords hashed with bcrypt
- ✅ Token expiration (configurable)
- ✅ Role-based access control (user, admin)

### 5. CORS Configuration

- ✅ Allowed origins whitelist (no wildcard `*`)
- ✅ Credentials allowed only for trusted origins
- ✅ Preflight requests handled correctly

### 6. Data Sanitization

- ✅ Logs sanitized (no PII or secrets logged)
- ✅ Error messages don't expose internal details
- ✅ Stack traces hidden in production

---

## 🔍 **Security Audit Tools**

### Automated Checks

Run before every deployment:

```powershell
# Security scan
.\infrastructure\security-check.ps1

# Dependency audit
npm audit

# Lint for security issues
npm run lint
```

### GitHub Actions

Every push triggers:
- ✅ Secret scanning
- ✅ Dependency vulnerability check
- ✅ .gitignore verification

### Manual Review

Periodically review:
- [ ] All routes in `workers/src/index.ts` have input validation
- [ ] All database queries use parameterized queries
- [ ] No hardcoded secrets in code
- [ ] CORS configuration is restrictive

---

## 🚨 **Incident Response**

### If Secrets Are Exposed

**Immediately**:

1. **Rotate the exposed secret**
   ```powershell
   # For RapidAPI key:
   # 1. Get new key from https://rapidapi.com/
   # 2. Update Cloudflare Worker secret:
   cd workers
   wrangler secret put RAPIDAPI_KEY
   # 3. Deploy:
   wrangler deploy
   ```

2. **Remove from Git history**
   ```powershell
   # Remove sensitive file
   git filter-branch --force --index-filter `
     "git rm --cached --ignore-unmatch workers/.dev.vars" `
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push
   git push origin --force --all
   ```

3. **Revoke old credentials**
   - RapidAPI: Delete old key from dashboard
   - JWT: Old tokens will expire naturally
   - Database: Rotate password immediately

4. **Notify team**
   - Document incident
   - Review what went wrong
   - Update security procedures

### If Database Is Compromised

1. Take database offline
2. Restore from latest backup
3. Rotate all passwords and secrets
4. Audit access logs
5. Notify affected users (if applicable)

---

## 🔒 **Best Practices**

### For Developers

1. **Never commit secrets**
   - Use `.env.example` for documentation
   - Keep real values in `.env` (gitignored)
   - Double-check before `git commit`

2. **Use environment variables**
   ```typescript
   // ❌ BAD
   const API_KEY = '4aaf9685f9msh...';
   
   // ✅ GOOD
   const API_KEY = process.env.RAPIDAPI_KEY;
   ```

3. **Validate all inputs**
   ```typescript
   // ✅ Good - validates with Zod
   const schema = z.object({ q: z.string().max(200) });
   const validated = schema.parse(input);
   ```

4. **Use parameterized queries**
   ```typescript
   // ✅ Good - Prisma prevents SQL injection
   await prisma.user.findUnique({ where: { id } });
   ```

5. **Sanitize logs**
   ```typescript
   // ❌ BAD
   console.log('User:', user); // May contain passwords
   
   // ✅ GOOD
   console.log('User:', { id: user.id, role: user.role });
   ```

### For Deployment

1. **Use Cloudflare Secrets**
   - Never put secrets in environment variables (for Workers)
   - Use `wrangler secret put` instead

2. **Restrict CORS**
   - Don't use wildcard `*`
   - Whitelist specific domains only

3. **Enable HTTPS**
   - Cloudflare provides free SSL
   - Enforce HTTPS-only

4. **Monitor logs**
   - Check Worker logs regularly: `wrangler tail`
   - Set up alerts for errors

---

## 🔄 **Secret Rotation Schedule**

Rotate secrets regularly:

| Secret | Frequency | How |
|--------|-----------|-----|
| RapidAPI Key | Quarterly | Get new key from RapidAPI → Update Worker secret |
| JWT Secret | Quarterly | Generate new random string → Update Worker secret |
| Database Password | Quarterly | Update in database → Update connection string |
| Stripe Keys | Annually | Rotate in Stripe dashboard → Update env vars |

---

## ✅ **Security Checklist**

Before going to production:

### Code Review
- [ ] No hardcoded secrets
- [ ] All inputs validated
- [ ] All outputs sanitized
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages don't leak info

### Configuration
- [ ] `.gitignore` includes all secret files
- [ ] Example files have placeholders (not real secrets)
- [ ] Production uses HTTPS only
- [ ] Secrets stored in Cloudflare/Pages (not code)

### Testing
- [ ] Security scan passes
- [ ] Dependency audit passes
- [ ] Penetration testing (optional, for high-security needs)

### Monitoring
- [ ] Error tracking configured
- [ ] Logging configured (no secrets logged)
- [ ] Alerts set up for anomalies

---

## 📚 **Security Resources**

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Cloudflare Security**: https://developers.cloudflare.com/workers/platform/security/
- **Next.js Security**: https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy

---

## 📞 **Security Contacts**

- **Project Maintainer**: [Add email here]
- **Security Team**: [Add email here]
- **Cloudflare Security**: https://www.cloudflare.com/security-policy/

---

**Remember: Security is everyone's responsibility!**

