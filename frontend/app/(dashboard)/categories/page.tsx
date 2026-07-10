'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Category { id: number; name: string; type: string; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');

  const loadCategories = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://127.0.0.1:8000/api/categories', { headers: { Authorization: `Bearer ${token}` } });
    setCategories(res.data);
  };

  useEffect(() => { loadCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('http://127.0.0.1:8000/api/categories', { name, type }, { headers: { Authorization: `Bearer ${token}` } });
    setName('');
    loadCategories();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Categories</h1>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-slate-500">{category.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Add Category</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input className="w-full rounded border p-3" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="w-full rounded border p-3" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button className="rounded bg-blue-600 px-4 py-2 text-white">Save</button>
        </form>
      </div>
    </div>
  );
}
