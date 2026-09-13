import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name is too short'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  age: yup.number().typeError('Enter a valid age').required('Age is required').positive().integer(),
  gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  phone: yup.string().nullable(),
  address: yup.string().nullable(),
  notes: yup.string().nullable(),
});

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { gender: '' },
  });

  useEffect(() => {
    let mounted = true;
    patientService.getAll().then(data => {
      if (mounted) setPatients(data);
    }).catch(() => {
      toast.error('Could not load patients');
    });
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data) => {
    try {
      await patientService.create(data);
      toast.success('Patient added');
      const updated = await patientService.getAll();
      setPatients(updated);
      reset();
    } catch {
      toast.error('Failed to add patient');
    }
  };

  return (
    <div className="min-h-screen bg-void bg-scan-grid p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Patient Profiles</h1>
            <p className="text-slate-500 text-sm mt-1">Manage patient demographics and scan history</p>
          </div>
          <div className="text-sm text-slate-500">
            Signed in as <span className="text-slate-700 font-medium">{user?.full_name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-panel border border-slate-900/[0.06] rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Full name</label>
            <input {...register('name')} className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm ${errors.name ? 'border-red-400' : 'border-slate-900/[0.1]'}`} placeholder="Full name" />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Email</label>
            <input {...register('email')} className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm ${errors.email ? 'border-red-400' : 'border-slate-900/[0.1]'}`} placeholder="patient@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Age</label>
            <input {...register('age')} type="number" className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm ${errors.age ? 'border-red-400' : 'border-slate-900/[0.1]'}`} placeholder="Age" />
            {errors.age && <p className="text-red-500 text-xs mt-1.5">{errors.age.message}</p>}
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Gender</label>
            <select {...register('gender')} className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm ${errors.gender ? 'border-red-400' : 'border-slate-900/[0.1]'}`}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1.5">{errors.gender.message}</p>}
          </div>

          <div>
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Phone</label>
            <input {...register('phone')} className="w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm border-slate-900/[0.1]" placeholder="+92 300 0000000" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Address</label>
            <input {...register('address')} className="w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm border-slate-900/[0.1]" placeholder="Hospital / City / Country" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">Notes</label>
            <textarea {...register('notes')} rows="3" className="w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm border-slate-900/[0.1]" placeholder="Clinical notes or history" />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-4 rounded-lg">
              {isSubmitting ? 'Saving…' : 'Add patient'}
            </button>
          </div>
        </form>

        <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-4">
          <h2 className="text-lg font-display font-semibold text-slate-900 mb-3">All patients</h2>
          <div className="divide-y">
            {patients.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No patients yet</div>
            ) : (
              patients.map(p => (
                <div key={p.id || p.email} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-slate-900 font-medium">{p.name}</div>
                    <div className="text-slate-500 text-sm">{p.email} · {p.age} yrs · {p.gender}</div>
                  </div>
                  <div className="text-sm text-slate-500">{p.phone || '—'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
