'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f9f5ea,_#efe4cc)] px-4">
      <div className="w-full max-w-md rounded-[24px] border border-stone-300 bg-[#fffdfa] p-8 shadow-[0_16px_50px_-20px_rgba(74,47,22,0.35)]">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-stone-500">Classic Ledger</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-800">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-600">Sign in to continue managing your household accounts.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700 outline-none ring-0" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-700 outline-none ring-0" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full rounded-xl bg-stone-800 p-3 font-medium text-white transition hover:bg-stone-700" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-600">
          No account? <a className="font-medium text-stone-800 underline" href="/register">Create one</a>
        </p>
      </div>
    </div>
  );
}
