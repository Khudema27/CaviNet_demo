import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import toast from 'react-hot-toast';

import patientService from '../../services/patientService';

import ReportButton from '../ReportButton';

import Upload from '../upload/Upload';


const statusClasses = {
  pending:
    'bg-amber-50 text-amber-700 border-amber-200',

  preprocessing:
    'bg-blue-50 text-blue-700 border-blue-200',

  analyzing:
    'bg-violet-50 text-violet-700 border-violet-200',

  complete:
    'bg-emerald-50 text-emerald-700 border-emerald-200',

  failed:
    'bg-red-50 text-red-700 border-red-200',
};


const formatDate = (date) => {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString(
    undefined,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );
};


const normalizeStatus = (status) => {
  if (!status) return 'pending';

  return String(status)
    .toLowerCase()
    .replaceAll(' ', '_');
};


const getResult = (scan) => {
  if (scan.cavity_detected === true) {
    return 'Cavity Present';
  }

  if (scan.cavity_detected === false) {
    return 'Cavity Absent';
  }

  return 'Awaiting AI analysis';
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


export default function PatientProfile() {
  const { patientId } =
    useParams();

  const navigate =
    useNavigate();


  const [
    patient,
    setPatient,
  ] = useState(null);

  const [
    scans,
    setScans,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    scansLoading,
    setScansLoading,
  ] = useState(true);

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);


  const loadPatient =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await patientService.getById(
            patientId
          );

        setPatient(data);

      } catch (error) {
        console.error(error);

        toast.error(
          'Could not load patient profile'
        );

        setPatient(null);

      } finally {
        setLoading(false);
      }
    }, [patientId]);


  const loadScans =
    useCallback(async () => {
      try {
        setScansLoading(true);

        const data =
          await patientService.getScans(
            patientId
          );

        setScans(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {
        console.error(error);

        toast.error(
          'Could not load scan history'
        );

        setScans([]);

      } finally {
        setScansLoading(false);
      }
    }, [patientId]);


  useEffect(() => {
    loadPatient();
    loadScans();
  }, [
    loadPatient,
    loadScans,
  ]);


  const handleUploadSuccess =
    async ({ jobId }) => {
      setUploadOpen(false);

      toast.success(
        `Scan uploaded successfully`
      );

      await loadScans();

      // The scan record is created immediately,
      // but the dummy/real processing may finish later.
      if (jobId) {
        console.log(
          'Uploaded job:',
          jobId
        );
      }
    };


  if (loading) {
    return (
      <PageMessage>
        Loading patient profile...
      </PageMessage>
    );
  }


  if (!patient) {
    return (
      <PageMessage>
        <h1 className="text-xl font-semibold text-slate-900">
          Patient not found
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          The requested patient profile could not be loaded.
        </p>

        <button
          onClick={() =>
            navigate('/patients')
          }
          className="mt-5 bg-slate-900 text-white px-4 py-2 rounded-lg"
        >
          Back to Patients
        </button>
      </PageMessage>
    );
  }


  return (
    <div className="min-h-screen bg-void bg-scan-grid p-6">

      <div className="max-w-6xl mx-auto">

        {/* TOP NAV */}

        <div className="flex items-center justify-between mb-6">

          <Link
            to="/patients"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back to Patients
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Dashboard
          </Link>

        </div>


        {/* PATIENT HEADER */}

        <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 mb-2">
                Patient Profile · M-03
              </div>

              <h1 className="text-2xl font-display font-bold text-slate-900">
                {patient.name}
              </h1>

              <p className="text-sm text-slate-500 mt-1 font-mono">
                {patient.patient_code ||
                  `PT-${patient.id}`}
              </p>

            </div>


            <div className="flex gap-2">

              <Link
                to={`/patients?edit=${patient.id}`}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
              >
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={() =>
                  setUploadOpen(true)
                }
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm"
              >
                + Upload New Scan
              </button>

            </div>

          </div>

        </div>


        {/* DEMOGRAPHICS */}

        <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-6 mb-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">
                Patient Information
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Editable demographic information
              </p>
            </div>

            <span className="text-[10px] font-mono text-slate-400">
              M-03
            </span>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <InfoField
              label="Full Name"
              value={patient.name}
            />

            <InfoField
              label="Patient ID"
              value={
                patient.patient_code ||
                `PT-${patient.id}`
              }
            />

            <InfoField
              label="Age"
              value={
                patient.age
                  ? `${patient.age} years`
                  : '—'
              }
            />

            <InfoField
              label="Gender"
              value={
                patient.gender || '—'
              }
            />

            <InfoField
              label="Email"
              value={
                patient.email || '—'
              }
            />

            <InfoField
              label="Phone"
              value={
                patient.phone || '—'
              }
            />

            <InfoField
              label="Address"
              value={
                patient.address || '—'
              }
            />

            <div className="sm:col-span-2 lg:col-span-3">

              <InfoField
                label="Notes"
                value={
                  patient.notes || '—'
                }
              />

            </div>

          </div>

        </div>


        {/* SCAN HISTORY */}

        <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <h2 className="text-lg font-display font-semibold text-slate-900">
                Scan & Case History
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Every CT scan remains attached to this patient
              </p>

            </div>

            <span className="text-xs font-mono text-slate-400">
              {scans.length}{' '}
              {scans.length === 1
                ? 'scan'
                : 'scans'}
            </span>

          </div>


          {scansLoading ? (
            <div className="py-10 text-center text-slate-500">
              Loading scan history...
            </div>
          ) : scans.length === 0 ? (

            <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg">

              <p className="text-slate-400 text-sm">
                No scans available for this patient.
              </p>

              <button
                type="button"
                onClick={() =>
                  setUploadOpen(true)
                }
                className="mt-4 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Upload the first CT scan →
              </button>

            </div>

          ) : (

            <div className="space-y-4">

              {scans.map(
                (scan, index) => {

                  const status =
                    normalizeStatus(
                      scan.status
                    );

                  return (
                    <div
                      key={scan.id}
                      className="border border-slate-900/[0.07] rounded-xl p-5 bg-white"
                    >

                      <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-2 mb-2">

                            <span className="text-slate-900 font-semibold">
                              Scan #{scans.length - index}
                            </span>

                            <span
                              className={`px-2 py-1 rounded border text-[10px] font-mono uppercase ${
                                statusClasses[
                                  status
                                ] ||
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {status.replaceAll(
                                '_',
                                ' '
                              )}
                            </span>

                          </div>


                          <div className="text-xs text-slate-500">
                            Uploaded:{' '}
                            {formatDate(
                              scan.uploaded_at
                            )}
                          </div>


                          <div className="text-xs text-slate-400 mt-1 font-mono">
                            Case ID:{' '}
                            {scan.job_id ||
                              scan.id}
                          </div>


                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">

                            <InfoField
                              label="AI Result"
                              value={
                                status ===
                                'complete'
                                  ? getResult(
                                      scan
                                    )
                                  : 'Not available yet'
                              }
                            />

                            <InfoField
                              label="Confidence"
                              value={
                                status ===
                                'complete'
                                  ? getConfidence(
                                      scan
                                    )
                                  : '—'
                              }
                            />

                            <InfoField
                              label="Affected Region"
                              value={
                                scan.affected_lung_region ||
                                '—'
                              }
                            />

                          </div>


                          {scan.decision_summary && (
                            <div className="mt-4">

                              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                                Decision Summary
                              </div>

                              <p className="text-sm text-slate-600">
                                {
                                  scan.decision_summary
                                }
                              </p>

                            </div>
                          )}

                        </div>


                        {/* ACTIONS */}

                        <div className="flex flex-wrap lg:flex-col gap-2 lg:min-w-[160px]">

                          {status ===
                            'complete' &&
                            scan.heatmap_url && (
                              <a
                                href={
                                  scan.heatmap_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs text-center hover:bg-slate-50"
                              >
                                View Heatmap
                              </a>
                            )}


                          {scan.job_id && (
                            <ReportButton
                              jobId={
                                scan.job_id
                              }
                            />
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>


      {/* UPLOAD MODAL */}

      {uploadOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white rounded-xl w-full max-w-3xl p-5 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h3 className="text-lg font-semibold text-slate-900">
                  Upload CT Scan
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Patient:{' '}
                  {patient.name}
                  {' · '}
                  {patient.patient_code ||
                    patient.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setUploadOpen(false)
                }
                className="text-slate-500 hover:text-slate-900"
              >
                Close
              </button>

            </div>


            <Upload
              patientId={
                patient.id
              }
              onSuccess={
                handleUploadSuccess
              }
            />

          </div>

        </div>
      )}

    </div>
  );
}


function InfoField({
  label,
  value,
}) {
  return (
    <div>

      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </div>

      <div className="text-sm text-slate-800 break-words">
        {value}
      </div>

    </div>
  );
}


function PageMessage({
  children,
}) {
  return (
    <div className="min-h-screen bg-void bg-scan-grid p-6">

      <div className="max-w-6xl mx-auto">

        <div className="bg-panel rounded-xl p-10 text-center">
          {children}
        </div>

      </div>

    </div>
  );
}