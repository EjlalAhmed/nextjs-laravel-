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
    <div style={{display:'grid',gap:20,gridTemplateColumns:'1.3fr 0.9fr'}}>
      <div className="card">
        <h1 style={{marginBottom:12,fontSize:20,fontWeight:700}}>Categories</h1>
        <div style={{display:'grid',gap:10}}>
          {categories.map((category) => (
            <div key={category.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12,borderRadius:8}}>
              <div>
                <p style={{fontWeight:700}}>{category.name}</p>
                <p className="muted" style={{fontSize:12}}>{category.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{marginBottom:12,fontSize:18,fontWeight:700}}>Add Category</h2>
        <form style={{display:'grid',gap:12}} onSubmit={handleSubmit}>
          <input className="form-input" placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button className="btn">Save</button>
        </form>
      </div>
    </div>
  );
}
