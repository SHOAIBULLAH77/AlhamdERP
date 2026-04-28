import { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardService, projectService } from '../services/supabaseService';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [s, p] = await Promise.all([dashboardService.getStats(), projectService.getAll()]);
    // API returns { success: true, data: {...} }, wrapped by service as { data: res.data, error: null }
    // So s.data = { success: true, data: {...} } and p.data = { success: true, data: [...] }
    setStats(s.data?.data || s.data);
    setProjects((p.data?.data || p.data || []).slice(0, 5));
    setLoading(false);
  }

  const pieData = stats ? [
    { name: 'Pending', value: stats.totalProjects - stats.activeProjects },
    { name: 'Active', value: stats.activeProjects },
    { name: 'Completed', value: projects.filter((p: any) => p.status === 'completed').length },
  ].filter(d => d.value > 0) : [];

  const chartData = [
    { name: 'Income', value: stats?.totalIncome || 0, fill: '#10b981' },
    { name: 'Expenses', value: stats?.totalExpenses || 0, fill: '#f43f5e' },
    { name: 'Profit', value: Math.max(0, (stats?.profitLoss || 0)), fill: '#6366f1' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-slate-400">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3" />
      <span className="text-xs font-bold uppercase tracking-widest">Syncing systems...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Projects" value={stats?.totalProjects ?? 0} sub={`${stats?.activeProjects ?? 0} active`} icon={<Briefcase className="w-5 h-5" />} color="indigo" />
        <KpiCard title="Total Employees" value={stats?.totalEmployees ?? 0} sub="Across all sites" icon={<Users className="w-5 h-5" />} color="violet" />
        <KpiCard title="Net Profit / Loss" value={`${(stats?.profitLoss ?? 0) >= 0 ? '+' : ''}$${(stats?.profitLoss ?? 0).toLocaleString()}`} sub={`Income: $${(stats?.totalIncome ?? 0).toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} color={stats?.profitLoss >= 0 ? 'emerald' : 'red'} />
        <KpiCard title="Stock Alerts" value={stats?.lowStockAlerts?.length ?? 0} sub={stats?.lowStockAlerts?.length > 0 ? stats.lowStockAlerts.map((m: any) => m.name).join(', ') : 'All stock OK'} icon={<AlertTriangle className="w-5 h-5" />} color={stats?.lowStockAlerts?.length > 0 ? 'red' : 'slate'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900">Recent Projects</h2>
            <Link to="/projects" className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {projects.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-300 text-xs">No projects yet — <Link to="/projects" className="text-indigo-500 hover:underline">create one</Link></td></tr>
                ) : projects.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-700 text-xs">{p.name}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{p.client_name}</td>
                    <td className="px-6 py-3.5 font-mono text-[10px] text-slate-500">${Number(p.budget).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${statusColor(p.status)}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Column */}
        <div className="space-y-5">
          {/* Financial Bar Chart */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Financial Overview</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Status Pie */}
          {pieData.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Project Status</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Low Stock Alert Panel */}
          {stats?.lowStockAlerts?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Low Stock</p>
              </div>
              <ul className="space-y-1">
                {stats.lowStockAlerts.map((m: any) => (
                  <li key={m.id} className="flex justify-between text-[10px] text-red-600">
                    <span>{m.name}</span>
                    <span className="font-mono">{m.current_stock} / {m.min_stock_level} {m.unit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/materials" className="mt-2 block text-[10px] font-bold text-red-700 hover:underline">Manage Stock →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { to: '/projects', label: '+ New Project', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { to: '/employees', label: '+ Add Employee', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100' },
            { to: '/finance', label: '+ Log Expense', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
            { to: '/finance', label: '+ Record Income', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { to: '/invoices', label: '+ New Invoice', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
            { to: '/attendance', label: '✓ Mark Attendance', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
          ].map(link => (
            <Link key={link.label} to={link.to} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${link.color}`}>{link.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, icon, color }: any) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    violet: 'bg-violet-50 border-violet-100 text-violet-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-500',
  };
  const iconBg: Record<string, string> = {
    indigo: 'bg-indigo-100', violet: 'bg-violet-100', emerald: 'bg-emerald-100', red: 'bg-red-100', slate: 'bg-slate-100',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-lg border p-5 shadow-sm ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</p>
        <div className={`p-1.5 rounded-lg ${iconBg[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold font-mono text-slate-900">{value}</p>
      <p className="text-[10px] mt-1 opacity-60 truncate">{sub}</p>
    </motion.div>
  );
}

function statusColor(s: string) {
  const m: any = { pending: 'bg-amber-100 text-amber-700', active: 'bg-indigo-100 text-indigo-700', completed: 'bg-emerald-100 text-emerald-700' };
  return m[s] || 'bg-slate-100 text-slate-600';
}
