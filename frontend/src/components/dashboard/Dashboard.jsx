import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import StatCard from './StatCard';
import RecentScansTable from './RecentScansTable';
import Upload from '../upload/Upload';

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

  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [scansLoading, setScansLoading] = useState(true);

  // **Add this line** to manage the upload modal state
  const [open, setOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setStatsLoading(true);
    setScansLoading(true);
    try {
      const [statsData, scansData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentScans(10),
      ]);
      setStats(statsData);
      setScans(scansData);
    } catch (error) {
      toast.error('Could not load dashboard data');
    } finally {
      setStatsLoading(false);
      setScansLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    { label: 'Total scans', value: stats?.total_scans ?? 0, accent: 'cyan' },
    { label: 'Pending', value: stats?.pending ?? 0, accent: 'amber' },
    { label: 'Cavity detected', value: stats?.cavity_detected ?? 0, accent: 'red' },
    { label: 'Completed today', value: stats?.completed_today ?? 0, accent: 'violet' },
  ];

  return (
    <div className="min-h-screen bg-void bg-scan-grid">
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
                <Link to="/dashboard" className="text-slate-900 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/patients" className="text-slate-500 hover:text-slate-900 text-sm transition-colors">
                  Patients
                </Link>

                <NavItem disabled>Scans</NavItem>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`hidden sm:inline-flex text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${isAdmin ? 'border-violet-200 text-violet-700 bg-violet-50' : 'border-cyan-200 text-cyan-700 bg-cyan-50'
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
        {/* Status pill */}
        <div className="flex items-center gap-2.5 mb-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-700 text-[11px] font-mono uppercase tracking-[0.15em]">System online</span>
        </div>

        {/* Greeting + upload action */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
              Welcome, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Signed in as <span className="text-slate-700 font-medium">{user?.role}</span>
              {user?.hospital && <> · {user.hospital}</>}
            </p>
          </div>

          <div>
            <button
              onClick={() => setOpen(true)}
              title="Upload CT Scan"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Upload scan
            </button>

            {open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg w-[90%] max-w-3xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Upload CT Scan</h3>
                    <button onClick={() => setOpen(false)} className="text-slate-500">Close</button>
                  </div>

                  <Upload
                    onSuccess={(jobId) => {
                      setOpen(false);
                      alert('Upload queued: ' + jobId);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {statCards.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={statsLoading} />
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent scan reports */}
          <div className="lg:col-span-2 bg-panel border border-slate-900/[0.06] rounded-xl p-6 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 font-display font-semibold">Recent scan reports</h3>
              <NavItem disabled>View all</NavItem>
            </div>
            <RecentScansTable scans={scans} loading={scansLoading} />
          </div>

          {/* Quick access */}
          <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-6 shadow-sm shadow-slate-900/[0.02]">
            <h3 className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-4">Quick access</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <Link to="/patients" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Patient profiles
                </Link>
                <span className="text-[9px] font-mono uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded">
                  M-03
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Diagnostic reports</span>
                <span className="text-[9px] font-mono uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded">
                  M-08 soon
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
