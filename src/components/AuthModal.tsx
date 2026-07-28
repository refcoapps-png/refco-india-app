import React, { useState } from 'react';
import { User as UserIcon, Lock, Eye, EyeOff, ShieldCheck, UserPlus, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { getUsers, saveUsers, setCurrentUser } from '../services/dbService';
import { Role, User } from '../types';

interface Props {
  isOpen: boolean;
  onLoginSuccess: (user: User) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Signup state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [requestedRole, setRequestedRole] = useState<Role>('Sales Team');
  const [signupPassword, setSignupPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setErrorMsg('User email not registered. Please Request Access / Sign Up.');
      return;
    }

    if (user.passwordHash !== password) {
      setErrorMsg('Invalid password. Please check and try again.');
      return;
    }

    if (user.approvalStatus === 'Pending' || user.accountStatus === 'Inactive') {
      setErrorMsg('Your account is awaiting approval from the Admin.');
      return;
    }

    if (user.approvalStatus === 'Rejected') {
      setErrorMsg('Your registration request was rejected by the Admin.');
      return;
    }

    setCurrentUser(user);
    onLoginSuccess(user);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = signupEmail.trim().toLowerCase();
    const users = getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      setErrorMsg('An account with this corporate email already exists.');
      return;
    }

    const newUser: User = {
      id: 'usr_' + Date.now(),
      fullName: fullName.trim(),
      email: cleanEmail,
      mobile: mobile.trim(),
      role: requestedRole,
      passwordHash: signupPassword,
      approvalStatus: 'Pending',
      accountStatus: 'Inactive',
      createdOn: new Date().toISOString()
    };

    saveUsers([...users, newUser]);

    setSuccessMsg('Your request has been submitted successfully. Please wait for Admin approval to login.');
    setTimeout(() => {
      setMode('login');
      setEmail(cleanEmail);
      setSuccessMsg('Your request has been submitted successfully. Please wait for Admin approval to login.');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Splash Banner & Logo Header */}
        <div className="bg-gradient-to-br from-cyan-900 via-slate-900 to-amber-900 text-white p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          
          {/* Company Logo Icon Badge */}
          <div className="w-20 h-20 mx-auto mb-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-xl flex items-center justify-center text-amber-400">
            <Building2 className="w-12 h-12 text-amber-400" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Refco India Corporation
          </h1>
          <p className="text-xs text-amber-300 font-medium tracking-wide uppercase mt-1">
            Refractory & Acid Proof Solutions
          </p>
        </div>

        {/* Content Container */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 text-center mb-1">
                Portal Login
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Username / Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. info@refcoindia.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 focus:outline-hidden text-sm"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 focus:outline-hidden text-sm"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-cyan-900 hover:bg-cyan-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm tracking-wide uppercase flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>LOGIN</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="hover:text-cyan-800 underline"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-cyan-900 font-bold hover:underline flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Request Access / Sign Up</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  Default Master Admin: <span className="font-semibold text-slate-600"></span> | <span className="font-semibold text-slate-600"></span>
                </p>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <h2 className="text-lg font-bold text-slate-800 text-center mb-1">
                Request Access / Sign Up
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Corporate Email ID *
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  placeholder="e.g. ramesh@refcoindia.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Role Requested *
                </label>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 text-sm"
                >
                  <option value="Sales Team">Sales Team</option>
                  <option value="Accounts Team">Accounts Team</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Set Password *
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-700 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-wide mt-2"
              >
                Submit Access Request
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-600 hover:text-cyan-900 font-semibold underline"
                >
                  Already registered? Back to Login
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-bold text-slate-800">Reset Password</h2>
              <p className="text-xs text-slate-600">
                Please contact Master Admin (<span className="font-semibold text-slate-900">info@refcoindia.com</span>) or system administrator to reset your corporate access credentials.
              </p>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
