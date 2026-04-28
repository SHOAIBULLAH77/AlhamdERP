import {
  LayoutDashboard,
  Briefcase,
  Users,
  Wallet,
  Box,
  CalendarCheck,
  FileText,
  FolderOpen,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import React from 'react';

const navGroups = [
  {
    label: 'General',
    items: [
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { path: '/projects', label: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
      { path: '/employees', label: 'Employees', icon: <Users className="w-4 h-4" /> },
      { path: '/finance', label: 'Finance', icon: <Wallet className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: '/materials', label: 'Materials', icon: <Box className="w-4 h-4" /> },
      { path: '/attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
      { path: '/invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
      { path: '/documents', label: 'Documents', icon: <FolderOpen className="w-4 h-4" /> },
      { path: '/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  const initials = (user?.email ?? 'U').charAt(0).toUpperCase();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-40
        w-64 bg-slate-900 flex flex-col text-slate-300 border-r border-slate-800
        transition-transform duration-300 transform-gpu
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-sm">
            C
          </div>
          <div>
            <span className="font-bold text-white tracking-tight text-sm">ALHAMD Construct</span>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">ERP Platform</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[9px] uppercase font-bold text-slate-600 px-3 py-1.5 mb-1 tracking-wider">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Treasury Widget */}
        <div className="mx-3 mb-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 shrink-0">
          <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Role</p>
          <p className="text-sm font-bold text-white capitalize">{role || 'site_engineer'}</p>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 w-full p-2 hover:bg-slate-800 rounded-lg transition-colors group">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
