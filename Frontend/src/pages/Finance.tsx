import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';
import { expenseService, incomeService, projectService } from '../services/supabaseService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const EXPENSE_CATEGORIES = ['material', 'labor', 'transport', 'other'];
const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const submitBtn = 'bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all';
const cancelBtn = 'bg-slate-100 text-slate-600 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all';

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </div>
  );
}

function FormField({ label, children }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function categoryColor(cat: string) {
  const m: any = { material: 'bg-blue-100 text-blue-700', labor: 'bg-purple-100 text-purple-700', transport: 'bg-amber-100 text-amber-700', other: 'bg-slate-100 text-slate-600' };
  return m[cat] || 'bg-slate-100 text-slate-600';
}

export default function Finance() {
  const [tab, setTab] = useState<'expenses' | 'income'>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [income, setIncome] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expenseForm, setExpenseForm] = useState({ project_id: '', category: 'material', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
  const [incomeForm, setIncomeForm] = useState({ project_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'bank_transfer', note: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [e, i, p] = await Promise.all([expenseService.getAll(), incomeService.getAll(), projectService.getAll()]);
    setExpenses(e.data || []);
    setIncome(i.data || []);
    setProjects(p.data || []);
    setLoading(false);
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const profitLoss = totalIncome - totalExpenses;

  const monthlyMap: Record<string, any> = {};
  income.forEach(i => { const m = i.payment_date?.slice(0, 7) || '?'; if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expenses: 0 }; monthlyMap[m].income += Number(i.amount); });
  expenses.forEach(e => { const m = e.expense_date?.slice(0, 7) || '?'; if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expenses: 0 }; monthlyMap[m].expenses += Number(e.amount); });
  const chartData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  async function handleAddExpense(ev: React.FormEvent) {
    ev.preventDefault();
    await expenseService.create({ ...expenseForm, amount: Number(expenseForm.amount) });
    setExpenseForm({ project_id: '', category: 'material', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
    setShowExpenseForm(false);
    fetchAll();
  }

  async function handleAddIncome(ev: React.FormEvent) {
    ev.preventDefault();
    await incomeService.create({ ...incomeForm, amount: Number(incomeForm.amount) });
    setIncomeForm({ project_id: '', amount: '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'bank_transfer', note: '' });
    setShowIncomeForm(false);
    fetchAll();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Finance</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Income, Expenses & Profit/Loss</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowIncomeForm(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" /> Add Income
          </button>
          <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: `$${totalIncome.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Net Profit / Loss', value: `${profitLoss >= 0 ? '+' : ''}$${profitLoss.toLocaleString()}`, color: profitLoss >= 0 ? 'text-indigo-600' : 'text-red-600', bg: 'bg-slate-50 border-slate-200' },
        ].map(c => (
          <div key={c.label} className={`rounded-lg border p-5 shadow-sm ${c.bg}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{c.label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Monthly Financial Flow</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={4}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {(['expenses', 'income'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2 max-w-xs shadow-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-xs w-full outline-none placeholder:text-slate-300" />
        </div>
      </div>

      {/* Expenses Table */}
      {tab === 'expenses' && (
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Date</th><th className="px-6 py-3">Project</th><th className="px-6 py-3">Category</th><th className="px-6 py-3">Description</th><th className="px-6 py-3 text-right">Amount</th><th className="px-6 py-3 text-right">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-300 text-xs">Loading...</td></tr>
                : expenses.filter(e => !search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.category?.includes(search.toLowerCase()) || e.projects?.name?.toLowerCase().includes(search.toLowerCase())).map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-mono text-slate-500">{e.expense_date}</td>
                    <td className="px-6 py-3 text-xs text-slate-700">{e.projects?.name || '—'}</td>
                    <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${categoryColor(e.category)}`}>{e.category}</span></td>
                    <td className="px-6 py-3 text-xs text-slate-500">{e.description || '—'}</td>
                    <td className="px-6 py-3 text-right font-mono text-xs font-bold text-red-600">${Number(e.amount).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><button onClick={async () => { if (confirm('Delete?')) { await expenseService.delete(e.id); fetchAll(); } }} className="p-1.5 text-slate-300 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Income Table */}
      {tab === 'income' && (
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Date</th><th className="px-6 py-3">Project</th><th className="px-6 py-3">Method</th><th className="px-6 py-3">Note</th><th className="px-6 py-3 text-right">Amount</th><th className="px-6 py-3 text-right">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-300 text-xs">Loading...</td></tr>
                : income.filter(i => !search || i.note?.toLowerCase().includes(search.toLowerCase()) || i.projects?.name?.toLowerCase().includes(search.toLowerCase())).map(i => (
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-mono text-slate-500">{i.payment_date}</td>
                    <td className="px-6 py-3 text-xs text-slate-700">{i.projects?.name || '—'}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">{i.payment_method}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">{i.note || '—'}</td>
                    <td className="px-6 py-3 text-right font-mono text-xs font-bold text-emerald-600">${Number(i.amount).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right"><button onClick={async () => { if (confirm('Delete?')) { await incomeService.delete(i.id); fetchAll(); } }} className="p-1.5 text-slate-300 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseForm && (
        <Modal title="Add Expense" onClose={() => setShowExpenseForm(false)}>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <FormField label="Project"><select value={expenseForm.project_id} onChange={e => setExpenseForm(f => ({ ...f, project_id: e.target.value }))} className={inputCls}><option value="">— None —</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
            <FormField label="Category"><select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} className={inputCls} required>{EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></FormField>
            <FormField label="Amount ($)"><input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} required /></FormField>
            <FormField label="Date"><input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm(f => ({ ...f, expense_date: e.target.value }))} className={inputCls} required /></FormField>
            <FormField label="Description"><input type="text" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} className={inputCls} /></FormField>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowExpenseForm(false)} className={cancelBtn}>Cancel</button><button type="submit" className={submitBtn}>Save</button></div>
          </form>
        </Modal>
      )}

      {/* Income Modal */}
      {showIncomeForm && (
        <Modal title="Add Income" onClose={() => setShowIncomeForm(false)}>
          <form onSubmit={handleAddIncome} className="space-y-4">
            <FormField label="Project"><select value={incomeForm.project_id} onChange={e => setIncomeForm(f => ({ ...f, project_id: e.target.value }))} className={inputCls}><option value="">— None —</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
            <FormField label="Amount ($)"><input type="number" min="0" step="0.01" value={incomeForm.amount} onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} required /></FormField>
            <FormField label="Payment Date"><input type="date" value={incomeForm.payment_date} onChange={e => setIncomeForm(f => ({ ...f, payment_date: e.target.value }))} className={inputCls} required /></FormField>
            <FormField label="Method"><select value={incomeForm.payment_method} onChange={e => setIncomeForm(f => ({ ...f, payment_method: e.target.value }))} className={inputCls}><option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option><option value="cheque">Cheque</option><option value="other">Other</option></select></FormField>
            <FormField label="Note"><input type="text" value={incomeForm.note} onChange={e => setIncomeForm(f => ({ ...f, note: e.target.value }))} className={inputCls} /></FormField>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowIncomeForm(false)} className={cancelBtn}>Cancel</button><button type="submit" className={submitBtn}>Save</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
