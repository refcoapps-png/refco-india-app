import React from 'react';
import {
  Users, Clock, Calculator, FileText, Building, PlusCircle
} from 'lucide-react';

export type MainTabType = 'contacts' | 'visits' | 'calculators' | 'vouchers' | 'hr';

interface Props {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  onOpenAddNew: () => void;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  onOpenAddNew,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 shadow-2xl px-2 py-1.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-around">
        
        {/* 1. CONTACTS */}
        <button
          onClick={() => onChangeTab('contacts')}
          className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl transition-all ${
            activeTab === 'contacts'
              ? 'text-amber-400 bg-white/10 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">1. Contacts</span>
        </button>

        {/* 2. VISITS & FOLLOW-UPS */}
        <button
          onClick={() => onChangeTab('visits')}
          className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl transition-all ${
            activeTab === 'visits'
              ? 'text-amber-400 bg-white/10 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">2. Visits</span>
        </button>

        {/* 3. CALCULATORS */}
        <button
          onClick={() => onChangeTab('calculators')}
          className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl transition-all ${
            activeTab === 'calculators'
              ? 'text-amber-400 bg-white/10 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          <Calculator className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">3. Calculators</span>
        </button>

        {/* 4. VOUCHERS */}
        <button
          onClick={() => onChangeTab('vouchers')}
          className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl transition-all ${
            activeTab === 'vouchers'
              ? 'text-amber-400 bg-white/10 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">4. Vouchers</span>
        </button>

        {/* 5. HR & FIELD OPS */}
        <button
          onClick={() => onChangeTab('hr')}
          className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl transition-all ${
            activeTab === 'hr'
              ? 'text-amber-400 bg-white/10 font-black scale-105'
              : 'text-slate-400 hover:text-slate-200 font-semibold'
          }`}
        >
          <Building className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">5. HR & Ops</span>
        </button>

        {/* 6. ADD NEW COMPANY / CONTACTS */}
        <button
          onClick={onOpenAddNew}
          className="flex flex-col items-center justify-center px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-105"
        >
          <PlusCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight uppercase">+ Add New</span>
        </button>

      </div>
    </nav>
  );
};
