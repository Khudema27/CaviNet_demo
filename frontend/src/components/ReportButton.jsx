import React from 'react';

export default function ReportButton({ jobId }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const openReport = () => {
    const token = localStorage.getItem('accessToken');
    const url = `${apiUrl}/api/reports/${jobId}`;

    // Agar token hai to Authorization header append karo
    const finalUrl = token ? `${url}?token=${token}` : url;

    // Direct window.open use karo taake backend ka FileResponse PDF return kare
    window.open(finalUrl, '_blank');
  };

  return (
    <button
      type="button"
      onClick={openReport}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs"
    >
      View Report
    </button>
  );
}
