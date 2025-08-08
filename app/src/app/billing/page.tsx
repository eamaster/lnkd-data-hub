'use client';
import { useState } from 'react';

export default function BillingPage(){
  const [plan, setPlan] = useState('BASIC');
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Subscription & Billing</h1>
      <div className="p-4 bg-white rounded shadow space-y-3">
        <select value={plan} onChange={(e)=>setPlan(e.target.value)} className="border p-2 rounded">
          {['BASIC','PRO','ULTRA','MEGA'].map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Update Plan (Stripe stub)</button>
      </div>
    </main>
  );
}
