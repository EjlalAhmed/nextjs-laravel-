'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/api/profile', { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
      setName(res.data.name);
      setEmail(res.data.email);
    });
  }, []);

  return (
    <div className="max-w-2xl rounded-2xl bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>
      <div className="space-y-4">
        <input className="w-full rounded border p-3" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded border p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
    </div>
  );
}
