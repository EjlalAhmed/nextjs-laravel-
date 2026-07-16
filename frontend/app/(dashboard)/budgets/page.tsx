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
    <div style={{display:'grid',gap:20,gridTemplateColumns:'1.3fr 0.9fr'}}>
      <div className="card">
        <h1 style={{marginBottom:12,fontSize:20,fontWeight:700}}>Budgets</h1>
        <div style={{display:'grid',gap:10}}>
          {budgets.map((budget) => (
            <div key={budget.id} style={{padding:12,borderRadius:8}}>
              <p style={{fontWeight:700}}>{budget.category?.name ?? 'Category'}</p>
              <p className="muted">${budget.amount} for {budget.month}/{budget.year}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h2 style={{marginBottom:12,fontSize:18,fontWeight:700}}>Add Budget</h2>
        <form style={{display:'grid',gap:12}} onSubmit={handleSubmit}>
          <input className="form-input" placeholder="Category ID" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
          <input className="form-input" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="form-input" placeholder="Month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          <input className="form-input" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          <button className="btn">Save</button>
        </form>
      </div>
    </div>
  );
}
