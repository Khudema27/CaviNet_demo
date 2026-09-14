import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useSearchParams,
} from 'react-router-dom';

import {
  useForm,
} from 'react-hook-form';

import {
  yupResolver,
} from '@hookform/resolvers/yup';

import * as yup from 'yup';

import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';


const schema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name is too short'),

  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),

  age: yup
    .number()
    .typeError('Enter a valid age')
    .required('Age is required')
    .positive('Age must be positive')
    .integer('Age must be a whole number'),

  gender: yup
    .string()
    .oneOf(
      ['male', 'female', 'other'],
      'Select a valid gender'
    )
    .required('Gender is required'),

  phone: yup.string().nullable(),

  address: yup.string().nullable(),

  notes: yup.string().nullable(),
});


const emptyValues = {
  name: '',
  email: '',
  age: '',
  gender: '',
  phone: '',
  address: '',
  notes: '',
};


export default function Patients() {
  const { user } = useAuth();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    patients,
    setPatients,
  ] = useState([]);

  const [
    editingPatient,
    setEditingPatient,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: emptyValues,
  });


  const loadPatients = async () => {
    try {
      setLoading(true);

      const data =
        await patientService.getAll();

      setPatients(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(error);

      toast.error(
        'Could not load patients'
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadPatients();
  }, []);


  // -------------------------------------------------
  // Open edit form from ?edit=ID
  // -------------------------------------------------

  useEffect(() => {
    const editId =
      searchParams.get('edit');

    if (!editId || !patients.length) {
      return;
    }

    const patient =
      patients.find(
        (item) =>
          String(item.id) ===
          String(editId)
      );

    if (patient) {
      startEdit(patient);
    }
  }, [
    patients,
    searchParams,
  ]);


  const startEdit = (patient) => {
    setEditingPatient(patient);

    reset({
      name: patient.name || '',
      email: patient.email || '',
      age: patient.age ?? '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      address: patient.address || '',
      notes: patient.notes || '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  const cancelEdit = () => {
    setEditingPatient(null);

    reset(emptyValues);

    setSearchParams({});
  };


  const onSubmit = async (data) => {
    try {
      if (editingPatient) {
        await patientService.update(
          editingPatient.id,
          data
        );

        toast.success(
          'Patient profile updated'
        );

        setEditingPatient(null);

        reset(emptyValues);

        setSearchParams({});

        await loadPatients();

      } else {
        await patientService.create(
          data
        );

        toast.success(
          'Patient added'
        );

        reset(emptyValues);

        await loadPatients();
      }

    } catch (error) {
      console.error(error);

      toast.error(
        editingPatient
          ? 'Failed to update patient'
          : 'Failed to add patient'
      );
    }
  };


  return (
    <div className="min-h-screen bg-void bg-scan-grid p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">
              Patient Profiles
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Register and manage patient demographic information
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Signed in as{' '}

            <span className="text-slate-700 font-medium">
              {user?.full_name}
            </span>
          </div>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-panel border border-slate-900/[0.06] rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <div className="md:col-span-2 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">
                {editingPatient
                  ? 'Edit Patient'
                  : 'Register New Patient'}
              </h2>

              {editingPatient && (
                <p className="text-xs text-slate-500 mt-1">
                  Patient ID:{' '}
                  {editingPatient.patient_code ||
                    editingPatient.id}
                </p>
              )}
            </div>

            {editingPatient && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
            )}

          </div>


          <FormInput
            label="Full name"
            error={errors.name}
            {...register('name')}
            placeholder="Full name"
          />

          <FormInput
            label="Email"
            error={errors.email}
            {...register('email')}
            placeholder="patient@example.com"
            type="email"
          />

          <FormInput
            label="Age"
            error={errors.age}
            {...register('age')}
            placeholder="Age"
            type="number"
          />


          <div>
            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">
              Gender
            </label>

            <select
              {...register('gender')}
              className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm ${
                errors.gender
                  ? 'border-red-400'
                  : 'border-slate-900/[0.1]'
              }`}
            >
              <option value="">
                Select gender
              </option>

              <option value="male">
                Male
              </option>

              <option value="female">
                Female
              </option>

              <option value="other">
                Other
              </option>
            </select>

            {errors.gender && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.gender.message}
              </p>
            )}
          </div>


          <FormInput
            label="Phone"
            {...register('phone')}
            placeholder="+92 300 0000000"
          />

          <FormInput
            label="Address"
            {...register('address')}
            placeholder="Hospital / City / Country"
          />


          <div className="md:col-span-2">

            <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">
              Notes
            </label>

            <textarea
              {...register('notes')}
              rows="3"
              className="w-full px-4 py-3 bg-slate-900/[0.02] border border-slate-900/[0.1] rounded-lg text-sm"
              placeholder="Clinical notes or history"
            />

          </div>


          <div className="md:col-span-2 flex justify-end gap-3">

            {editingPatient && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white py-2 px-4 rounded-lg"
            >
              {isSubmitting
                ? 'Saving...'
                : editingPatient
                  ? 'Update patient'
                  : 'Add patient'}
            </button>

          </div>

        </form>


        {/* PATIENT LIST */}

        <div className="bg-panel border border-slate-900/[0.06] rounded-xl p-4">

          <div className="flex items-center justify-between mb-3">

            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">
                All patients
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Select a patient to view complete scan history
              </p>
            </div>

            <span className="text-xs font-mono text-slate-400">
              {patients.length} patients
            </span>

          </div>


          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading patients...
            </div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No patients yet
            </div>
          ) : (
            <div className="divide-y">

              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >

                  <div>

                    <div className="text-slate-900 font-medium">
                      {patient.name}
                    </div>

                    <div className="text-slate-500 text-sm mt-1">
                      {patient.email}
                      {' · '}
                      {patient.age} yrs
                      {' · '}
                      {patient.gender}
                    </div>

                    <div className="text-slate-400 text-xs mt-1 font-mono">
                      {patient.patient_code ||
                        `PT-${patient.id}`}
                    </div>

                  </div>


                  <div className="flex items-center gap-2">

                    <Link
                      to={`/patients/${patient.id}`}
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                    >
                      View Profile
                    </Link>

                    <Link
                      to={`/patients?edit=${patient.id}`}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                    >
                      Edit
                    </Link>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}


const FormInput = React.forwardRef(
  function FormInput(
    {
      label,
      error,
      ...props
    },
    ref
  ) {
    return (
      <div>

        <label className="block text-slate-500 text-[11px] font-mono uppercase mb-2">
          {label}
        </label>

        <input
          ref={ref}
          {...props}
          className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-sm ${
            error
              ? 'border-red-400'
              : 'border-slate-900/[0.1]'
          }`}
        />

        {error && (
          <p className="text-red-500 text-xs mt-1.5">
            {error.message}
          </p>
        )}

      </div>
    );
  }
);