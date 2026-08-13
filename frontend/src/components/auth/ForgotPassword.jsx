import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const forgotSchema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      // Always show the same confirmation, whether or not the email exists —
      // matches the backend's response so this page can't be used to probe
      // which addresses are registered.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel rounded-2xl shadow-xl shadow-slate-900/[0.08] border border-slate-900/[0.06] p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-lg bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-600/20">
            <span className="text-white font-display font-bold text-lg">C</span>
          </div>
          <div>
            <span className="text-slate-900 font-display font-semibold text-lg tracking-tight">CaviNet</span>
            <p className="text-slate-500 text-[11px] font-mono">ACCOUNT RECOVERY</p>
          </div>
        </div>

        {sent ? (
          <div className="animate-fade-up">
            <div className="h-12 w-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">Check your email</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              If that address is registered with CaviNet, a password reset link is on its way.
              It'll expire in 30 minutes.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block text-cyan-600 hover:text-cyan-700 font-medium text-sm transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-display font-bold text-slate-900">Reset your password</h2>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Enter the email on your account and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400/30'
                      : 'border-slate-900/[0.1] focus:ring-cyan-500/30 focus:border-cyan-500/50'
                  }`}
                  placeholder="you@hospital.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>

              <p className="text-center text-slate-500 text-sm">
                <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;