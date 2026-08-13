import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// Reflects the FYP module plan — rename/reorder freely as your scope firms up.
const ROADMAP = [
  { id: '01', label: 'Access Control', status: 'done' },
  { id: '02', label: 'Patient Records', status: 'planned' },
  { id: '03', label: 'Scan Upload & Preprocessing', status: 'planned' },
  { id: '04', label: 'Cavity Detection (CNN)', status: 'planned' },
  { id: '05', label: 'AI Pipeline & Explainability', status: 'planned' },
];

const STATS = [
  { label: 'Patients', value: 0, accent: 'cyan' },
  { label: 'Scans processed', value: 0, accent: 'amber' },
  { label: 'Cavities flagged', value: 0, accent: 'violet' },
];

const accentClasses = {
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
};

const NavItem = ({ to, children, disabled }) => {
  if (disabled) {
    return (
      <span className="text-slate-300 text-sm cursor-not-allowed inline-flex items-center gap-1.5">
        {children}
        <span className="text-[9px] font-mono uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded">
          Soon
        </span>
      </span>
    );
  }
  return (
    <Link to={to} className="text-slate-500 hover:text-slate-900 text-sm transition-colors">
      {children}
    </Link>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <nav className="border-b border-slate-900/[0.06] bg-panel/90 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-cyan-600 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-sm">C</span>
                </div>
                <span className="text-slate-900 font-display font-semibold tracking-tight">CaviNet</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-slate-900 text-sm font-medium">Dashboard</Link>
                <NavItem disabled>Patients</NavItem>
                <NavItem disabled>Scans</NavItem>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`hidden sm:inline-flex text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${
                  isAdmin ? 'border-violet-200 text-violet-700 bg-violet-50' : 'border-cyan-200 text-cyan-700 bg-cyan-50'
                }`}
              >
                {user?.role}
              </span>
              <span className="text-slate-600 text-sm hidden sm:inline">{user?.full_name}</span>
              <button
                onClick={logout}
                className="bg-slate-900/[0.03] hover:bg-red-50 border border-slate-900/[0.08] hover:border-red-200 text-slate-500 hover:text-red-600 px-3.5 py-1.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="flex items-center gap-2.5 mb-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-700 text-[11px] font-mono uppercase tracking-[0.15em]">System online</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
          Welcome, {user?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Signed in as <span className="text-slate-700 font-medium">{user?.role}</span>
          {user?.hospital && <> · {user.hospital}</>}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {STATS.map((stat) => {
            const c = accentClasses[stat.accent];
            return (
              <div key={stat.label} className={`rounded-xl p-5 border ${c.bg} ${c.border}`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">{stat.label}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                </div>
                <p className={`text-3xl font-display font-bold mt-3 ${c.text}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent scans — empty state */}
          <div className="lg:col-span-2 bg-panel border border-slate-900/[0.06] rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[280px] shadow-sm shadow-slate-900/[0.02]">
            <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-14.25H6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V8.25L15 3.75z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-display font-semibold">No scans yet</h3>
            <p className="text-slate-500 text-sm mt-1.5 max-w-xs">
              Upload a CT scan to run cavity detection once the scan pipeline module is live.
            </p>
            <button
              disabled
              className="mt-5 text-sm font-medium px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed"
              title="Available once Module 03 (Scan Upload) is live"
            >
              Upload CT scan
            </button>
          </div>

          {/* Module roadmap */}
          <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-6 shadow-sm shadow-slate-900/[0.02]">
            <h3 className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-4">Build roadmap</h3>
            <ol className="space-y-3">
              {ROADMAP.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <span
                    className={`h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-[10px] font-mono border ${
                      m.status === 'done'
                        ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {m.id}
                  </span>
                  <span className={`text-sm ${m.status === 'done' ? 'text-slate-800' : 'text-slate-400'}`}>
                    {m.label}
                  </span>
                  {m.status === 'done' && (
                    <svg className="w-3.5 h-3.5 text-cyan-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;