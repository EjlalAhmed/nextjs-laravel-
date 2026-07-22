'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000/api';
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type Ledger = {
  id: number;
  name: string;
  category?: string | null;
  opening_debit: number;
  opening_credit: number;
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

type TrialRow = {
  id: number;
  name: string;
  opening_debit: number;
  opening_credit: number;
  movement_debit: number;
  movement_credit: number;
  closing_debit: number;
  closing_credit: number;
};

type Statement = {
  ledger: { id: number; name: string; opening_balance: number; closing_balance: number };
  entries: Array<{ id: number; entry_date: string; reference?: string; reference_no?: string | null; description: string; debit: number; credit: number; balance: number }>;
};

function money(value: number) {
  return Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

export default function LedgerPage() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [trialRows, setTrialRows] = useState<TrialRow[]>([]);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [modal, setModal] = useState<'journal' | 'trial' | 'ledgers' | 'add-ledger' | 'import' | 'add-entry' | 'statement' | null>(null);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [ledgerForm, setLedgerForm] = useState({ name: '', category: '', opening_debit: '', opening_credit: '' });
  const [entryForm, setEntryForm] = useState({ entry_date: new Date().toISOString().slice(0, 10), description: '', reference_no: '', debit_ledger_id: '', credit_ledger_id: '', amount: '' });
  const [file, setFile] = useState<File | null>(null);

  const filteredLedgers = useMemo(
    () => ledgers.filter((ledger) => ledger.name.toLowerCase().includes(search.toLowerCase())),
    [ledgers, search],
  );

  const totals = useMemo(
    () => ({
      debit: journals.reduce((sum, entry) => sum + Number(entry.debit || 0), 0),
      credit: journals.reduce((sum, entry) => sum + Number(entry.credit || 0), 0),
    }),
    [journals],
  );

  const loadLedgers = async () => {
    const res = await axios.get(`${API}/ledgers`, { headers: authHeaders() });
    setLedgers(res.data);
  };

  const loadJournals = async () => {
    const res = await axios.get(`${API}/journals`, { headers: authHeaders(), params: { month: month || undefined, date: date || undefined } });
    setJournals(res.data);
  };

  const loadTrialSheet = async () => {
    const res = await axios.get(`${API}/accounting/trial-sheet`, { headers: authHeaders(), params: { month: month || undefined, date: date || undefined } });
    setTrialRows(res.data);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    Promise.all([loadLedgers(), loadJournals(), loadTrialSheet()]).catch(() => setStatus('Ledger data load nahi ho saka.'));
  }, []);

  const refreshAll = async () => {
    await Promise.all([loadLedgers(), loadJournals(), loadTrialSheet()]);
  };

  const addLedger = async (event: FormEvent) => {
    event.preventDefault();
    await axios.post(`${API}/ledgers`, ledgerForm, { headers: authHeaders() });
    setLedgerForm({ name: '', category: '', opening_debit: '', opening_credit: '' });
    setModal(null);
    await refreshAll();
  };

  const addEntry = async (event: FormEvent) => {
    event.preventDefault();
    await axios.post(`${API}/journals`, entryForm, { headers: authHeaders() });
    setEntryForm({ entry_date: new Date().toISOString().slice(0, 10), description: '', reference_no: '', debit_ledger_id: '', credit_ledger_id: '', amount: '' });
    setModal(null);
    await refreshAll();
  };

  const deleteJournal = async (id: number) => {
    await axios.delete(`${API}/journals/${id}`, { headers: authHeaders() });
    await refreshAll();
  };

  const openStatement = async (ledger: Ledger) => {
    const res = await axios.get(`${API}/accounting/ledgers/${ledger.id}/statement`, { headers: authHeaders(), params: { month: month || undefined, date: date || undefined } });
    setStatement(res.data);
    setModal('statement');
  };

  const importExcel = async (event: FormEvent) => {
    event.preventDefault();

    if (!file) {
      setStatus('Pehle CSV file choose karein.');
      return;
    }

    const body = new FormData();
    body.append('file', file);
    const res = await axios.post(`${API}/accounting/import`, body, { headers: authHeaders() });
    setStatus(res.data.message);
    setFile(null);
    setModal(null);
    await refreshAll();
  };

  const exportExcel = async () => {
    const res = await axios.get(`${API}/accounting/export`, { headers: authHeaders(), responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ledger-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ledger-page">
      <section className="ledger-hero">
        <p className="muted">General Ledger</p>
        <h1>Hello Customer</h1>
      </section>

      {status && <div className="alert-error">{status}</div>}

      <section className="card ledger-panel">
        <div className="ledger-toolbar">
          <h2>General Ledger</h2>
          <div className="ledger-actions">
            <button className="btn" type="button" onClick={() => setModal('journal')}>+ Journal</button>
            <button className="btn" type="button" onClick={() => setModal('trial')}>+ Trial Sheet</button>
            <button className="btn" type="button" onClick={() => setModal('ledgers')}>+ View Ledgers</button>
            <button className="btn" type="button" onClick={() => setModal('add-ledger')}>+ Add Ledger</button>
            <button className="btn" type="button" onClick={() => setModal('import')}>+ Import Excel</button>
            <button className="btn" type="button" onClick={exportExcel}>+ Export Excel</button>
            <button className="btn" type="button" onClick={() => setModal('add-entry')}>+ Add Entry</button>
          </div>
        </div>

        <div className="table-tools">
          <span>Show <input value="10" readOnly /> entries</span>
          <label>Search: <input value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        </div>

        <table className="table ledger-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ledger Name</th>
              <th>Category</th>
              <th>Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedgers.map((ledger, index) => (
              <tr key={ledger.id}>
                <td>{index + 1}</td>
                <td>{ledger.name}</td>
                <td>{ledger.category || '--'}</td>
                <td className={ledger.balance >= 0 ? 'amount-dr' : 'amount-cr'}>{money(ledger.balance)}</td>
                <td><button className="mini-btn" type="button" onClick={() => openStatement(ledger)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {modal && (
        <div className="modal-backdrop">
          <div className="ledger-modal">
            <button className="modal-close" type="button" onClick={() => setModal(null)}>x</button>

            {modal === 'journal' && (
              <>
                <h2>General Journal</h2>
                <Filters month={month} date={date} setMonth={setMonth} setDate={setDate} onApply={loadJournals} />
                <JournalTable rows={journals} totals={totals} onDelete={deleteJournal} />
              </>
            )}

            {modal === 'trial' && (
              <>
                <h2>View Trial Sheet</h2>
                <Filters month={month} date={date} setMonth={setMonth} setDate={setDate} onApply={loadTrialSheet} />
                <TrialTable rows={trialRows} />
              </>
            )}

            {modal === 'ledgers' && (
              <>
                <h2>View Ledgers</h2>
                <table className="table ledger-table">
                  <thead><tr><th>Action</th><th>Ledger Name</th><th>Category</th></tr></thead>
                  <tbody>{ledgers.map((ledger) => <tr key={ledger.id}><td><button className="mini-btn" onClick={() => openStatement(ledger)}>View</button></td><td>{ledger.name}</td><td>{ledger.category || '--'}</td></tr>)}</tbody>
                </table>
              </>
            )}

            {modal === 'add-ledger' && (
              <form onSubmit={addLedger}>
                <h2>Add Ledger</h2>
                <div className="form-grid">
                  <label>Ledger Name<input required className="form-input" value={ledgerForm.name} onChange={(e) => setLedgerForm({ ...ledgerForm, name: e.target.value })} /></label>
                  <label>Category<input className="form-input" value={ledgerForm.category} onChange={(e) => setLedgerForm({ ...ledgerForm, category: e.target.value })} /></label>
                  <label>Opening Debit<input className="form-input" type="number" min="0" step="0.01" value={ledgerForm.opening_debit} onChange={(e) => setLedgerForm({ ...ledgerForm, opening_debit: e.target.value })} /></label>
                  <label>Opening Credit<input className="form-input" type="number" min="0" step="0.01" value={ledgerForm.opening_credit} onChange={(e) => setLedgerForm({ ...ledgerForm, opening_credit: e.target.value })} /></label>
                </div>
                <div className="modal-footer"><button className="btn" type="submit">Save</button></div>
              </form>
            )}

            {modal === 'import' && (
              <form onSubmit={importExcel}>
                <h2>Import Excel</h2>
                <p className="muted">CSV columns: date, description, reference_no, debit_ledger, credit_ledger, amount</p>
                <input className="form-input" type="file" accept=".csv,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                <div className="modal-footer"><button className="btn" type="submit">Import Excel</button></div>
              </form>
            )}

            {modal === 'add-entry' && (
              <form onSubmit={addEntry}>
                <h2>Add Entry</h2>
                <div className="entry-grid">
                  <label>Date<input required className="form-input" type="date" value={entryForm.entry_date} onChange={(e) => setEntryForm({ ...entryForm, entry_date: e.target.value })} /></label>
                  <label>Description<input required className="form-input" value={entryForm.description} onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })} /></label>
                  <label>P/N<input className="form-input" value={entryForm.reference_no} onChange={(e) => setEntryForm({ ...entryForm, reference_no: e.target.value })} /></label>
                  <label>First Ledger (Debit)<select required className="form-input" value={entryForm.debit_ledger_id} onChange={(e) => setEntryForm({ ...entryForm, debit_ledger_id: e.target.value })}><option value="">Select Ledger</option>{ledgers.map((ledger) => <option key={ledger.id} value={ledger.id}>{ledger.name}</option>)}</select></label>
                  <label>Second Ledger (Credit)<select required className="form-input" value={entryForm.credit_ledger_id} onChange={(e) => setEntryForm({ ...entryForm, credit_ledger_id: e.target.value })}><option value="">Select Ledger</option>{ledgers.map((ledger) => <option key={ledger.id} value={ledger.id}>{ledger.name}</option>)}</select></label>
                  <label>Amount<input required className="form-input" type="number" min="0.01" step="0.01" value={entryForm.amount} onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })} /></label>
                </div>
                <div className="modal-footer"><button className="btn" type="submit">Save</button></div>
              </form>
            )}

            {modal === 'statement' && statement && (
              <>
                <h2>Ledger - {statement.ledger.name}</h2>
                <div className="balance-strip">
                  <strong>Opening Balance: <span className={statement.ledger.opening_balance >= 0 ? 'amount-dr' : 'amount-cr'}>{money(statement.ledger.opening_balance)}</span></strong>
                  <strong>Closing Balance: <span className={statement.ledger.closing_balance >= 0 ? 'amount-dr' : 'amount-cr'}>{money(statement.ledger.closing_balance)}</span></strong>
                </div>
                <table className="table ledger-table">
                  <thead><tr><th>Date</th><th>Reference</th><th>P/N</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
                  <tbody>{statement.entries.map((entry) => <tr key={entry.id}><td>{entry.entry_date}</td><td>{entry.reference || '--'}</td><td>{entry.reference_no || '--'}</td><td>{entry.description}</td><td>{entry.debit ? money(entry.debit) : '--'}</td><td>{entry.credit ? money(entry.credit) : '--'}</td><td className={entry.balance >= 0 ? 'amount-dr' : 'amount-cr'}>{money(entry.balance)}</td></tr>)}</tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Filters({ month, date, setMonth, setDate, onApply }: { month: string; date: string; setMonth: (value: string) => void; setDate: (value: string) => void; onApply: () => void }) {
  return (
    <div className="filter-row">
      <label>Select Month:<select className="form-input" value={month} onChange={(e) => setMonth(e.target.value)}><option value="">-- All Months --</option>{months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label>
      <label>Select Date:<input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <button className="mini-btn" type="button" onClick={onApply}>Apply</button>
    </div>
  );
}

function JournalTable({ rows, totals, onDelete }: { rows: Journal[]; totals: { debit: number; credit: number }; onDelete: (id: number) => void }) {
  return (
    <table className="table ledger-table">
      <thead><tr><th>Action</th><th>Date</th><th>First</th><th>Second</th><th>P/N</th><th>Description</th><th>Debit</th><th>Credit</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}><td><button className="icon-btn" onClick={() => onDelete(row.id)} type="button">⌫</button></td><td>{row.entry_date}</td><td>{row.first_ledger}</td><td>{row.second_ledger}</td><td>{row.reference_no || '--'}</td><td>{row.description}</td><td>{money(row.debit)}</td><td>{money(row.credit)}</td></tr>)}</tbody>
      <tfoot><tr><th colSpan={6}>Sub Total</th><th>{money(totals.debit)}</th><th>{money(totals.credit)}</th></tr></tfoot>
    </table>
  );
}

function TrialTable({ rows }: { rows: TrialRow[] }) {
  const total = (key: keyof TrialRow) => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);

  return (
    <table className="table ledger-table">
      <thead><tr><th>Account Name</th><th>Opening DR</th><th>Opening CR</th><th>Movement DR</th><th>Movement CR</th><th>Closing DR</th><th>Closing CR</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.opening_debit ? money(row.opening_debit) : '--'}</td><td>{row.opening_credit ? money(row.opening_credit) : '--'}</td><td>{row.movement_debit ? money(row.movement_debit) : '--'}</td><td>{row.movement_credit ? money(row.movement_credit) : '--'}</td><td>{row.closing_debit ? money(row.closing_debit) : '--'}</td><td>{row.closing_credit ? money(row.closing_credit) : '--'}</td></tr>)}</tbody>
      <tfoot><tr><th>Sub Total</th><th>{money(total('opening_debit'))}</th><th>{money(total('opening_credit'))}</th><th>{money(total('movement_debit'))}</th><th>{money(total('movement_credit'))}</th><th>{money(total('closing_debit'))}</th><th>{money(total('closing_credit'))}</th></tr></tfoot>
    </table>
  );
}
