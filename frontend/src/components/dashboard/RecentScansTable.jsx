import React from 'react';
import { Link } from 'react-router-dom';


const getStatusLabel = (status) => {
  if (!status) return 'Pending';

  return String(status)
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    );
};


const getResult = (scan) => {
  if (scan.cavity_detected === true) {
    return 'Cavity Present';
  }

  if (scan.cavity_detected === false) {
    return 'Cavity Absent';
  }

  return '—';
};


const getConfidence = (scan) => {
  if (
    scan.confidence_score === null ||
    scan.confidence_score === undefined
  ) {
    return '—';
  }

  const value =
    Number(scan.confidence_score);

  if (Number.isNaN(value)) {
    return '—';
  }

  return value <= 1
    ? `${Math.round(value * 100)}%`
    : `${Math.round(value)}%`;
};


const formatDate = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString(
    undefined,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
};


export default function RecentScansTable({
  scans = [],
  loading = false,
}) {

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        Loading recent cases...
      </div>
    );
  }


  if (!scans.length) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        No recent cases available.
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">

      <table className="w-full text-left">

        <thead>

          <tr className="border-b border-slate-900/[0.06]">

            <th className="px-3 py-3 text-[10px] font-mono uppercase text-slate-400">
              Patient
            </th>

            <th className="px-3 py-3 text-[10px] font-mono uppercase text-slate-400">
              Latest Scan
            </th>

            <th className="px-3 py-3 text-[10px] font-mono uppercase text-slate-400">
              Status
            </th>

            <th className="px-3 py-3 text-[10px] font-mono uppercase text-slate-400">
              Result
            </th>

            <th className="px-3 py-3 text-[10px] font-mono uppercase text-slate-400">
              Confidence
            </th>

            <th className="px-3 py-3 text-[10px] font-mono uppercase text-slate-400 text-right">
              Actions
            </th>

          </tr>

        </thead>


        <tbody>

          {scans.map((scan) => {

            const patientId =
              scan.patient_id;

            return (
              <tr
                key={scan.id}
                className="border-b border-slate-900/[0.04] last:border-0"
              >

                <td className="px-3 py-4">

                  <div className="text-sm font-medium text-slate-900">
                    {scan.patient_name}
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {scan.patient_code}
                  </div>

                </td>


                <td className="px-3 py-4 text-sm text-slate-500">
                  {formatDate(
                    scan.uploaded_at
                  )}
                </td>


                <td className="px-3 py-4">

                  <span className="text-xs text-slate-600">
                    {getStatusLabel(
                      scan.status
                    )}
                  </span>

                </td>


                <td className="px-3 py-4 text-sm text-slate-700">
                  {getResult(scan)}
                </td>


                <td className="px-3 py-4 text-sm font-medium text-slate-700">
                  {getConfidence(scan)}
                </td>


                <td className="px-3 py-4">

                  <div className="flex items-center justify-end gap-2">

                    <Link
                      to={`/patients/${patientId}`}
                      className="px-2.5 py-1.5 rounded-md bg-slate-900 text-white text-[11px] hover:bg-slate-800"
                    >
                      View Profile
                    </Link>

                    <Link
                      to={`/patients/${patientId}`}
                      className="px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 text-[11px] hover:bg-slate-50"
                    >
                      Patient
                    </Link>

                  </div>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}