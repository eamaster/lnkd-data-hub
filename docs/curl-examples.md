# Curl Examples

Set base URL:
```bash
BASE="http://127.0.0.1:8787"
```

People search:
```bash
curl -s "$BASE/api/search/people?q=john&limit=5"
```

Companies search:
```bash
curl -s "$BASE/api/search/companies?q=acme&limit=5"
```

Products search:
```bash
curl -s "$BASE/api/search/products?q=crm&offsite=1&limit=5"
```

Jobs search:
```bash
curl -s "$BASE/api/search/jobs?q=engineer&location=remote&limit=5"
```

Posts search:
```bash
curl -s "$BASE/api/search/posts?q=ai&limit=5"
```

Events:
```bash
curl -s "$BASE/api/events?status=upcoming&limit=5"
```

Company details:
```bash
curl -s "$BASE/api/companies/123"
```

Company employees:
```bash
curl -s "$BASE/api/companies/123/employees?limit=5"
```

Product details:
```bash
curl -s "$BASE/api/products/456"
```

Trending products:
```bash
curl -s "$BASE/api/products/trending?limit=5"
```

Job details:
```bash
curl -s "$BASE/api/jobs/789"
```

Post details:
```bash
curl -s "$BASE/api/posts/abc"
```

Comment on post:
```bash
curl -s -X POST "$BASE/api/posts/abc/comment" -H "Content-Type: application/json" -d '{"text":"Nice post!"}'
```

Admin usage (requires admin JWT):
```bash
curl -s "$BASE/api/admin/usage"
```
