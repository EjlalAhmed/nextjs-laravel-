'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://127.0.0.1:8000/api/reports/monthly', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setMonthly(res.data));
    axios.get('http://127.0.0.1:8000/api/reports/category-wise', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setCategoryData(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 style={{marginBottom:12,fontSize:18,fontWeight:700}}>Monthly Report</h2>
        <div style={{height:320}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#06b6d4" />
              <Bar dataKey="expense" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 style={{marginBottom:12,fontSize:18,fontWeight:700}}>Category Report</h2>
        <div style={{height:320}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="total" nameKey="category" outerRadius={120}>
                {categoryData.map((entry, index) => (<Cell key={entry.category} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
