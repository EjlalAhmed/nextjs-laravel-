'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Budget { id: number; amount: number; month: number; year: number; category?: { name: string } }

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState({ category_id: '', amount: '', month: '7', year: '2026' });

  const loadBudgets = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://127.0.0.1:8000/api/budgets', { headers: { Authorization: `Bearer ${token}` } });
    setBudgets(res.data);
  };

  useEffect(() => { loadBudgets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('http://127.0.0.1:8000/api/budgets', form, { headers: { Authorization: `Bearer ${token}` } });
    loadBudgets();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Budgets</h1>
        <div className="space-y-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="rounded border p-3">
              <p className="font-medium">{budget.category?.name ?? 'Category'}</p>
              <p className="text-sm text-slate-500">${budget.amount} for {budget.month}/{budget.year}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Add Budget</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded border p-3" placeholder="Category ID" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
          <input className="w-full rounded border p-3" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="w-full rounded border p-3" placeholder="Month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <input className="w-full rounded border p-3" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <button className="rounded bg-blue-600 px-4 py-2 text-white">Save</button>
        </form>
      </div>
    </div>
  );
}
