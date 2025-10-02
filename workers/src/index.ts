import { Hono } from 'hono';
import { z } from 'zod';
import { cacheFetch } from './utils/cache';
import { enforceRateLimit } from './utils/ratelimit';
import { fetchRapid } from './utils/fetchRapid';
import { Env, JsonError } from './types';
import { getAuthUserFromRequest } from './utils/jwt';
import { withConcurrency } from './utils/concurrency';
import { kvShim } from './utils/kvShim';

const app = new Hono<{ Bindings: Env }>();

function jsonError(status: number, message: string, details?: unknown) {
  const body: JsonError = { code: status, message, details };
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// CORS for browser calls to the Worker
app.use('*', async (c, next) => {
  // IMPORTANT: Update ALLOWED_ORIGINS for production!
  // Add your Cloudflare Pages domain after deployment
  const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://lnkd-data-hub.pages.dev',
    'https://08db7b8d.lnkd-data-hub.pages.dev',
    'https://be44c609.lnkd-data-hub.pages.dev',
  ];

  const origin = c.req.header('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  c.res.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  c.res.headers.set('Vary', 'Origin');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: c.res.headers });
  }
  await next();
});

// Bind KV shim if missing
app.use('*', async (c, next) => {
  if (!c.env.LINKEDIN_HUB_KV) {
    // @ts-expect-error attach shim for local dev
    c.env.LINKEDIN_HUB_KV = kvShim() as any;
  }
  await next();
});

app.use('*', async (c, next) => {
  const user = getAuthUserFromRequest(c.req.raw) || { userId: 'anon', role: 'user', plan: 'BASIC' };
  (c as any).user = user;
  await next();
});

async function guard(c: any) {
  const user = c.user;
  const rl = await enforceRateLimit(c.env, user);
  if (!rl.ok) {
    return jsonError(429, rl.message, { retryAfter: rl.retryAfter });
  }
  return null;
}

function getValidatedSearchParams<T extends z.ZodRawShape>(url: URL, schema: z.ZodObject<T>) {
  const params = Object.fromEntries(url.searchParams.entries());
  return schema.parse(params);
}

app.get('/api/search/people', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ q: z.string().optional(), limit: z.coerce.number().min(1).max(50).optional(), offset: z.coerce.number().min(0).optional(), location: z.string().optional(), function: z.string().optional() });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/people/search?${new URLSearchParams({ query: parsed.q || '', limit: String(parsed.limit||10), offset: String(parsed.offset||0), location: parsed.location||'', function: parsed.function||'' })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/search/companies', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ q: z.string().optional(), industry: z.string().optional(), limit: z.coerce.number().min(1).max(50).optional(), offset: z.coerce.number().min(0).optional() });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/company/search?${new URLSearchParams({ query: parsed.q || '', industry: parsed.industry||'', limit: String(parsed.limit||10), offset: String(parsed.offset||0) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/search/products', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ q: z.string().optional(), limit: z.coerce.number().min(1).max(50).optional(), offset: z.coerce.number().min(0).optional(), offsite: z.coerce.number().min(0).max(1).default(1) });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const searchParams = new URLSearchParams({ query: parsed.q || '', limit: String(parsed.limit||10), offsite: String(parsed.offsite) });
  if (parsed.offset) searchParams.set('offset', String(parsed.offset));
  const path = `/product/search?${searchParams}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/search/jobs', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({
    q: z.string().optional(),
    location: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
    offset: z.coerce.number().min(0).optional(),
    offsite: z.coerce.number().min(0).max(1).optional(),
    geo: z.string().optional(),
  });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  // RapidAPI endpoint: /job/search supports query/offsite/limit/geo
  const searchParams = new URLSearchParams({
    query: parsed.q || '',
    limit: String(parsed.limit || 10),
  });
  if (parsed.location) searchParams.set('location', parsed.location);
  if (parsed.offset != null) {
    searchParams.set('offset', String(parsed.offset));
    // Some variants use 'start' instead of 'offset'. Send both to maximize compatibility.
    searchParams.set('start', String(parsed.offset));
  }
  if (parsed.offsite != null) searchParams.set('offsite', String(parsed.offsite));
  if (parsed.geo) searchParams.set('geo', parsed.geo);
  const path = `/job/search?${searchParams.toString()}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/search/posts', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ q: z.string().optional(), limit: z.coerce.number().min(1).max(50).optional(), offset: z.coerce.number().min(0).optional() });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/post/search?${new URLSearchParams({ query: parsed.q || '', limit: String(parsed.limit||10), offset: String(parsed.offset||0) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/events', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ status: z.enum(['upcoming','ongoing']).default('upcoming'), limit: z.coerce.number().min(1).max(50).optional() });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/events?${new URLSearchParams({ status: parsed.status, limit: String(parsed.limit||10) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/companies/:companyId', async (c) => {
  const g = await guard(c); if (g) return g;
  const { companyId } = c.req.param();
  const path = `/company/details?${new URLSearchParams({ companyId })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/companies/:companyId/employees', async (c) => {
  const g = await guard(c); if (g) return g;
  const { companyId } = c.req.param();
  const limit = new URL(c.req.url).searchParams.get('limit') || '10';
  const path = `/company/employees?${new URLSearchParams({ companyId, limit })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/products/:productId', async (c) => {
  const g = await guard(c); if (g) return g;
  const { productId } = c.req.param();
  const path = `/product/details?${new URLSearchParams({ productId })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/products/trending', async (c) => {
  const g = await guard(c); if (g) return g;
  const limit = new URL(c.req.url).searchParams.get('limit') || '10';
  const path = `/product/trending?${new URLSearchParams({ limit })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/jobs/:jobId', async (c) => {
  const g = await guard(c); if (g) return g;
  const { jobId } = c.req.param();
  
  // Use the /job/detail endpoint which contains the actual job description
  const path = `/job/detail?${new URLSearchParams({ query: jobId })}`;

  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(async () => {
    try {
      const response = await fetchRapid(c.env, path);
      
      if (response.ok) {
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Extract and restructure the job data for easier frontend consumption
        if (data?.success && data?.data?.elements) {
          const elements = data.data.elements;
          
          // Find the job description section (usually in elements[1])
          const jobDescSection = elements.find((el: any) => 
            el?.jobPostingDetailSection?.[0]?.jobDescription
          )?.jobPostingDetailSection?.[0]?.jobDescription;
          
          // Find the top card section (usually in elements[0])
          const topCardSection = elements.find((el: any) => 
            el?.jobPostingDetailSection?.[0]?.topCard
          )?.jobPostingDetailSection?.[0]?.topCard;
          
          // Create a structured response
          const structuredData = {
            ...data,
            extractedData: {
              jobDescription: jobDescSection?.jobPosting?.description?.text || null,
              postedDate: jobDescSection?.postedOnText || null,
              entityUrn: jobDescSection?.jobPosting?.entityUrn || null,
              topCard: topCardSection || null,
              hasFullDescription: !!jobDescSection?.jobPosting?.description?.text
            }
          };
          
          return new Response(JSON.stringify(structuredData), { 
            status: response.status, 
            headers: response.headers 
          });
        }
        
        // Return original response if structure is unexpected
        return new Response(text, { 
          status: response.status, 
          headers: response.headers 
        });
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching job details for ${jobId}:`, error);
      return new Response(
        JSON.stringify({ code: 500, message: 'Failed to fetch job details' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }));
});

// Optional: extended detail (kept for compatibility)
app.get('/api/jobs/:jobId/full', async (c) => {
  const g = await guard(c); if (g) return g;
  const { jobId } = c.req.param();
  const url = new URL(c.req.url);
  const offsite = url.searchParams.get('offsite') ?? '1';
  const limit = url.searchParams.get('limit') ?? '10';
  const path = `/job/detail-detail?${new URLSearchParams({ query: jobId, offsite, limit })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

// Job function search
app.get('/api/search/jobfunction', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ query: z.string(), offsite: z.coerce.number().min(0).max(1).default(0), limit: z.coerce.number().min(1).max(50).default(21) });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/search/jobfunction?${new URLSearchParams({ query: parsed.query, offsite: String(parsed.offsite), limit: String(parsed.limit) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

// Location search
app.get('/api/search/location', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ query: z.string(), offsite: z.coerce.number().min(0).max(1).default(0), limit: z.coerce.number().min(1).max(50).default(11) });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/search/location?${new URLSearchParams({ query: parsed.query, offsite: String(parsed.offsite), limit: String(parsed.limit) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

// Industry search
app.get('/api/search/industry', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ query: z.string(), offsite: z.coerce.number().min(0).max(1).default(0), limit: z.coerce.number().min(1).max(50).default(10) });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/search/industry?${new URLSearchParams({ query: parsed.query, offsite: String(parsed.offsite), limit: String(parsed.limit) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

// Company search
app.get('/api/search/company', async (c) => {
  const g = await guard(c); if (g) return g;
  const schema = z.object({ query: z.string(), offsite: z.coerce.number().min(0).max(1).default(0), limit: z.coerce.number().min(1).max(50).default(10) });
  let parsed; try { parsed = getValidatedSearchParams(new URL(c.req.url), schema); } catch (e: any) { return jsonError(400, 'Invalid query', e.issues); }
  const path = `/search/company?${new URLSearchParams({ query: parsed.query, offsite: String(parsed.offsite), limit: String(parsed.limit) })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.get('/api/posts/:postId', async (c) => {
  const g = await guard(c); if (g) return g;
  const { postId } = c.req.param();
  const path = `/post/details?${new URLSearchParams({ postId })}`;
  return cacheFetch(c.req.raw, c.env, async () => withConcurrency(() => fetchRapid(c.env, path)));
});

app.post('/api/posts/:postId/comment', async (c) => {
  const g = await guard(c); if (g) return g;
  const { postId } = c.req.param();
  const body = await c.req.json().catch(()=>null) as { text?: string } | null;
  if (!body?.text) return new Response(JSON.stringify({ code: 400, message: 'Missing text' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  const key = `comments:${postId}`;
  const existing = await c.env.LINKEDIN_HUB_KV.get<string[]>(key, 'json') || [];
  existing.push(body.text);
  await c.env.LINKEDIN_HUB_KV.put(key, JSON.stringify(existing));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

app.get('/api/admin/usage', async (c) => {
  const user = (c as any).user;
  if (user.role !== 'admin') return new Response(JSON.stringify({ code: 403, message: 'Admin only' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ timestamp: Date.now(), message: 'Usage metrics placeholder' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

app.post('/api/admin/refresh-cache', async (c) => {
  const user = (c as any).user;
  if (user.role !== 'admin') return new Response(JSON.stringify({ code: 403, message: 'Admin only' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});

export default app;
