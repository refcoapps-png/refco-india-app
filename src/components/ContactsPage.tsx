import React, { useState } from 'react';
import { Search, Users, UserCheck, ShieldCheck } from 'lucide-react';
import { AdvancedSearchPanel } from './AdvancedSearchPanel';
import { UnlinkedContactsTab } from './UnlinkedContactsTab';
import { AllContactsAdminTab } from './AllContactsAdminTab';
import { Company, User } from '../types';

interface Props {
  currentUser: User | null;
  onSelectCompany: (company: Company) => void;
  onRegisterNewCompany: () => void;
  onOpenAdminAuth: () => void;
  onSelectCompanyById?: (companyId: string) => void;
}

export const ContactsPage: React.FC<Props> = ({
  currentUser,
  onSelectCompany,
  onRegisterNewCompany,
  onOpenAdminAuth,
  onSelectCompanyById,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'unlinked' | 'admin_all'>('search');

  return (
    <div className="space-y-6">
      
      {/* Top Sub-Tab Selector inside Contacts Module */}
      <div className="bg-slate-900 text-white p-2 rounded-2xl shadow-lg flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex space-x-1.5 min-w-max">
          <button
            onClick={() => setActiveSubTab('search')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'search'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>A. Search & Directory (All Users)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('unlinked')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'unlinked'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>B. Unlinked Contacts (All Users)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('admin_all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'admin_all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>C. All Contacts (Admin User Only)</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab View Rendering */}
      {activeSubTab === 'search' && (
        <AdvancedSearchPanel
          onSelectCompany={onSelectCompany}
          onRegisterNewCompany={onRegisterNewCompany}
        />
      )}

      {activeSubTab === 'unlinked' && <UnlinkedContactsTab />}

      {activeSubTab === 'admin_all' && (
        <AllContactsAdminTab
          currentUser={currentUser}
          onOpenAdminAuth={onOpenAdminAuth}
          onSelectCompanyById={onSelectCompanyById}
        />
      )}
    </div>
  );
};
