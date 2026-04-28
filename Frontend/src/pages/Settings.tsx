import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Building2, Save } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function Settings() {
  const { user, role } = useAuth();
  const [tab, setTab] = useState<'profile' | 'company' | 'users'>('profile');
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({ name: 'Construct OS', address: '', phone: '', email: '' });

  useEffect(() => {
    if (user) {
      setProfile({ full_name: user.user_metadata?.full_name || '', email: user.email || '' });
    }
    if (tab === 'users') fetchUsers();
  }, [user, tab]);

  async function fetchUsers() {
    const supabase = getSupabase();
    const { data } = await supabase.from('profiles').select('*').order('created_at');
    setUsers(data || []);
  }

  async function handleSaveProfile(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    const supabase = getSupabase();
    await supabase.from('profiles').upsert({ id: user!.id, full_name: profile.full_name, email: profile.email });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const supabase = getSupabase();
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchUsers();
  }

  const ROLES = ['admin', 'manager', 'accountant', 'site_engineer'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Profile, Company & User Management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {([
          { key: 'profile', label: 'My Profile', icon: <User className="w-3.5 h-3.5" /> },
          { key: 'company', label: 'Company', icon: <Building2 className="w-3.5 h-3.5" /> },
          ...(role === 'admin' ? [{ key: 'users', label: 'Users & Roles', icon: <Shield className="w-3.5 h-3.5" /> }] : []),
        ] as any[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${tab === t.key ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-lg">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
              {(profile.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900">{profile.full_name || 'No name set'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">{role || 'site_engineer'}</span>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Full Name</label>
              <input type="text" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Email</label>
              <input type="email" value={profile.email} className={inputCls} disabled />
              <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed here.</p>
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-60">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Company Tab */}
      {tab === 'company' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 max-w-lg">
          <h2 className="text-sm font-bold text-slate-900 mb-5">Company Information</h2>
          <div className="space-y-4">
            {[
              { label: 'Company Name', key: 'name' },
              { label: 'Address', key: 'address' },
              { label: 'Phone', key: 'phone' },
              { label: 'Company Email', key: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{f.label}</label>
                <input type="text" value={(company as any)[f.key]} onChange={e => setCompany(c => ({ ...c, [f.key]: e.target.value }))} className={inputCls} />
              </div>
            ))}
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm">
              <Save className="w-3.5 h-3.5" /> Save Company Info
            </button>
          </div>
        </motion.div>
      )}

      {/* Users Tab — admin only */}
      {tab === 'users' && role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {users.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-300 text-xs">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-500 font-mono">{u.email}</td>
                  <td className="px-6 py-3">
                    <select
                      value={u.role || 'site_engineer'}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user?.id}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
