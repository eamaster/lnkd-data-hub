'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type Tab = 'people' | 'companies' | 'products' | 'jobs' | 'posts' | 'events';

function normalizeResults(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const candidates = [data.results, data.data, data.items, data.list, data.elements];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  // Last resort: wrap the object so UI can render it
  return [data];
}

export default function SearchPage() {
  const [tab, setTab] = useState<Tab>('products');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('limit', '10');
    params.set('offset', String(page * 10));
    try {
      let data: any = {};
      switch (tab) {
        case 'people':
          data = await api.search.people(params);
          break;
        case 'companies':
          data = await api.search.companies(params);
          break;
        case 'products':
          params.set('offsite', '1');
          data = await api.search.products(params);
          break;
        case 'jobs':
          data = await api.search.jobs(params);
          break;
        case 'posts':
          data = await api.search.posts(params);
          break;
        case 'events':
          data = await api.events(params);
          break;
      }
      setResults(normalizeResults(data));
    } catch (e: any) {
      setError(e?.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Unified Search</h1>
      <div className="flex flex-wrap gap-2">
        {(['people','companies','products','jobs','posts','events'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab===t?'bg-blue-600 text-white':'bg-gray-200'}`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-3">
        <input value={query} onChange={(e)=>setQuery(e.target.value)} className="border p-2 rounded flex-1" placeholder="Search query" />
        <button onClick={run} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading?'Searching...':'Search'}</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <ul className="space-y-2">
        {results.map((r, i)=> (
          <li key={i} className="p-3 bg-white rounded shadow text-sm overflow-auto">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(r, null, 2)}</pre>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
    </main>
  );
}
