import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const registerSchema = yup.object().shape({
  full_name: yup.string().required('Full name is required').min(2, 'Name is too short'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Needs an uppercase letter')
    .matches(/[a-z]/, 'Needs a lowercase letter')
    .matches(/\d/, 'Needs a number'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
  role: yup.string().oneOf(['doctor', 'admin']).default('doctor'),
  specialization: yup.string().when('role', {
    is: 'doctor',
    then: () => yup.string().required('Specialization is required'),
    otherwise: () => yup.string().nullable(),
  }),
  hospital: yup.string().when('role', {
    is: 'doctor',
    then: () => yup.string().required('Hospital is required'),
    otherwise: () => yup.string().nullable(),
  }),
  license_number: yup.string().when('role', {
    is: 'doctor',
    then: () => yup.string().required('License number is required'),
    otherwise: () => yup.string().nullable(),
  }),
});

const FieldLabel = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider mb-2">
    {children}
  </label>
);

const inputClass = (hasError) =>
  `w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
    hasError
      ? 'border-red-400 focus:ring-red-400/30'
      : 'border-slate-900/[0.1] focus:ring-cyan-500/30 focus:border-cyan-500/50'
  }`;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { role: 'doctor' },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);

      if (result.success) {
        toast.success('Account created — sign in to continue');
        navigate('/login');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-3xl bg-panel rounded-2xl shadow-xl shadow-slate-900/[0.08] border border-slate-900/[0.06] overflow-hidden">

        {/* Header strip */}
        <div className="relative bg-scan-grid bg-cyan-50/40 px-8 lg:px-12 py-8 border-b border-slate-900/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/70 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-600/20">
              <span className="text-white font-display font-bold text-lg">C</span>
            </div>
            <div>
              <span className="text-slate-900 font-display font-semibold text-lg tracking-tight">CaviNet</span>
              <p className="text-slate-500 text-[11px] font-mono">CREATE A CREDENTIALED ACCOUNT</p>
            </div>
          </div>
          <h2 className="relative z-10 mt-5 text-2xl font-display font-bold text-slate-900">Request access</h2>
          <p className="relative z-10 text-slate-600 text-sm mt-1">
            Doctor accounts review CT scans and AI cavity detection results; admin accounts manage the system.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 lg:p-12 pt-8 space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="full_name">Full name</FieldLabel>
              <input id="full_name" {...register('full_name')} type="text" autoComplete="name"
                className={inputClass(errors.full_name)} placeholder="Dr. Amina Khalid" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1.5">{errors.full_name.message}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <input id="username" {...register('username')} type="text" autoComplete="username"
                className={inputClass(errors.username)} placeholder="aminakhalid" />
              {errors.username && <p className="text-red-500 text-xs mt-1.5">{errors.username.message}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <input id="email" {...register('email')} type="email" autoComplete="email"
                className={inputClass(errors.email)} placeholder="amina@hospital.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="role">Account type</FieldLabel>
              <select id="role" {...register('role')} className={inputClass(errors.role) + ' appearance-none cursor-pointer'}>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1.5">{errors.role.message}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <input id="password" {...register('password')} type="password" autoComplete="new-password"
                className={inputClass(errors.password)} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <input id="confirmPassword" {...register('confirmPassword')} type="password" autoComplete="new-password"
                className={inputClass(errors.confirmPassword)} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {role === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 animate-fade-up">
              <div>
                <FieldLabel htmlFor="specialization">Specialization</FieldLabel>
                <input id="specialization" {...register('specialization')} type="text"
                  className={inputClass(errors.specialization)} placeholder="Radiology" />
                {errors.specialization && <p className="text-red-500 text-xs mt-1.5">{errors.specialization.message}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="hospital">Hospital</FieldLabel>
                <input id="hospital" {...register('hospital')} type="text"
                  className={inputClass(errors.hospital)} placeholder="City Hospital" />
                {errors.hospital && <p className="text-red-500 text-xs mt-1.5">{errors.hospital.message}</p>}
              </div>

              <div>
                <FieldLabel htmlFor="license_number">License number</FieldLabel>
                <input id="license_number" {...register('license_number')} type="text"
                  className={inputClass(errors.license_number)} placeholder="LIC-2026-001" />
                {errors.license_number && <p className="text-red-500 text-xs mt-1.5">{errors.license_number.message}</p>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>

          <p className="text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;