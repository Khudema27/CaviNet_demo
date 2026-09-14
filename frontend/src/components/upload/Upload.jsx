import React, { useState } from 'react';
import api from '../../utils/axiosConfig';

export default function Upload({ onSuccess, patientId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const maxSize = 200 * 1024 * 1024;

  const onSelect = (event) => {
    const selected = Array.from(event.target.files || []);
    const filtered = selected.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} is too large`);
        return false;
      }
      if (!/\.(dcm|dicom|png|jpe?g|zip)$/i.test(file.name)) {
        alert(`${file.name} unsupported`);
        return false;
      }
      return true;
    });
    setFiles((previous) => [...previous, ...filtered]);
  };

  const onDrop = (event) => {
    event.preventDefault();
    onSelect({ target: { files: event.dataTransfer.files } });
  };

  const removeFile = (index) => {
    setFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const upload = async () => {
    if (!files.length) {
      alert('Select files first');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    if (patientId) {
      formData.append('patient_id', String(patientId));
    }

    setUploading(true);
    setProgress(0);

    try {
      const response = await api.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            setProgress(percentage);
          }
        },
      });

      const { job_id, scan_id } = response.data;
      setFiles([]);
      setProgress(0);

      if (onSuccess) {
        onSuccess({ jobId: job_id, scanId: scan_id });
      } else {
        alert(`Upload queued: ${job_id}`);
      }
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.detail || error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 mb-4 text-center"
      >
        <p className="text-sm text-slate-500">Drag & Drop CT files here or select files</p>
        <input
          type="file"
          multiple
          accept=".dcm,.dicom,.png,.jpg,.jpeg,.zip"
          onChange={onSelect}
          className="block mx-auto mt-4"
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2 mb-4">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between text-sm border border-slate-200 rounded-lg p-2"
            >
              <span className="text-slate-600">
                {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {uploading && (
        <div className="my-4">
          <div className="w-full bg-slate-100 h-2 rounded">
            <div
              style={{ width: `${progress}%` }}
              className="h-2 bg-cyan-500 rounded transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">Uploading {progress}%</div>
        </div>
      )}

      <button
        type="button"
        onClick={upload}
        disabled={uploading || files.length === 0}
        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-60"
      >
        {uploading ? `Uploading ${progress}%` : 'Upload CT Scan'}
      </button>
    </div>
  );
}
