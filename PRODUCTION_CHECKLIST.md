# ✅ Production Deployment Checklist

Use this checklist before deploying to production.

---

## 🔐 **Security (CRITICAL)**

### Code Security
- [ ] Run security scan: `.\infrastructure\security-check.ps1`
- [ ] Verify no secrets in code: `git grep -E '[0-9a-f]{32}msh'`
- [ ] Check `.gitignore` includes all sensitive files
- [ ] Verify `workers/.dev.vars` is NOT in git: `git ls-files | grep dev.vars`
- [ ] Verify `.env` files are NOT in git: `git ls-files | grep "\.env$"`

### API Keys & Secrets
- [ ] RapidAPI key stored in Cloudflare Secrets (not code)
- [ ] JWT secret is strong (32+ random characters)
- [ ] JWT secret set in Cloudflare Worker secrets
- [ ] All secrets removed from example files
- [ ] GitHub Secrets configured for CI/CD

### CORS & Network Security
- [ ] Worker CORS allows only specific origins (not `*`)
- [ ] Update `ALLOWED_ORIGINS` in `workers/src/index.ts`
- [ ] HTTPS enabled on both Worker and Pages
- [ ] No mixed content warnings (HTTP resources on HTTPS pages)

---

## 🏗️ **Infrastructure**

### Cloudflare Worker
- [ ] Worker deployed: `cd workers && wrangler deploy`
- [ ] Worker URL saved and accessible
- [ ] Secrets set via `wrangler secret put`
- [ ] KV namespace created (if using rate limiting)
- [ ] Rate limiting tested and working
- [ ] Worker logs accessible: `wrangler tail`

### Cloudflare Pages
- [ ] Pages project created
- [ ] GitHub repository connected
- [ ] Build command configured: `cd app && npm install && npm run build`
- [ ] Build output directory: `app/.next`
- [ ] Environment variables set:
  - `NEXT_PUBLIC_WORKER_BASE_URL`
  - `NODE_VERSION = 18`
- [ ] Pages deployed successfully
- [ ] Custom domain configured (optional)

### Database
- [ ] Production database provisioned (if using Postgres)
- [ ] Database URL stored securely
- [ ] Prisma migrations applied
- [ ] Database backups configured

---

## 🧪 **Testing**

### Functional Testing
- [ ] Search works for all tabs (people, companies, products, jobs, posts, events)
- [ ] Job details page loads correctly
- [ ] Company details page loads correctly
- [ ] Product details page loads correctly
- [ ] Filters work (location, job function, industry)
- [ ] Load More pagination works
- [ ] No duplicate results when loading more
- [ ] Mobile responsive design works

### API Testing
- [ ] Worker health check: `curl https://your-worker.workers.dev/api/search/jobs?q=test&limit=1`
- [ ] Rate limiting works (test quota exhaustion)
- [ ] Caching works (repeated requests are faster)
- [ ] Error handling returns proper JSON errors
- [ ] CORS works from frontend domain

### Performance Testing
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90
- [ ] No console errors in production
- [ ] Network waterfall optimized

---

## 📊 **Monitoring & Observability**

### Logging
- [ ] Worker logs capture errors: `wrangler tail`
- [ ] Frontend logs errors to console (in dev)
- [ ] Sentry configured (optional)
- [ ] No sensitive data (PII, API keys) in logs

### Analytics
- [ ] Cloudflare Analytics enabled
- [ ] RapidAPI usage monitored
- [ ] Rate limit metrics tracked
- [ ] Error rates monitored

### Alerts
- [ ] Set up alerts for Worker errors
- [ ] Monitor RapidAPI quota usage
- [ ] Alert on rate limit exhaustion
- [ ] Monitor uptime (UptimeRobot, Pingdom)

---

## 📚 **Documentation**

### User Documentation
- [ ] README.md updated with production URLs
- [ ] DEPLOYMENT.md reviewed and accurate
- [ ] API documentation (OpenAPI) updated
- [ ] Postman collection tested
- [ ] Environment variables documented

### Developer Documentation
- [ ] Setup instructions tested by new developer
- [ ] All scripts have clear comments
- [ ] Architecture diagram created (optional)
- [ ] Troubleshooting section updated

---

## 🚀 **Deployment Process**

### Pre-Deployment
- [ ] All tests passing: `npm test`
- [ ] Linting passing: `npm run lint`
- [ ] Build successful locally: `npm run build`
- [ ] Code reviewed and approved
- [ ] Changelog updated (if applicable)

### Deployment Steps
1. [ ] Deploy Worker: `cd workers && wrangler deploy`
2. [ ] Verify Worker is live and responding
3. [ ] Update `NEXT_PUBLIC_WORKER_BASE_URL` in Pages environment
4. [ ] Deploy Pages (auto-deploy on push, or manual)
5. [ ] Verify Pages is live
6. [ ] Test end-to-end flow from production

### Post-Deployment
- [ ] Smoke test all major features
- [ ] Check error logs for issues
- [ ] Monitor performance for 15 minutes
- [ ] Update status page (if applicable)
- [ ] Notify team of deployment

---

## 🔄 **Rollback Plan**

In case of critical issues:

### Rollback Worker
```bash
cd workers
wrangler rollback
```

### Rollback Pages
1. Go to Cloudflare Pages dashboard
2. Navigate to Deployments
3. Find previous stable deployment
4. Click "Rollback to this deployment"

### Emergency Contact
- Cloudflare Support: https://support.cloudflare.com/
- RapidAPI Support: https://rapidapi.com/contact

---

## 💰 **Cost Management**

### Monitor Costs
- [ ] Cloudflare Workers usage < 100k requests/day (free tier)
- [ ] Cloudflare Pages builds < 500/month (free tier)
- [ ] RapidAPI quota monitored
- [ ] Set up billing alerts

### Optimization
- [ ] Enable caching for repeated requests
- [ ] Minimize RapidAPI calls
- [ ] Use incremental static regeneration (ISR) where possible
- [ ] Optimize bundle size

---

## 📞 **Support & Maintenance**

### Regular Maintenance
- [ ] Update dependencies monthly: `npm update`
- [ ] Security audit: `npm audit`
- [ ] Rotate secrets quarterly
- [ ] Review and optimize caching strategies
- [ ] Monitor and address deprecation warnings

### Incident Response
- [ ] Document incident response process
- [ ] Keep backup of production data
- [ ] Test rollback procedure
- [ ] Maintain status page

---

## 🎯 **Success Criteria**

Deployment is successful when:

- ✅ All search types return results
- ✅ Job details page displays full information
- ✅ No errors in browser console
- ✅ No errors in Worker logs
- ✅ Rate limiting works as expected
- ✅ Caching reduces response times
- ✅ Mobile UI is responsive
- ✅ Performance metrics meet targets
- ✅ No security vulnerabilities detected

---

**Last Updated**: Check date when completing this checklist  
**Deployed By**: Add your name  
**Deployment Date**: Add date

