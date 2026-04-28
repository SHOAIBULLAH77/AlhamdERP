import { useState, useEffect } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { attendanceService, employeeService } from '../services/supabaseService';
import { motion } from 'framer-motion';

const STATUS_OPTIONS = ['present', 'absent', 'leave'] as const;
type AttStatus = typeof STATUS_OPTIONS[number];

const statusStyle: Record<AttStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  absent: 'bg-red-100 text-red-700 border-red-200',
  leave: 'bg-amber-100 text-amber-700 border-amber-200',
};

function toDateStr(d: Date) { return d.toISOString().split('T')[0]; }

export default function Attendance() {
  const today = toDateStr(new Date());
  const [date, setDate] = useState(today);
  const [employees, setEmployees] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, AttStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { if (employees.length > 0) fetchAttendance(); }, [date, employees]);

  async function fetchEmployees() {
    const { data } = await employeeService.getAll();
    setEmployees(data || []);
  }

  async function fetchAttendance() {
    setLoading(true);
    const { data } = await attendanceService.getByDate(date);
    const map: Record<string, AttStatus> = {};
    (data || []).forEach((r: any) => { map[r.employee_id] = r.status; });
    setRecords(map);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const rows = employees.map(e => ({
      employee_id: e.id,
      attendance_date: date,
      status: records[e.id] || 'absent',
    }));
    await attendanceService.upsert(rows);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function shiftDate(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(toDateStr(d));
  }

  const presentCount = employees.filter(e => records[e.id] === 'present').length;
  const absentCount = employees.filter(e => records[e.id] === 'absent' || !records[e.id]).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Daily Staff Attendance</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-60">
          <CalendarCheck className="w-3.5 h-3.5" /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Attendance'}
        </button>
      </div>

      {/* Date Nav */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm w-fit">
        <button onClick={() => shiftDate(-1)} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer" />
        <button onClick={() => shiftDate(1)} disabled={date >= today} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present', value: presentCount, cls: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
          { label: 'Absent / Not Set', value: absentCount, cls: 'bg-red-50 border-red-100 text-red-700' },
          { label: 'Total Employees', value: employees.length, cls: 'bg-slate-50 border-slate-200 text-slate-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border p-4 shadow-sm ${s.cls}`}>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{s.label}</p>
            <p className="text-2xl font-bold font-mono mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-300 text-xs">Loading...</td></tr>
            ) : employees.map(emp => (
              <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{emp.role}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setRecords(r => ({ ...r, [emp.id]: s }))}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${records[emp.id] === s ? statusStyle[s] : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
