import React, { useState } from 'react';
import { 
   X, 
   Mail, 
   Lock, 
   User, 
   LogIn, 
   UserPlus, 
   CheckCircle2, 
   AlertCircle, 
   ShieldCheck, 
   Eye, 
   EyeOff,
   Sparkles,
   Database
 } from 'lucide-react';
 import { AuthUser, SupabaseConfig } from '../types';
 import { signIn, signUp, signInWithGoogle } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onAuthSuccess: (user: AuthUser) => void;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseConfig: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  supabaseConfig,
  onOpenSupabaseConfig,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn(email.trim(), password);
        if (result.success && result.user) {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onAuthSuccess(result.user!);
            onClose();
          }, 600);
        } else {
          setError(result.message || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const result = await signUp(email.trim(), password, name.trim());
        if (result.success && result.user) {
          setSuccessMsg(result.message || 'Account created successfully!');
          setTimeout(() => {
            onAuthSuccess(result.user!);
            onClose();
          }, 800);
        } else {
          setError(result.message || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setEmail('abrashhaider909@gmail.com');
    setPassword('HabitPulse2026!');
    setName('Abrash Haider');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Sign In to HabitPulse' : 'Create Your Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {supabaseConfig.isConnected ? 'Protected by Supabase Auth & RLS' : 'Secure user data isolation & offline sync'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Backend Connection Status Callout */}
        <div className="px-6 pt-3">
          <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
            supabaseConfig.isConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>
                {supabaseConfig.isConnected 
                  ? 'Connected to Supabase Project' 
                  : 'Local Auth Mode (Data persists in browser)'}
              </span>
            </div>
            {!supabaseConfig.isConnected && (
              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="text-[11px] font-semibold text-indigo-400 hover:underline"
              >
                Configure
              </button>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name-input"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              {mode === 'signup' && (
                <span className="text-[11px] text-slate-500">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Button */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={fillQuickDemo}
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use user email demo credentials</span>
            </button>
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In Securely</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>


        {mode === 'signin' && (
          <div className="px-6 pb-4">
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-3 text-slate-500">OR</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setSuccessMsg(null);
                setLoading(true);

                const result = await signInWithGoogle();

                if (!result.success) {
                  setError(result.message || 'Google sign-in failed.');
                  setLoading(false);
                }
              }}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <span className="font-bold text-base">G</span>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 text-center text-xs text-slate-400">
          {currentUser && !currentUser.isGuest ? (
            <span>Signed in as <strong className="text-slate-200">{currentUser.email}</strong></span>
          ) : (
            <span>All habit records, finances, and AI reviews are secured by your account credentials.</span>
          )}
        </div>
      </div>
    </div>
  );
};

