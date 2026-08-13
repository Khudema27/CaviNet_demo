import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const loginSchema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const FEATURES = [
  { icon: '◆', label: 'TB cavity detection & localization' },
  { icon: '▣', label: 'Grad-CAM visual explainability' },
  { icon: '◷', label: 'Automated diagnostic reports' },
  { icon: '◈', label: 'Adaptive learning from doctor feedback' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('doctor');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const isDoctor = userType === 'doctor';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Signed in successfully');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-panel rounded-2xl shadow-xl shadow-slate-900/[0.08] overflow-hidden border border-slate-900/[0.06]">

        {/* Left — branding / scan console panel */}
        <div className="relative w-full lg:w-5/12 bg-scan-grid bg-cyan-50/40 overflow-hidden p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-900/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white/70 pointer-events-none" />

          {/* Scan sweep signature */}
          <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent animate-scan-sweep" />
          </div>

          {/* Slice tick rail */}
          <div className="absolute left-6 top-10 bottom-10 w-px slice-rail" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-600/20">
                <span className="text-white font-display font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-slate-900 font-display font-semibold text-lg tracking-tight">CaviNet</span>
                <p className="text-slate-500 text-[11px] font-mono">TB CAVITY DETECTION SYSTEM</p>
              </div>
            </div>

            <div className="mt-14">
              <h1 className="mt-6 text-3xl lg:text-4xl font-display font-bold text-slate-900 leading-[1.15]">
                Detect TB cavities
                <br />
                with confidence.
              </h1>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed max-w-xs">
                CaviNet helps radiologists and doctors localize tuberculosis cavities in lung CT scans, backed by visual AI explanations they can verify and trust.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-2.5 max-w-sm">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/80 border border-slate-900/[0.06] rounded-lg px-3 py-2.5 shadow-sm shadow-slate-900/[0.02]">
                  <span className="text-cyan-600 text-sm leading-none">{f.icon}</span>
                  <span className="text-slate-600 text-[11px] font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="w-full lg:w-7/12 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-7">
              <h2 className="text-2xl font-display font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your CaviNet workspace</p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2.5 mb-6" role="radiogroup" aria-label="Account type">
              <button
                type="button"
                role="radio"
                aria-checked={isDoctor}
                onClick={() => setUserType('doctor')}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
                  isDoctor
                    ? 'bg-cyan-50 border-cyan-500/40 text-cyan-700'
                    : 'bg-slate-900/[0.02] border-slate-900/[0.08] text-slate-400 hover:text-slate-600 hover:border-slate-900/[0.15]'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!isDoctor}
                onClick={() => setUserType('admin')}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${
                  !isDoctor
                    ? 'bg-violet-50 border-violet-500/40 text-violet-700'
                    : 'bg-slate-900/[0.02] border-slate-900/[0.08] text-slate-400 hover:text-slate-600 hover:border-slate-900/[0.15]'
                }`}
              >
                Admin
              </button>
            </div>

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
                  className={`w-full px-4 py-3 bg-slate-900/[0.02] border rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400/30'
                      : isDoctor
                      ? 'border-slate-900/[0.1] focus:ring-cyan-500/30 focus:border-cyan-500/50'
                      : 'border-slate-900/[0.1] focus:ring-violet-500/30 focus:border-violet-500/50'
                  }`}
                  placeholder={isDoctor ? 'doctor@hospital.com' : 'admin@cavinet.com'}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-cyan-600 hover:text-cyan-700 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-11 bg-slate-900/[0.02] border rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-red-400 focus:ring-red-400/30'
                        : isDoctor
                        ? 'border-slate-900/[0.1] focus:ring-cyan-500/30 focus:border-cyan-500/50'
                        : 'border-slate-900/[0.1] focus:ring-violet-500/30 focus:border-violet-500/50'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 rounded"
                  >
                    {showPassword ? (
                      <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-panel ${
                  isDoctor
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white focus-visible:ring-cyan-500'
                    : 'bg-violet-600 hover:bg-violet-500 text-white focus-visible:ring-violet-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>

              <p className="text-center text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                  Register
                </Link>
              </p>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 bg-panel text-slate-400 font-mono uppercase tracking-wider">Demo credentials</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-700">Doctor</span>
                <p className="text-[11px] text-slate-600 mt-1 font-mono truncate">doctor@hospital.com</p>
                <p className="text-[11px] text-slate-400 font-mono">Doctor@123</p>
              </div>
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-700">Admin</span>
                <p className="text-[11px] text-slate-600 mt-1 font-mono truncate">admin@cavinet.com</p>
                <p className="text-[11px] text-slate-400 font-mono">Admin@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;