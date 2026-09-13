import React, { useState } from 'react';
import api from '../../utils/axiosConfig';

export default function Upload({ onSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const maxSize = 200 * 1024 * 1024;

  const onSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const filtered = selected.filter(f => {
      if (f.size > maxSize) {
        alert(`${f.name} is too large`);
        return false;
      }
      if (!/\.(dcm|dicom|png|jpe?g|zip)$/i.test(f.name)) {
        alert(`${f.name} unsupported`);
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...filtered]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    onSelect({ target: { files: e.dataTransfer.files } });
  };

  const upload = async () => {
    if (!files.length) return alert('Select files first');
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    setUploading(true);
    try {
      const res = await api.post('/api/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (ev) => {
          if (ev.total) {
            const p = Math.round((ev.loaded * 100) / ev.total);
            setProgress(p);
          }
        }
      });
      const jobId = res.data.job_id;
      // call parent callback if provided (modal will close from parent)
      if (onSuccess) onSuccess(jobId);
      else alert('Upload queued: ' + jobId);

      setFiles([]);
      setProgress(0);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: '2px dashed #ccc', padding: 20, marginBottom: 10 }}
      >
        Drag & Drop files here or
        <input
          type="file"
          multiple
          accept=".dcm,.dicom,.png,.jpg,.jpeg,.zip"
          onChange={onSelect}
          style={{ display: 'block', marginTop: 10 }}
        />
      </div>

      <ul>
        {files.map((f, i) => (
          <li key={i}>
            {f.name} - {(f.size / 1024 / 1024).toFixed(2)} MB
            <button
              onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
              className="ml-2 text-xs text-red-500"
              type="button"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {uploading && (
        <div className="my-2">
          <div className="w-full bg-slate-100 h-2 rounded">
            <div style={{ width: `${progress}%` }} className="h-2 bg-cyan-500 rounded"></div>
          </div>
          <div className="text-xs text-slate-500 mt-1">{progress}%</div>
        </div>
      )}

      <button
        onClick={upload}
        disabled={uploading || files.length === 0}
        className="px-4 py-2 rounded bg-cyan-600 text-white disabled:opacity-60"
      >
        {uploading ? `Uploading ${progress}%` : 'Upload'}
      </button>
    </div>
  );
}
