import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, FileText, Search } from 'lucide-react';
import { invoiceService, projectService } from '../services/supabaseService';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const submitBtn = 'bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all';
const cancelBtn = 'bg-slate-100 text-slate-600 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all';

const statusStyle: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
};

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

const blank = { project_id: '', invoice_number: '', amount: '', due_date: '', status: 'draft' };

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [inv, proj] = await Promise.all([invoiceService.getAll(), projectService.getAll()]);
    setInvoices(inv.data || []);
    setProjects(proj.data || []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    if (editing) {
      await invoiceService.update(editing.id, payload);
    } else {
      await invoiceService.create(payload);
    }
    setForm(blank);
    setEditing(null);
    setShowForm(false);
    fetchAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this invoice?')) return;
    await invoiceService.delete(id);
    fetchAll();
  }

  function openEdit(inv: any) {
    setEditing(inv);
    setForm({ project_id: inv.project_id || '', invoice_number: inv.invoice_number, amount: inv.amount, due_date: inv.due_date || '', status: inv.status });
    setShowForm(true);
  }

  function handleDownload(inv: any) {
    const project = projects.find(p => p.id === inv.project_id);
    generateInvoicePDF({ ...inv, project });
  }

  const filtered = invoices.filter(inv =>
    !search ||
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.projects?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.projects?.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Client Billing & PDF Export</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ ...blank, invoice_number: `INV-${Date.now().toString().slice(-5)}` }); setShowForm(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm">
          <Plus className="w-3.5 h-3.5" /> New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoices.length, cls: 'text-slate-800' },
          { label: 'Paid', value: invoices.filter(i => i.status === 'paid').length, cls: 'text-emerald-600' },
          { label: 'Overdue', value: invoices.filter(i => i.status === 'overdue').length, cls: 'text-red-600' },
          { label: 'Revenue Collected', value: `$${totalPaid.toLocaleString()}`, cls: 'text-indigo-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{c.label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2 max-w-xs shadow-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="bg-transparent text-xs w-full outline-none placeholder:text-slate-300" />
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Invoice #</th>
              <th className="px-6 py-3">Project / Client</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-300 text-xs">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No invoices found</p>
              </td></tr>
            ) : filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 font-mono text-xs font-bold text-indigo-700">{inv.invoice_number}</td>
                <td className="px-6 py-3">
                  <p className="text-xs font-bold text-slate-800">{inv.projects?.name || '—'}</p>
                  <p className="text-[10px] text-slate-400">{inv.projects?.client_name}</p>
                </td>
                <td className="px-6 py-3 text-xs font-mono text-slate-500">{inv.due_date || '—'}</td>
                <td className="px-6 py-3">
                  <select
                    value={inv.status}
                    onChange={async e => { await invoiceService.update(inv.id, { status: e.target.value }); fetchAll(); }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-0 cursor-pointer focus:ring-0 ${statusStyle[inv.status]}`}
                  >
                    {['draft', 'sent', 'paid', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-6 py-3 text-right font-mono text-xs font-bold text-slate-800">${Number(inv.amount).toLocaleString()}</td>
                <td className="px-6 py-3 text-right flex items-center justify-end gap-1">
                  <button onClick={() => handleDownload(inv)} className="p-1.5 text-slate-300 hover:text-indigo-500 rounded transition-colors" title="Download PDF"><Download className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(inv)} className="p-1.5 text-slate-300 hover:text-indigo-500 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Invoice' : 'New Invoice'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Invoice Number">
              <input type="text" value={form.invoice_number} onChange={e => setForm((f: any) => ({ ...f, invoice_number: e.target.value }))} className={inputCls} required />
            </FormField>
            <FormField label="Project">
              <select value={form.project_id} onChange={e => setForm((f: any) => ({ ...f, project_id: e.target.value }))} className={inputCls}>
                <option value="">— None —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <FormField label="Amount ($)">
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm((f: any) => ({ ...f, amount: e.target.value }))} className={inputCls} required />
            </FormField>
            <FormField label="Due Date">
              <input type="date" value={form.due_date} onChange={e => setForm((f: any) => ({ ...f, due_date: e.target.value }))} className={inputCls} />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))} className={inputCls}>
                {['draft', 'sent', 'paid', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className={cancelBtn}>Cancel</button>
              <button type="submit" className={submitBtn}>{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
