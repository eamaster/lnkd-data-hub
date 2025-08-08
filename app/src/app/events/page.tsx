'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function EventsPage() {
  const [status, setStatus] = useState<'upcoming'|'ongoing'>('upcoming');
  const [results, setResults] = useState<any[]>([]);

  const run = async () => {
    const params = new URLSearchParams();
    params.set('status', status);
    params.set('limit', '10');
    const data = await api.events(params);
    setResults(Array.isArray(data?.results) ? data.results : data?.data || []);
  };

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Events</h1>
      <div className="flex gap-2">
        <select value={status} onChange={(e)=>setStatus(e.target.value as any)} className="border p-2 rounded">
          <option value="upcoming">upcoming</option>
          <option value="ongoing">ongoing</option>
        </select>
        <button onClick={run} className="px-4 py-2 bg-blue-600 text-white rounded">Load</button>
      </div>
      <ul className="space-y-2">
        {results.map((r, i)=> (
          <li key={i} className="p-3 bg-white rounded shadow text-sm overflow-auto">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(r, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </main>
  );
}
