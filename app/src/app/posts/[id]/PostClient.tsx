'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface PostClientProps {
  id: string;
}

export default function PostClient({ id }: PostClientProps) {
  const [data, setData] = useState<any>(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const d = await api.post(id);
        setData(d);
        setText(JSON.stringify(d, null, 2));
      } catch (err: any) {
        setMsg(err?.message || 'Failed to load post');
      }
    })();
  }, [id]);

  if (msg) return <div className="p-6 text-red-600">{msg}</div>;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Post {id}</h1>
      <section className="p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-2">Content</h2>
        <pre className="text-sm whitespace-pre-wrap break-all">{text}</pre>
      </section>
    </main>
  );
}
