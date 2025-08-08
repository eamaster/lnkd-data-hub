import { Env } from '../types';

export async function fetchRapid(env: Env, path: string, init?: RequestInit): Promise<Response> {
  const url = `https://${env.RAPIDAPI_HOST}${path}`;
  const headers = new Headers(init?.headers || {});
  headers.set('x-rapidapi-key', env.RAPIDAPI_KEY);
  headers.set('x-rapidapi-host', env.RAPIDAPI_HOST);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/x-www-form-urlencoded');

  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, { ...init, headers });
    if (res.status < 500 && res.status !== 429) {
      return res;
    }
    if (attempt === maxRetries) return res;
    const backoffMs = Math.min(1000 * Math.pow(2, attempt), 8000);
    await new Promise((r) => setTimeout(r, backoffMs));
  }
  // unreachable
  return new Response('Failed to fetch', { status: 500 });
}
