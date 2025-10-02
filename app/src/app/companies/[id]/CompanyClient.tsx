'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface CompanyClientProps {
  id: string;
}

export default function CompanyClient({ id }: CompanyClientProps) {
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [d, e] = await Promise.all([
          api.company(id),
          api.companyEmployees(id, 10),
        ]);
        setData(d);
        setEmployees(Array.isArray((e as any)?.results) ? (e as any).results : (e as any)?.data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load company');
      }
    })();
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Company {id}</h1>
      <section className="p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Profile</h2>
        <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
      </section>
      <section className="p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Employees</h2>
        <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(employees, null, 2)}</pre>
      </section>
    </main>
  );
}
