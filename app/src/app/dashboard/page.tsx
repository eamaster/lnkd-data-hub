export default function Dashboard() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Usage & Quota</div>
        <div className="p-4 bg-white rounded shadow">Recent Searches</div>
        <div className="p-4 bg-white rounded shadow">Saved Items</div>
      </div>
    </main>
  );
}
