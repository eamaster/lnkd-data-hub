'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    api.post(id).then(setData).catch(()=>{});
  }, [id]);

  const submit = async () => {
    try {
      await api.comment(id, { text });
      setMsg('Comment submitted (or stored locally).');
      setText('');
    } catch (e:any) {
      setMsg(e?.message||'Failed to submit');
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Post {id}</h1>
      <section className="p-4 bg-white rounded shadow">
        <pre className="text-sm whitespace-pre-wrap break-all">{JSON.stringify(data, null, 2)}</pre>
      </section>
      <section className="p-4 bg-white rounded shadow space-y-2">
        <h2 className="font-semibold">Add Comment</h2>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full border p-2 rounded" />
        <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
        {msg && <div>{msg}</div>}
      </section>
    </main>
  );
}
