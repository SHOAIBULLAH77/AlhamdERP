import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, AlertTriangle, Package } from 'lucide-react';
import { materialService, projectService } from '../services/supabaseService';
import { motion } from 'framer-motion';

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

const blank = { name: '', unit: 'kg', current_stock: '', min_stock_level: '', unit_price: '' };

export default function Materials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showStock, setShowStock] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank);
  const [stockForm, setStockForm] = useState({ type: 'in', quantity: '', project_id: '', note: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [m, p] = await Promise.all([materialService.getAll(), projectService.getAll()]);
    setMaterials(m.data || []);
    setProjects(p.data || []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = { ...form, current_stock: Number(form.current_stock), min_stock_level: Number(form.min_stock_level), unit_price: Number(form.unit_price) };
    if (editing) {
      await materialService.update(editing.id, payload);
    } else {
      await materialService.create(payload);
    }
    setForm(blank);
    setEditing(null);
    setShowForm(false);
    fetchAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this material?')) return;
    await materialService.delete(id);
    fetchAll();
  }

  async function handleStockLog(ev: React.FormEvent) {
    ev.preventDefault();
    const qty = Number(stockForm.quantity);
    await materialService.addStock(showStock.id, stockForm.project_id || null, stockForm.type as 'in' | 'out', qty, stockForm.note);
    // Update local stock
    const newStock = stockForm.type === 'in' ? showStock.current_stock + qty : showStock.current_stock - qty;
    await materialService.update(showStock.id, { current_stock: Math.max(0, newStock) });
    setShowStock(null);
    setStockForm({ type: 'in', quantity: '', project_id: '', note: '' });
    fetchAll();
  }

  function openEdit(m: any) {
    setEditing(m);
    setForm({ name: m.name, unit: m.unit, current_stock: m.current_stock, min_stock_level: m.min_stock_level, unit_price: m.unit_price });
    setShowForm(true);
  }

  const filtered = materials.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = materials.filter(m => m.current_stock <= m.min_stock_level);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Material Management</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Stock Tracking & Assignment</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(blank); setShowForm(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Add Material
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">Low Stock Alert</p>
            <p className="text-xs text-red-600 mt-0.5">{lowStock.map(m => m.name).join(', ')} — below minimum threshold</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2 max-w-xs shadow-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..." className="bg-transparent text-xs w-full outline-none placeholder:text-slate-300" />
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Material</th>
              <th className="px-6 py-3">Unit</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Min Level</th>
              <th className="px-6 py-3">Unit Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-300 text-xs">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-300 text-xs">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No materials found
              </td></tr>
            ) : filtered.map(m => {
              const isLow = m.current_stock <= m.min_stock_level;
              return (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-bold text-slate-800">{m.name}</td>
                  <td className="px-6 py-3 text-xs text-slate-500 uppercase">{m.unit}</td>
                  <td className="px-6 py-3 font-mono text-xs font-bold text-slate-800">{Number(m.current_stock).toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">{Number(m.min_stock_level).toLocaleString()}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-600">${Number(m.unit_price).toLocaleString()}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isLow ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right flex items-center justify-end gap-1">
                    <button onClick={() => setShowStock(m)} className="px-2 py-1 text-[10px] font-bold bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded transition-colors uppercase tracking-wide">Log Stock</button>
                    <button onClick={() => openEdit(m)} className="p-1.5 text-slate-300 hover:text-indigo-500 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Material Modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Material' : 'Add Material'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Name"><input type="text" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className={inputCls} required /></FormField>
            <FormField label="Unit (kg, m3, bags...)"><input type="text" value={form.unit} onChange={e => setForm((f: any) => ({ ...f, unit: e.target.value }))} className={inputCls} required /></FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Current Stock"><input type="number" min="0" step="0.01" value={form.current_stock} onChange={e => setForm((f: any) => ({ ...f, current_stock: e.target.value }))} className={inputCls} required /></FormField>
              <FormField label="Min Level"><input type="number" min="0" step="0.01" value={form.min_stock_level} onChange={e => setForm((f: any) => ({ ...f, min_stock_level: e.target.value }))} className={inputCls} required /></FormField>
            </div>
            <FormField label="Unit Price ($)"><input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm((f: any) => ({ ...f, unit_price: e.target.value }))} className={inputCls} /></FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className={cancelBtn}>Cancel</button>
              <button type="submit" className={submitBtn}>{editing ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Log Modal */}
      {showStock && (
        <Modal title={`Log Stock — ${showStock.name}`} onClose={() => setShowStock(null)}>
          <form onSubmit={handleStockLog} className="space-y-4">
            <FormField label="Type">
              <div className="flex gap-2">
                {(['in', 'out'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setStockForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${stockForm.type === t ? (t === 'in' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white') : 'bg-slate-100 text-slate-500'}`}>
                    {t === 'in' ? '+ Stock In' : '- Stock Out'}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Quantity"><input type="number" min="0.01" step="0.01" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} className={inputCls} required /></FormField>
            <FormField label="Assign to Project (optional)">
              <select value={stockForm.project_id} onChange={e => setStockForm(f => ({ ...f, project_id: e.target.value }))} className={inputCls}>
                <option value="">— None —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <FormField label="Note"><input type="text" value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} className={inputCls} /></FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowStock(null)} className={cancelBtn}>Cancel</button>
              <button type="submit" className={submitBtn}>Log</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
