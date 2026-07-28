import React from 'react';
import { Building2, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User | null;
  onSignOut: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<Props> = ({ user, onSignOut, onOpenAdminPanel }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo & Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
              REFCO INDIA
            </h1>
            <p className="text-[10px] font-semibold text-amber-400 tracking-wider uppercase mt-0.5">
              Corporation Portal
            </p>
          </div>
        </div>

        {/* Active User Info & Controls */}
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-100">{user.fullName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  user.role === 'Admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  user.role === 'Sales Team' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{user.email}</span>
            </div>

            {user.role === 'Admin' && onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
                title="Admin Control Panel"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin Panel</span>
              </button>
            )}

            <button
              onClick={onSignOut}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Guest Access</span>
          </div>
        )}
      </div>
    </header>
  );
};
