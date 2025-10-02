'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ProductClientProps {
  id: string;
}

export default function ProductClient({ id }: ProductClientProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const d = await api.product(id);
        setData(d);
      } catch (err: any) {
        setError(err?.message || 'Failed to load product');
      }
    })();
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Product {id}</h1>
      <section className="p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Details</h2>
        <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
      </section>
    </main>
  );
}
