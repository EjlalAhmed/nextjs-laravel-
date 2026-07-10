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

    axios.get('http://127.0.0.1:8000/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
      setSummary(res.data.summary);
      setTransactions(res.data.transactions);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-stone-300 bg-[#fffdfa] p-6 shadow-[0_12px_35px_-20px_rgba(74,47,22,0.4)]">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-800">Your financial snapshot</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[20px] border border-stone-300 bg-[#fffdfa] p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-stone-800">${summary?.total_income ?? 0}</p>
        </div>
        <div className="rounded-[20px] border border-stone-300 bg-[#fffdfa] p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total Expense</p>
          <p className="mt-2 text-2xl font-semibold text-stone-800">${summary?.total_expense ?? 0}</p>
        </div>
        <div className="rounded-[20px] border border-stone-300 bg-[#fffdfa] p-5 shadow-sm">
          <p className="text-sm text-stone-500">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-stone-800">${summary?.balance ?? 0}</p>
        </div>
        <div className="rounded-[20px] border border-stone-300 bg-[#fffdfa] p-5 shadow-sm">
          <p className="text-sm text-stone-500">Monthly Budget</p>
          <p className="mt-2 text-2xl font-semibold text-stone-800">${summary?.monthly_budget ?? 0}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-stone-300 bg-[#fffdfa] p-6 shadow-[0_12px_35px_-20px_rgba(74,47,22,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-800">Recent Transactions</h2>
          <a href="/transactions" className="text-sm font-medium text-stone-700 underline">View all</a>
        </div>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3">
              <div>
                <p className="font-medium text-stone-800">{transaction.description}</p>
                <p className="text-sm text-stone-500">{transaction.transaction_date}</p>
              </div>
              <span className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
