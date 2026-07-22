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
      router.push('/ledger');
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="card" style={{maxWidth:480,width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:12}}>
          <p className="muted" style={{textTransform:'uppercase',letterSpacing:'.18em'}}>FlowExpense</p>
          <h1 style={{marginTop:8,fontSize:22,fontWeight:700}}>Welcome back</h1>
          <p className="muted" style={{marginTop:6,fontSize:13}}>Sign in to continue managing your accounts.</p>
        </div>
        <form onSubmit={handleSubmit} style={{display:'grid',gap:12}}>
          <input className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="form-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="muted" style={{marginTop:14,textAlign:'center',fontSize:13}}>
          No account? <a className="muted" href="/register" style={{fontWeight:700,textDecoration:'underline'}}>Create one</a>
        </p>
      </div>
    </div>
  );
}
