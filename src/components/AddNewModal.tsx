import React from 'react';
import { Building, UserPlus, CalendarPlus, X, PlusCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: 'company' | 'contact' | 'visit') => void;
}

export const AddNewModal: React.FC<Props> = ({ isOpen, onClose, onSelectOption }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-6 h-6 text-amber-500" />
            <h3 className="font-extrabold text-base text-slate-900">Add New Record</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Select what type of record you would like to register or log into Refco India Mobility system:
        </p>

        <div className="space-y-3 pt-1">
          <button
            onClick={() => {
              onClose();
              onSelectOption('company');
            }}
            className="w-full p-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-2xl text-left transition-all flex items-center space-x-3 group shadow-xs"
          >
            <div className="p-3 bg-cyan-900 text-white rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">1. Add New Company</h4>
              <p className="text-xs text-slate-500">Client / Vendor name, industry, plants, GST, acid specs</p>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectOption('contact');
            }}
            className="w-full p-4 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-2xl text-left transition-all flex items-center space-x-3 group shadow-xs"
          >
            <div className="p-3 bg-emerald-700 text-white rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">2. Add Contact Person</h4>
              <p className="text-xs text-slate-500">Key decision maker, designation, mobile numbers & business card</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
