'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function JobPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.job(id).then(setData).catch((e)=>setError(e?.message||'Failed to load job'));
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Job {id}</h1>
      <section className="p-4 bg-white rounded shadow">
        <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
      </section>
    </main>
  );
}
