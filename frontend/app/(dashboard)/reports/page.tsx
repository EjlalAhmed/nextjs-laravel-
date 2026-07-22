'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MonthlyReport = {
  month: string;
  income: number;
  expense: number;
};

type YearlyReport = {
  year: number;
  income: number;
  expense: number;
};

const chartMargin = { top: 18, right: 24, left: 8, bottom: 4 };

function money(value: number) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<MonthlyReport[]>([]);
  const [yearly, setYearly] = useState<YearlyReport[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    Promise.all([
      axios.get('http://127.0.0.1:8000/api/reports/monthly', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://127.0.0.1:8000/api/reports/yearly', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([monthlyRes, yearlyRes]) => {
        setMonthly(monthlyRes.data);
        setYearly(yearlyRes.data);
        setError('');
      })
      .catch(() => setError('Reports data load nahi ho saka. Backend server aur login token check karein.'));
  }, []);

  return (
    <div className="ledger-page">
      {error && <div className="alert-error">{error}</div>}

      <section className="card report-card">
        <div className="section-heading">
          <div>
            <p className="muted">Report</p>
            <h2>Monthly Line and Bar Report</h2>
          </div>
        </div>

        <div className="report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthly} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="month" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="income" name="Income Bar" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense Bar" fill="var(--danger)" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="income" name="Income Line" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expense" name="Expense Line" stroke="var(--accent-2)" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card report-card">
        <div className="section-heading">
          <div>
            <p className="muted">Report</p>
            <h2>Yearly Line and Bar Report</h2>
          </div>
        </div>

        <div className="report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yearly} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="year" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="income" name="Income Bar" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense Bar" fill="var(--danger)" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="income" name="Income Line" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="expense" name="Expense Line" stroke="var(--accent-2)" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
