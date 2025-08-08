'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function AdminPage(){
  const [usage, setUsage] = useState<any>(null);
  const [msg, setMsg] = useState('');

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="flex gap-2">
        <button onClick={async()=> setUsage(await api.admin.usage())} className="px-4 py-2 bg-gray-200 rounded">Fetch Usage</button>
        <button onClick={async()=> { await api.admin.refreshCache(); setMsg('Cache refresh triggered'); }} className="px-4 py-2 bg-gray-200 rounded">Refresh Cache</button>
      </div>
      {usage && <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(usage, null, 2)}</pre>}
      {msg && <div>{msg}</div>}
    </main>
  );
}
