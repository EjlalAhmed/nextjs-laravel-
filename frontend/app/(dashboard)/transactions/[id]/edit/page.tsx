'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface Category { id: number; name: string; type: string; }

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ category_id: '', type: 'expense', amount: '', description: '', transaction_date: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setCategories(res.data));
    axios.get(`http://127.0.0.1:8000/api/transactions/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
      setForm({
        category_id: res.data.category_id || '',
        type: res.data.type,
        amount: res.data.amount,
        description: res.data.description || '',
        transaction_date: res.data.transaction_date,
      });
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.put(`http://127.0.0.1:8000/api/transactions/${params.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
    router.push('/transactions');
  };

  return (
    <div className="max-w-2xl rounded-2xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-semibold">Edit Transaction</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <select className="w-full rounded border p-3" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select category</option>
          {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
        </select>
        <select className="w-full rounded border p-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="w-full rounded border p-3" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input className="w-full rounded border p-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="w-full rounded border p-3" type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Update</button>
      </form>
    </div>
  );
}
