import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { getCurrentUser, logDocumentAccess } from '../services/dbService';
import { DocumentType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  documentType: DocumentType;
  documentNumber: string;
  onSuccess: () => void;
}

export const PasswordPromptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  companyName,
  documentType,
  documentNumber,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const user = getCurrentUser();
    if (!user) {
      setErrorMsg('No active user session found. Please re-login.');
      return;
    }

    if (password === user.passwordHash) {
      // Log document access audit entry
      logDocumentAccess({
        userName: user.fullName,
        userEmail: user.email,
        companyName,
        documentNumber,
        documentType,
      });

      setPassword('');
      onSuccess();
    } else {
      setErrorMsg('Invalid Password! Access Denied.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Financial Security Check</h3>
              <p className="text-xs text-slate-300">Refco Financial Vault Authorization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-950">
                Authentication Required
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Security Check: Please enter your login password to view this financial document ({documentType}: {documentNumber}).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Your Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                placeholder="Enter password..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden text-sm"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Open</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
