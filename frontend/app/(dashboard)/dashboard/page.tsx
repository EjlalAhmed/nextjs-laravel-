'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
  monthly_budget: number;
}

interface TransactionItem {
  id: number;
  description: string;
  amount: number;
  type: string;
  transaction_date: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    axios
      .get('http://127.0.0.1:8000/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setSummary(res.data.summary);
        setTransactions(res.data.transactions);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="muted" style={{ textTransform: 'uppercase', letterSpacing: '.15em', fontSize: 12 }}>
          Overview
        </p>
        <h1 style={{ marginTop: 8, fontSize: 26, fontWeight: 700 }}>Your financial snapshot</h1>
      </div>

      <div className="kpi-grid">
        <div className="card">
          <p className="muted">Total Income</p>
          <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>${summary?.total_income ?? 0}</p>
        </div>
        <div className="card">
          <p className="muted">Total Expense</p>
          <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>${summary?.total_expense ?? 0}</p>
        </div>
        <div className="card">
          <p className="muted">Balance</p>
          <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>${summary?.balance ?? 0}</p>
        </div>
        <div className="card">
          <p className="muted">Monthly Budget</p>
          <p style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>${summary?.monthly_budget ?? 0}</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Transactions</h2>
          <a href="/transactions" className="muted">
            View all
          </a>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="muted">Type</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th className="muted">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{transaction.description}</div>
                </td>
                <td className="muted">{transaction.type}</td>
                <td style={{ textAlign: 'right' }} className={transaction.type === 'income' ? 'badge-income' : 'badge-expense'}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </td>
                <td className="muted">{transaction.transaction_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
