export const WORKER_BASE_URL = process.env.NEXT_PUBLIC_WORKER_BASE_URL || 'http://127.0.0.1:8787';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
  const headers = new Headers(init?.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${WORKER_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw { code: res.status, message: err.message || 'Request failed', details: err.details };
  }
  return res.json();
}

export const api = {
  search: {
    people: (params: URLSearchParams) => request(`/api/search/people?${params.toString()}`),
    companies: (params: URLSearchParams) => request(`/api/search/companies?${params.toString()}`),
    products: (params: URLSearchParams) => request(`/api/search/products?${params.toString()}`),
    jobs: (params: URLSearchParams) => request(`/api/search/jobs?${params.toString()}`),
    posts: (params: URLSearchParams) => request(`/api/search/posts?${params.toString()}`),
  },
  events: (params: URLSearchParams) => request(`/api/events?${params.toString()}`),
  companies: {
    details: (id: string) => request(`/api/companies/${id}`),
    employees: (id: string, limit?: number) => request(`/api/companies/${id}/employees?limit=${limit ?? 10}`),
  },
  products: {
    details: (id: string) => request(`/api/products/${id}`),
    trending: (limit?: number) => request(`/api/products/trending?limit=${limit ?? 10}`),
  },
  jobs: {
    details: (id: string) => request(`/api/jobs/${id}`),
    full: (id: string, opts?: { offsite?: number; limit?: number }) => {
      const p = new URLSearchParams();
      if (opts?.offsite != null) p.set('offsite', String(opts.offsite)); else p.set('offsite', '1');
      if (opts?.limit != null) p.set('limit', String(opts.limit)); else p.set('limit', '10');
      return request(`/api/jobs/${id}/full?${p.toString()}`);
    },
  },
  posts: {
    details: (id: string) => request(`/api/posts/${id}`),
    comment: (postId: string, body: { text: string }) => request(`/api/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify(body) }),
  },
  // Legacy compatibility
  company: (id: string) => request(`/api/companies/${id}`),
  companyEmployees: (id: string, limit?: number) => request(`/api/companies/${id}/employees?limit=${limit ?? 10}`),
  product: (id: string) => request(`/api/products/${id}`),
  trendingProducts: (limit?: number) => request(`/api/products/trending?limit=${limit ?? 10}`),
  job: (id: string) => request(`/api/jobs/${id}`),
  post: (id: string) => request(`/api/posts/${id}`),
  comment: (postId: string, body: { text: string }) => request(`/api/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify(body) }),
  admin: {
    usage: () => request(`/api/admin/usage`),
    refreshCache: () => request(`/api/admin/refresh-cache`, { method: 'POST' }),
  },
};
