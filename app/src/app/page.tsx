import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">LinkedIn Data Hub</h1>
      <p className="text-gray-700">Search people, companies, products, jobs, posts, and events — securely via Cloudflare Workers.</p>
      <div className="flex gap-4">
        <Link className="px-4 py-2 rounded bg-blue-600 text-white" href="/dashboard">Dashboard</Link>
        <Link className="px-4 py-2 rounded bg-gray-200" href="/search">Unified Search</Link>
      </div>
    </main>
  );
}
