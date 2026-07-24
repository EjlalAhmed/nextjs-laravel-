'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const logoutToLogin = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      logoutToLogin();
      return;
    }

    axios
      .get(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setName(res.data.name ?? '');
        setEmail(res.data.email ?? '');
        setRole(res.data.role ?? 'user');
      })
      .catch(() => logoutToLogin())
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      logoutToLogin();
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      await axios.put(
        `${API}/profile`,
        {
          name,
          email,
          password: password || undefined,
          password_confirmation: passwordConfirmation || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPassword('');
      setPasswordConfirmation('');
      setMessage('Profile update ho gaya.');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logoutToLogin();
      } else {
        setError('Profile save nahi ho saka. Name, email aur password check karein.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <section className="section-heading">
        <div>
          <p>Account</p>
          <h2>Profile</h2>
        </div>
        <span className="role-pill">{role.replaceAll('_', ' ')}</span>
      </section>

      <section className="card profile-card">
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Email
            <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            New password
            <input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Leave empty to keep current password" />
          </label>
          <label>
            Confirm password
            <input className="form-input" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Confirm new password" />
          </label>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="alert-error">{error}</p>}
      </section>
    </div>
  );
}
