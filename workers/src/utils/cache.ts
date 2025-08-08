import { Env } from '../types';

export async function cacheFetch(request: Request, env: Env, fetcher: () => Promise<Response>): Promise<Response> {
  const cacheDefault = (globalThis as any).caches?.default;
  const url = new URL(request.url);
  const cacheKey = new Request(url.toString(), { headers: { 'cf-cache-key': 'v1' } });

  if (request.method === 'GET' && cacheDefault) {
    const cached = await cacheDefault.match(cacheKey);
    if (cached) return cached;
  }

  const response = await fetcher();
  if (request.method === 'GET' && response.ok && cacheDefault) {
    const ttl = Number(env.CACHE_TTL_SECONDS || 300);
    const toCache = new Response(response.body, response);
    toCache.headers.set('Cache-Control', `public, max-age=${ttl}`);
    await cacheDefault.put(cacheKey, toCache.clone());
    return toCache;
  }
  return response;
}
