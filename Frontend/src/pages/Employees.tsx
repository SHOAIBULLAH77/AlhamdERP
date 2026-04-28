import { useState, useEffect } from 'react';
import { Users, UserPlus, MoreHorizontal, Edit2, Trash2, Search } from 'lucide-react';
import { employeeService } from '../services/supabaseService';
import { motion } from 'framer-motion';

const ROLES = ['site_engineer', 'manager', 'accountant', 'admin', 'foreman', 'labor', 'driver', 'other'];
const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const submitBtn = 'bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all';
const cancelBtn = 'bg-slate-100 text-slate-600 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all';

const blank = { name: '', role: 'site_engineer', salary: '', joining_date: new Date().toISOString().split('T')[0], contact_info: { email: '', phone: '' } };

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
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

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank);

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    setLoading(true);
    const { data } = await employeeService.getAll();
    setEmployees(data || []);
    setLoading(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = { ...form, salary: Number(form.salary) };
    if (editing) {
      await employeeService.update(editing.id, payload);
    } else {
      await employeeService.create(payload);
    }
    setForm(blank);
    setEditing(null);
    setShowForm(false);
    fetchEmployees();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee?')) return;
    await employeeService.delete(id);
    fetchEmployees();
  }

  function openEdit(emp: any) {
    setEditing(emp);
    setForm({
      name: emp.name,
      role: emp.role,
      salary: emp.salary,
      joining_date: emp.joining_date || new Date().toISOString().split('T')[0],
      contact_info: emp.contact_info || { email: '', phone: '' },
    });
    setShowForm(true);
  }

  const filtered = employees.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workforce Directory</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Personnel & Payroll</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(blank); setShowForm(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm">
          <UserPlus className="w-3.5 h-4" /> Enroll New Staff
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2 max-w-xs shadow-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..." className="bg-transparent text-xs w-full outline-none placeholder:text-slate-300" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">Accessing directory...</div>
      ) : (
        <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Joined</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-300">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No personnel records</p>
                    </td>
                  </tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200 shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.contact_info?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">{emp.role}</span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{emp.contact_info?.phone || '—'}</td>
                    <td className="px-6 py-3 font-mono text-xs font-bold text-slate-700">${Number(emp.salary).toLocaleString()}</td>
                    <td className="px-6 py-3 text-center text-xs text-slate-500 font-mono">{emp.joining_date || '—'}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(emp)} className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Employee' : 'Enroll New Staff'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Full Name">
                <input type="text" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className={inputCls} required />
              </FormField>
              <FormField label="Role">
                <select value={form.role} onChange={e => setForm((f: any) => ({ ...f, role: e.target.value }))} className={inputCls}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Salary ($)">
                <input type="number" min="0" value={form.salary} onChange={e => setForm((f: any) => ({ ...f, salary: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="Joining Date">
                <input type="date" value={form.joining_date} onChange={e => setForm((f: any) => ({ ...f, joining_date: e.target.value }))} className={inputCls} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Email">
                <input type="email" value={form.contact_info?.email || ''} onChange={e => setForm((f: any) => ({ ...f, contact_info: { ...f.contact_info, email: e.target.value } }))} className={inputCls} />
              </FormField>
              <FormField label="Phone">
                <input type="text" value={form.contact_info?.phone || ''} onChange={e => setForm((f: any) => ({ ...f, contact_info: { ...f.contact_info, phone: e.target.value } }))} className={inputCls} />
              </FormField>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className={cancelBtn}>Cancel</button>
              <button type="submit" className={submitBtn}>{editing ? 'Update' : 'Enroll'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
