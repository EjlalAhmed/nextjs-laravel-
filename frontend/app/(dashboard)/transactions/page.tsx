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
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p className="muted" style={{textTransform:'uppercase',letterSpacing:'.2em',fontSize:12}}>Ledger</p>
          <h1 style={{fontSize:22,fontWeight:700}}>Transactions</h1>
        </div>
        <a href="/transactions/create" className="btn">Add Transaction</a>
      </div>

      <div className="card">
        <div style={{display:'flex',gap:12}}>
          <select className="form-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input className="form-input" placeholder="Search description" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th style={{textAlign:'right'}}>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.description}</td>
                <td className="muted">{transaction.category?.name ?? 'N/A'}</td>
                <td className="muted">{transaction.type}</td>
                <td style={{textAlign:'right'}} className={transaction.type === 'income' ? 'badge-income' : 'badge-expense'}>${transaction.amount}</td>
                <td className="muted">{transaction.transaction_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
