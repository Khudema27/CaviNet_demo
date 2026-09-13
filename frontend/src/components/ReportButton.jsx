export default function ReportButton({ jobId }) {
  return (
    <button
       onClick={() => window.open(`http://127.0.0.1:8000/api/reports/${jobId}`, "_blank")}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Download Report
    </button>
  );
}
