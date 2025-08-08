# Demo Script

- Login/register (local demo) and obtain JWT (stub)
- Navigate to Dashboard: see placeholders for usage/quota
- Unified Search:
  - People, Companies, Products (offsite=1), Jobs, Posts, Events
  - Pagination via offset controls
- Product search correctness via RapidAPI endpoint `/product/search`
- Company page shows details and employees
- Post page shows details and allows submitting a comment (stored in KV)
- Saved/Watchlist placeholder
- Billing page toggles plan visually (Stripe mocked)
- Admin: fetch usage and trigger cache refresh

Performance:
- Run the same query twice; observe reduced latency (cached for 5 minutes)

Rate limiting:
- Exceed per-minute quota; observe 429 JSON error with retryAfter
