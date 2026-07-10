'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Category { id: number; name: string; type: string; }

export default function CreateTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ category_id: '', type: 'expense', amount: '', description: '', transaction_date: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setCategories(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('http://127.0.0.1:8000/api/transactions', form, { headers: { Authorization: `Bearer ${token}` } });
    router.push('/transactions');
  };

  return (
    <div className="max-w-2xl rounded-[24px] border border-stone-300 bg-[#fffdfa] p-8 shadow-[0_12px_35px_-20px_rgba(74,47,22,0.35)]">
      <p className="text-sm uppercase tracking-[0.3em] text-stone-500">New Entry</p>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-stone-800">Add Transaction</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <select className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select category</option>
          {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
        </select>
        <select className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700" type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
        <button className="rounded-xl bg-stone-800 px-4 py-2 text-white transition hover:bg-stone-700">Save</button>
      </form>
    </div>
  );
}
