import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Wallet, 
  Code2, 
  Eye, 
  EyeOff,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AuthUser } from '../types';
import { signIn, signUp, signInWithGoogle } from '../lib/auth';
import { BrandLogo } from './BrandLogo';

interface LoginPageProps {
  onAuthSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await signUp(email, password, name);
        if (result.success && result.user) {
          setSuccessMessage(result.message || 'Account created! Welcome to HabitPulse.');
          setTimeout(() => {
            onAuthSuccess(result.user!);
          }, 400);
        } else {
          setErrorMessage(result.message || 'Failed to create account. Please try again.');
        }
      } else {
        const result = await signIn(email, password);
        if (result.success && result.user) {
          setSuccessMessage('Welcome back! Loading your workspace...');
          setTimeout(() => {
            onAuthSuccess(result.user!);
          }, 400);
        } else {
          setErrorMessage(result.message || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Continue with Google Sign-In
  const handleGoogleClick = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const target = email.trim();
      const res = await signInWithGoogle(target.includes('@') ? target : undefined);
      if (res.success && res.user) {
        setSuccessMessage(`Authenticated with Google! Welcome.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 350);
      } else {
        setErrorMessage(res.message || 'Google authentication failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@habitpulse.io');
    setPassword('HabitPulse2026!');
    setName('Demo User');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Branding, Value Prop & Live Features */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Aesthetic Brand Logo */}
          <div className="flex justify-center lg:justify-start">
            <BrandLogo size="lg" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Master Your Routines, Wealth, &amp; Career
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Your private Life OS powered by integrated cloud persistence. Track daily habits, manage personal finances, get 5D AI life evaluations, and level up your software engineering progression.
            </p>
          </div>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">Daily Routines &amp; Streaks</p>
                <p className="text-[11px] text-slate-500">Consistency heatmaps, streak math, &amp; reminders</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">Money &amp; Cashflow Ledger</p>
                <p className="text-[11px] text-slate-500">Real-time income, expenses, &amp; savings targets</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">5D AI Life Evaluation</p>
                <p className="text-[11px] text-slate-500">Education, Health, Religion, Social, &amp; Career</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">SWE Engineering Mastery</p>
                <p className="text-[11px] text-slate-500">DSA, System Design, Cloud, &amp; Full-Stack</p>
              </div>
            </div>
          </div>

          {/* Cloud Security Indicator */}
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>Integrated Cloud Database • Persistent &amp; Secure Session</span>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Form Title & Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mode === 'signup' ? 'Sign up to start tracking your life operating system' : 'Sign in to access your habits, wealth, and progression'}
                  </p>
                </div>
              </div>

              {/* Tab Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  id="tab-btn-signin"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-btn-signup"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Universal Google OAuth Button */}
            <div>
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-60 cursor-pointer active:scale-98"
              >
                {isGoogleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isGoogleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                </span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-3 text-slate-400">Or continue with email</span>
                </div>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="auth-name-input"
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={mode === 'signup'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-email-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-slate-500 mt-1">Must be at least 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 px-4 rounded-2xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Persistent Login Notice & Quick Demo Fill */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>🔒 Automatically kept signed in</span>
              <button
                type="button"
                id="quick-demo-fill-btn"
                onClick={handleFillDemo}
                className="text-[#0F766E] hover:underline font-semibold cursor-pointer"
              >
                Try Demo Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
