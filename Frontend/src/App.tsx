import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Employees from './pages/Employees';
import Finance from './pages/Finance';
import Materials from './pages/Materials';
import Attendance from './pages/Attendance';
import Invoices from './pages/Invoices';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './hooks/useAuth';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading Construct OS...</p>
      </div>
    </div>
  );

  if (!session) return <Login />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 lg:pl-64 h-screen">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">ALHAMD CONSTRUCTIONS</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">Overview Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-100 border-none rounded-full px-4 py-1 text-xs w-48 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
              {session.user?.email?.charAt(0).toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthWrapper>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthWrapper>
      </Router>
    </AuthProvider>
  );
}
