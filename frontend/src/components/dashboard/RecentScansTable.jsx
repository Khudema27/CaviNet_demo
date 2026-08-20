import React from 'react';

const STATUS_LABELS = {
  pending: { label: 'Pending', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  preprocessing: { label: 'Preprocessing', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  analyzing: { label: 'Analyzing', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  complete: { label: 'Complete', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
};

const formatResult = (scan) => {
  if (scan.status !== 'complete') return '—';
  if (scan.cavity_detected === null || scan.cavity_detected === undefined) return '—';
  return scan.cavity_detected ? 'Cavity detected' : 'No cavity';
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RecentScansTable = ({ scans, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[220px] text-slate-400 text-sm">
        Loading recent scans…
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[220px] py-6">
        <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3-14.25H6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V8.25L15 3.75z"
            />
          </svg>
        </div>
        <h3 className="text-slate-900 font-display font-semibold">No scans yet</h3>
        <p className="text-slate-500 text-sm mt-1.5 max-w-xs">
          Scans will appear here once the CT Scan Upload module (M-04) is live.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-900/[0.06]">
            <th className="px-2 py-2 font-medium">Patient</th>
            <th className="px-2 py-2 font-medium">Uploaded</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => {
            const status = STATUS_LABELS[scan.status] ?? STATUS_LABELS.pending;
            return (
              <tr
                key={scan.id}
                className="border-b border-slate-900/[0.04] last:border-0 hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-2 py-3">
                  <div className="text-slate-800 font-medium">{scan.patient_name}</div>
                  <div className="text-slate-400 text-xs font-mono">#{scan.patient_code}</div>
                </td>
                <td className="px-2 py-3 text-slate-500">{formatTime(scan.uploaded_at)}</td>
                <td className="px-2 py-3">
                  <span
                    className={`inline-flex text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <span
                    className={
                      scan.cavity_detected === true
                        ? 'text-red-600 font-medium'
                        : scan.cavity_detected === false
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }
                  >
                    {formatResult(scan)}
                    {scan.cavity_detected && scan.confidence_score != null && (
                      <span className="text-slate-400 font-normal"> · {Math.round(scan.confidence_score * 100)}%</span>
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentScansTable;