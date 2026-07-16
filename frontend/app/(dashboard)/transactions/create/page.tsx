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
    <div className="card" style={{maxWidth:720}}>
      <p className="muted" style={{textTransform:'uppercase',letterSpacing:'.16em'}}>New Entry</p>
      <h1 style={{marginTop:8,marginBottom:12,fontSize:20,fontWeight:700}}>Add Transaction</h1>
      <form style={{display:'grid',gap:12}} onSubmit={handleSubmit}>
        <select className="form-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select category</option>
          {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
        </select>
        <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="form-input" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <input className="form-input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="form-input" type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
        <button className="btn">Save</button>
      </form>
    </div>
  );
}
