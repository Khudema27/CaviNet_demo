import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const resetSchema = yup.object().shape({
  password: yup.string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Needs an uppercase letter')
    .matches(/[a-z]/, 'Needs a lowercase letter')
    .matches(/\d/, 'Needs a number'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset link is missing its token — request a new one.');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(token, data.password);
      if (result.success) {
        toast.success('Password reset — sign in with your new password');
        navigate('/login');
      } else {
        toast.error(result.error || 'Reset link is invalid or has expired');
      }
    } catch (error) {
      toast.error('Something went wrong. Try again.');
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

        <h2 className="text-xl font-display font-bold text-slate-900">Choose a new password</h2>

        {!token ? (
          <div className="mt-4">
            <p className="text-slate-500 text-sm leading-relaxed">
              This link is missing its reset token, so it can't be verified. Request a fresh link
              and open it directly from your email.
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-block text-cyan-600 hover:text-cyan-700 font-medium text-sm transition-colors"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6" noValidate>
            <div>
              <label htmlFor="password" className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider mb-2">
                New password
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-400 focus:ring-red-400/30'
                    : 'border-slate-900/[0.1] focus:ring-cyan-500/30 focus:border-cyan-500/50'
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-slate-500 text-[11px] font-mono uppercase tracking-wider mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:ring-red-400/30'
                    : 'border-slate-900/[0.1] focus:ring-cyan-500/30 focus:border-cyan-500/50'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>

            <p className="text-center text-slate-500 text-sm">
              <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;