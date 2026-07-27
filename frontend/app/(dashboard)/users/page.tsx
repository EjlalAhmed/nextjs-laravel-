'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

type Role = 'super_admin' | 'admin' | 'user';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_by?: number | Pick<User, 'id' | 'name' | 'email' | 'role'> | null;
  created_by_user?: Pick<User, 'id' | 'name' | 'email' | 'role'> | null;
  createdBy?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: Role;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

function roleLabel(role: string) {
  return role.replaceAll('_', ' ');
}

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const roleOptions = useMemo<Role[]>(() => {
    if (currentUser?.role === 'super_admin') {
      return ['admin', 'user'];
    }

    if (currentUser?.role === 'admin') {
      return ['user'];
    }

    return [];
  }, [currentUser?.role]);

  const loadPage = async () => {
    setLoading(true);
    setError('');

    try {
      const [meResponse, usersResponse] = await Promise.all([
        axios.get(`${API}/me`, { headers: authHeaders() }),
        axios.get(`${API}/users`, { headers: authHeaders() }),
      ]);

      setCurrentUser(meResponse.data);
      setUsers(usersResponse.data.data);
    } catch {
      setError('Users load nahi ho sake. Apna role ya login check karein.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (roleOptions.length > 0 && !roleOptions.includes(form.role)) {
      setForm((value) => ({ ...value, role: roleOptions[0] }));
    }
  }, [form.role, roleOptions]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await axios.post(`${API}/users`, form, { headers: authHeaders() });
      setMessage(`${roleLabel(form.role)} create new user.`);
      setForm({ name: '', email: '', password: '', role: roleOptions[0] ?? 'user' });
      await loadPage();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('You are not authorized to create this role.');
      } else {
        setError('Failed to create the user. Please verify the provided details.');
      }
    } finally {
      setSaving(false);
    }
  };

  const creatorName = (user: User) => {
    if (user.created_by_user?.name) {
      return user.created_by_user.name;
    }

    if (user.createdBy?.name) {
      return user.createdBy.name;
    }

    if (typeof user.created_by === 'object' && user.created_by?.name) {
      return user.created_by.name;
    }

    if (typeof user.created_by === 'number') {
      return `#${user.created_by}`;
    }

    return '-';
  };

  if (loading) {
    return <div className="card">Loading users...</div>;
  }

  if (!currentUser || roleOptions.length === 0) {
    return (
      <div className="card">
        <h1 style={{ margin: 0, fontSize: 22 }}>Users</h1>
        <p className="muted">Is page ke liye admin ya super admin role chahiye.</p>
      </div>
    );
  }

  return (
    <div className="users-page">
      <section className="section-heading">
        <div>
          <p>Management</p>
          <h2>Users</h2>
        </div>
        <span className="role-pill">{roleLabel(currentUser.role)}</span>
      </section>

      <div className="users-grid">
        <section className="card">
          <h1 style={{ margin: '0 0 14px', fontSize: 20 }}>Create account</h1>
          <form className="user-form" onSubmit={handleSubmit}>
            <input
              className="form-input"
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <input
              className="form-input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
            <input
              className="form-input"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              minLength={6}
            />
            <select
              className="form-input"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
            </button>
          </form>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="alert-error">{error}</p>}
        </section>

        <section className="card">
          <div className="section-heading compact">
            <div>
              <p>Hierarchy</p>
              <h2>Created accounts</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="role-chip">{roleLabel(user.role)}</span>
                    </td>
                    <td>{creatorName(user)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      Abhi koi account create nahi hua.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
