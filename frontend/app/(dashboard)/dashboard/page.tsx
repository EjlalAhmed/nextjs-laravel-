'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';

type Ledger = {
  id: number;
  name: string;
  category?: string | null;
  opening_debit: number;
  opening_credit: number;
  debit: number;
  credit: number;
  balance: number;
};

type Journal = {
  id: number;
  entry_date: string;
  first_ledger: string;
  second_ledger: string;
  reference_no?: string | null;
  description: string;
  debit: number;
  credit: number;
};

function money(value: number) {
  return `PKR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function DashboardPage() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    Promise.all([
      axios.get(`${API}/ledgers`, { headers: authHeaders() }),
      axios.get(`${API}/journals`, { headers: authHeaders() }),
    ])
      .then(([ledgerRes, journalRes]) => {
        setLedgers(ledgerRes.data);
        setJournals(journalRes.data.slice(0, 5));
        setError('');
      })
      .catch(() => setError('Dashboard ledger data load nahi ho saka.'));
  }, []);

  const summary = useMemo(() => {
    const openingDebit = ledgers.reduce((sum, ledger) => sum + Number(ledger.opening_debit || 0), 0);
    const openingCredit = ledgers.reduce((sum, ledger) => sum + Number(ledger.opening_credit || 0), 0);
    const movementDebit = ledgers.reduce((sum, ledger) => sum + Number(ledger.debit || 0), 0) - openingDebit;
    const movementCredit = ledgers.reduce((sum, ledger) => sum + Number(ledger.credit || 0), 0) - openingCredit;
    const closingDebit = ledgers.reduce((sum, ledger) => sum + (ledger.balance >= 0 ? Number(ledger.balance) : 0), 0);
    const closingCredit = ledgers.reduce((sum, ledger) => sum + (ledger.balance < 0 ? Math.abs(Number(ledger.balance)) : 0), 0);

    return {
      openingDebit,
      openingCredit,
      movementDebit,
      movementCredit,
      closingDebit,
      closingCredit,
      netBalance: closingDebit - closingCredit,
    };
  }, [ledgers]);

  return (
    <div className="ledger-page">
      <section className="ledger-hero dashboard-hero">
        <p className="muted">Dashboard</p>
        <h1>Ledger Summary</h1>
      </section>

      {error && <div className="alert-error">{error}</div>}

      <section className="card dashboard-summary-panel">
        <div className="section-heading">
          <div>
            <p className="muted">Overview</p>
            <h2>Opening, Movement and Closing Balance</h2>
          </div>
          <Link className="theme-link-btn" href="/ledger">Open Ledger</Link>
        </div>

        <div className="kpi-grid">
          <SummaryCard label="Opening Debit" value={summary.openingDebit} tone="debit" />
          <SummaryCard label="Opening Credit" value={summary.openingCredit} tone="credit" />
          <SummaryCard label="Movement Debit" value={summary.movementDebit} tone="debit" />
          <SummaryCard label="Movement Credit" value={summary.movementCredit} tone="credit" />
          <SummaryCard label="Closing Debit" value={summary.closingDebit} tone="debit" />
          <SummaryCard label="Closing Credit" value={summary.closingCredit} tone="credit" />
          <SummaryCard label="Net Balance" value={summary.netBalance} tone={summary.netBalance >= 0 ? 'debit' : 'credit'} />
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="muted">Records</p>
            <h2>General Ledger Entries</h2>
          </div>
          <Link className="theme-link-btn" href="/ledger">View all</Link>
        </div>

        <table className="table ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Debit Ledger</th>
              <th>Credit Ledger</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.entry_date}</td>
                <td>{entry.first_ledger}</td>
                <td>{entry.second_ledger}</td>
                <td>{entry.description}</td>
                <td className="amount-dr">{money(entry.debit)}</td>
                <td className="amount-cr">{money(entry.credit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'debit' | 'credit' }) {
  return (
    <div className="card summary-card">
      <p className="muted">{label}</p>
      <strong className={tone === 'debit' ? 'amount-dr' : 'amount-cr'}>{money(value)}</strong>
    </div>
  );
}
