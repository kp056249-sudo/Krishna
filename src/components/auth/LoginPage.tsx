import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/apiClient';

interface LoginPageProps {
  onLoginSuccess: (user?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup') || hash.includes('type=recovery')) {
      setSuccessMsg('Email confirmed! You can now sign in.');
      window.location.hash = '';
    }
  }, []);

  const validateEmail = (input: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(input.trim());
  };

  // ─── Supabase Sign In ───
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: supaError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (supaError) {
        localStorage.removeItem('datanexus_id_token');
        localStorage.removeItem('datanexus_auth_user');
        let msg = supaError.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Invalid email or password. Please verify your credentials in Supabase.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Please confirm your email address. Check your inbox for the activation link.';
        } else if (msg.includes('Too many requests')) {
          msg = 'Too many attempts. Please wait a moment and try again.';
        }
        setError(msg);
        return;
      }


      if (data.session) {
        localStorage.setItem('datanexus_id_token', data.session.access_token);
        // Perform backend session-sync
        const syncRes = await api.post('/api/auth/session-sync', {
          name: data.user?.user_metadata?.full_name || email.split('@')[0],
        }).catch(() => null);

        if (syncRes && syncRes.user) {
          localStorage.setItem('datanexus_auth_user', JSON.stringify(syncRes.user));
          onLoginSuccess(syncRes.user);
        } else {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Supabase Sign Up ───
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: supaError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            company_name: companyName.trim() || 'KP Enterprise',
          },
        },
      });

      if (supaError) {
        let msg = supaError.message;
        if (msg.includes('already registered') || msg.includes('already exists')) {
          msg = 'This email is already registered. Please sign in instead.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'Password must be at least 6 characters.';
        } else if (msg.includes('valid email')) {
          msg = 'Please enter a valid email address.';
        }
        setError(msg);
        return;
      }

      if (data.user && !data.session) {
        setSuccessMsg(
          `Account created! Check your email (${email.trim()}) for activation link, then sign in.`
        );
        setIsRegister(false);
        setPassword('');
        return;
      }

      if (data.session) {
        localStorage.setItem('datanexus_id_token', data.session.access_token);
        const syncRes = await api.post('/api/auth/session-sync', {
          name: name.trim(),
          companyName: companyName.trim(),
        }).catch(() => null);

        if (syncRes && syncRes.user) {
          localStorage.setItem('datanexus_auth_user', JSON.stringify(syncRes.user));
          onLoginSuccess(syncRes.user);
        } else {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-xl shadow-cyan-500/25 ring-1 ring-cyan-400/30 mb-1">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl font-black text-white tracking-tight">DATANEXUS</h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 border border-blue-600/40 text-blue-300">
              KP NEXUS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise E-Commerce Operations &amp; Real-Time Analytics
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
          {/* Tab switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white tracking-tight">
              {isRegister ? '📋 Register Enterprise Account' : '🔐 Sign In to DataNexus'}
            </h2>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); setSuccessMsg(null); }}
                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${!isRegister ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); setSuccessMsg(null); }}
                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${isRegister ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Register
              </button>
            </div>
          </div>



          {/* Success Notification */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isRegister ? handleSignUp : handleSignIn} className="space-y-3.5 text-xs">
            {isRegister && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Krishna Pandey"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Company / Brand Name</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="KP Enterprises"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kp984543@gmail.com"
                  autoComplete="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono-code"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isRegister && (
                <p className="text-[10px] text-slate-500 mt-1">Minimum 6 characters required</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRegister ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? 'Create Enterprise Account' : 'Sign In to DataNexus'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Trust Badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Supabase Auth Active
            </span>
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {/* Bottom Toggle */}
        <p className="text-center text-xs text-slate-500">
          {isRegister ? (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </>
          ) : (
            <>New to DataNexus?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Create Account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
