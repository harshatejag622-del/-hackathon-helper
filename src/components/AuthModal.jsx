import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Crown, 
  ShieldCheck,
  Users
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    authError, 
    setAuthError, 
    quickSwitchMember,
    toggleTeamLead
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLead, setIsLead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  if (!isOpen) return null;

  // Strict email regex: user@domain.tld with valid structure
  const isValidEmail = (val) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(val.trim());
  };

  // Password rules: minimum 6 characters with at least 1 letter and 1 number
  const checkPasswordStrength = (val) => {
    if (!val) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    if (val.length < 6) return { score: 1, label: 'Too Short (Min 6 chars)', color: 'bg-rose-500' };
    const hasLetters = /[a-zA-Z]/.test(val);
    const hasNumbers = /[0-9]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);

    if (hasLetters && hasNumbers && hasSpecial && val.length >= 8) {
      return { score: 3, label: 'Strong Password', color: 'bg-emerald-500' };
    }
    if (hasLetters && hasNumbers) {
      return { score: 2, label: 'Good Password', color: 'bg-indigo-500' };
    }
    return { score: 1, label: 'Weak (Need letters & numbers)', color: 'bg-amber-500' };
  };

  const strength = checkPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setValidationError('');
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Strict Email Validation
    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email address (e.g., student@university.edu or name@gmail.com)');
      return;
    }

    // Strict Password Validation
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setValidationError('Password must contain both letters and at least one number');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
        if (isLead) toggleTeamLead(true);
      } else {
        await loginWithEmail(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts for instant multi-tab testing
  const demoAccounts = [
    {
      uid: 'lead_alex_chen',
      displayName: 'Alex Chen',
      email: 'alex.lead@hackathon.io',
      preferredRole: 'FullStack',
      isLead: true,
      college: 'Stanford University',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      badge: '👑 Team Lead (Tab 1)'
    },
    {
      uid: 'candidate_priya_sharma',
      displayName: 'Priya Sharma',
      email: 'priya.ml@berkeley.edu',
      preferredRole: 'ML Engineer',
      isLead: false,
      college: 'UC Berkeley',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      badge: '💻 Teammate 1 (Tab 2)'
    },
    {
      uid: 'candidate_marcus_vance',
      displayName: 'Marcus Vance',
      email: 'marcus.sys@mit.edu',
      preferredRole: 'Backend Architect',
      isLead: false,
      college: 'MIT',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      badge: '💻 Teammate 2 (Tab 3)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-indigo-500/30 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isSignUp ? 'Create Innovator Account' : 'Sign In to Hackathon Squad'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp
              ? 'Join as Team Lead or Developer to collaborate in real time'
              : 'Sign in to access your squad, 48-hour timeline, and war room'}
          </p>
        </div>

        {/* Validation or Auth Error */}
        {(validationError || authError) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError || authError}</span>
          </div>
        )}

        {/* Collapsible Fast Demo Accounts (Optional) */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowDemoLogins(!showDemoLogins)}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{showDemoLogins ? '▲ Hide Quick Demo Shortcuts' : '▼ 1-Click Test Shortcuts (Optional)'}</span>
          </button>

          {showDemoLogins && (
            <div className="mt-2 p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-3 gap-1.5 animate-fade-in">
              {demoAccounts.map(acc => (
                <button
                  key={acc.uid}
                  type="button"
                  onClick={() => {
                    quickSwitchMember(acc);
                    onSuccess?.();
                    onClose();
                  }}
                  className="text-left p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-600/30 border border-white/5 hover:border-indigo-500/50 transition-all text-xs flex flex-col justify-between"
                >
                  <div className="font-bold text-white truncate">{acc.displayName}</div>
                  <div className="text-[10px] text-indigo-400 font-semibold">{acc.badge}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        {/* Separator */}
        <div className="flex items-center my-3 gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Or with Valid Email</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harsha Teja"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>
            </div>
          )}

          {/* Email with real-time validation indicator */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              {email && (
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${isValidEmail(email) ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isValidEmail(email) ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Valid Email
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Invalid Format
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 rounded-xl border ${
                  email ? (isValidEmail(email) ? 'border-emerald-500/50' : 'border-rose-500/50') : 'border-white/10'
                } focus:outline-none text-sm text-white`}
              />
            </div>
          </div>

          {/* Password with Strength Meter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              {password && (
                <span className="text-[10px] text-slate-400 font-medium">
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters (Letters & Numbers)"
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white"
              />
            </div>
            {/* Strength Meter Bar */}
            {password && (
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden flex gap-0.5">
                <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}></div>
                <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}></div>
                <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}></div>
              </div>
            )}
          </div>

          {/* Team Lead Checkbox for Sign Up */}
          {isSignUp && (
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-900/20 border border-indigo-500/20 cursor-pointer hover:bg-indigo-900/30 transition-colors">
              <input
                type="checkbox"
                checked={isLead}
                onChange={(e) => setIsLead(e.target.checked)}
                className="checkbox checkbox-primary checkbox-sm"
              />
              <div className="flex items-center gap-1.5 text-xs text-white">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Designate me as Team Lead</span>
              </div>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Validated Account' : 'Sign In to Squad'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setValidationError('');
              setAuthError(null);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up with validation"}
          </button>
        </div>
      </div>
    </div>
  );
}
