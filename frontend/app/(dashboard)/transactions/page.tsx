'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface TransactionItem {
  id: number;
  description: string;
  amount: number;
  type: string;
  transaction_date: string;
  category?: { name: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [type, search]);

  const loadTransactions = async () => {
    const token = localStorage.getItem('token');
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (search) params.search = search;

    const res = await axios.get('http://127.0.0.1:8000/api/transactions', { headers: { Authorization: `Bearer ${token}` }, params });
    setTransactions(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Ledger</p>
          <h1 className="text-2xl font-semibold text-stone-800">Transactions</h1>
        </div>
        <a href="/transactions/create" className="rounded-xl bg-stone-800 px-4 py-2 text-white transition hover:bg-stone-700">Add Transaction</a>
      </div>

      <div className="rounded-[20px] border border-stone-300 bg-[#fffdfa] p-4 shadow-sm">
        <div className="flex gap-3">
          <select className="rounded-xl border border-stone-300 bg-white p-2 text-stone-700" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input className="flex-1 rounded-xl border border-stone-300 bg-white p-2 text-stone-700" placeholder="Search description" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-stone-300 bg-[#fffdfa] shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-stone-100">
            <tr>
              <th className="p-3 text-stone-700">Description</th>
              <th className="p-3 text-stone-700">Category</th>
              <th className="p-3 text-stone-700">Type</th>
              <th className="p-3 text-stone-700">Amount</th>
              <th className="p-3 text-stone-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-stone-200">
                <td className="p-3 text-stone-800">{transaction.description}</td>
                <td className="p-3 text-stone-700">{transaction.category?.name ?? 'N/A'}</td>
                <td className="p-3 capitalize text-stone-700">{transaction.type}</td>
                <td className={`p-3 font-semibold ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>${transaction.amount}</td>
                <td className="p-3 text-stone-700">{transaction.transaction_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
