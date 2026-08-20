import React from 'react';

const ACCENTS = {
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
};

const StatCard = ({ label, value, accent = 'cyan', loading = false }) => {
  const c = ACCENTS[accent] ?? ACCENTS.cyan;

  return (
    <div className={`rounded-xl p-5 border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      </div>
      <p className={`text-3xl font-display font-bold mt-3 ${c.text}`}>
        {loading ? '—' : value}
      </p>
    </div>
  );
};

export default StatCard;