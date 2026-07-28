import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, MessageSquare, ArrowLeft, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { getCompanies, getContacts, getVisits, saveVisits, getCurrentUser } from '../services/dbService';
import { VisitRecord, PurposeOfVisit } from '../types';
import { formatDateDDMMMYYYY, toInputDateValue } from '../utils/formatters';

interface Props {
  prefilledCompanyId?: string;
  onSaved: () => void;
  onCancel: () => void;
}

export const VisitRecordForm: React.FC<Props> = ({
  prefilledCompanyId,
  onSaved,
  onCancel,
}) => {
  const user = getCurrentUser();
  const companies = getCompanies();
  const contacts = getContacts();

  const [companyId, setCompanyId] = useState(prefilledCompanyId || (companies[0]?.id || ''));
  const selectedCompany = companies.find(c => c.id === companyId);

  // Filter contacts for selected company
  const companyContacts = contacts.filter(
    c => c.currentCompanyId === companyId && c.employmentStatus === 'Active'
  );

  const [contactPersonId, setContactPersonId] = useState(companyContacts[0]?.id || '');
  const [purpose, setPurpose] = useState<PurposeOfVisit>('Routine Visit');
  const [customPurpose, setCustomPurpose] = useState('');
  const [discussionMOM, setDiscussionMOM] = useState('');
  const [nextActionItem, setNextActionItem] = useState('');

  // Native Calendar Picker for Follow-up Date (stored in DD-MMM-YYYY format)
  const [rawFollowUpDate, setRawFollowUpDate] = useState(toInputDateValue(new Date().toISOString()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionMOM.trim()) return;

    const visits = getVisits();
    const contactObj = companyContacts.find(c => c.id === contactPersonId);

    const formattedFollowUp = formatDateDDMMMYYYY(rawFollowUpDate);

    const newVisit: VisitRecord = {
      id: 'v_' + Date.now(),
      visitDateTime: new Date().toISOString(),
      salespersonId: user?.id || 'usr_guest',
      salespersonName: user?.fullName || 'Sales Executive',
      companyId,
      companyName: selectedCompany?.companyName || 'Unknown Company',
      contactPersonId: contactPersonId || '',
      contactPersonName: contactObj ? `${contactObj.salutation} ${contactObj.fullName}` : 'General Contact',
      purpose: purpose === '+ Add Custom Purpose' ? customPurpose : purpose,
      discussionMOM: discussionMOM.trim(),
      nextActionItem: nextActionItem.trim(),
      followUpDate: formattedFollowUp,
      followUpStatus: 'Pending'
    };

    saveVisits([newVisit, ...visits]);
    onSaved();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h2 className="font-extrabold text-base">Log Sales Visit Record</h2>
            <p className="text-xs text-amber-400">Refco Field Interaction Log</p>
          </div>
        </div>
        <Clock className="w-6 h-6 text-amber-400" />
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
        {/* Salesperson & Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Salesperson</span>
            <span className="text-xs font-extrabold text-slate-800">{user?.fullName || 'Sales Executive'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Company</span>
            <span className="text-xs font-extrabold text-cyan-900">{selectedCompany?.companyName || 'Select Company'}</span>
          </div>
        </div>

        {/* Company Dropdown if not prefilled */}
        {!prefilledCompanyId && (
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Select Company *
            </label>
            <select
              value={companyId}
              onChange={(e) => {
                setCompanyId(e.target.value);
                const firstContact = contacts.find(c => c.currentCompanyId === e.target.value && c.employmentStatus === 'Active');
                setContactPersonId(firstContact?.id || '');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Met With Contact Dropdown */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
            Met With (Active Contact Person) *
          </label>
          <select
            value={contactPersonId}
            onChange={(e) => setContactPersonId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
          >
            <option value="">-- Select Contact Person --</option>
            {companyContacts.map(c => (
              <option key={c.id} value={c.id}>
                {c.salutation} {c.fullName} ({c.designation})
              </option>
            ))}
          </select>
        </div>

        {/* Purpose of Visit */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
            Purpose of Visit *
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as PurposeOfVisit)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
          >
            <option value="Cold Call">Cold Call</option>
            <option value="Routine Visit">Routine Visit</option>
            <option value="Quotation Discussion">Quotation Discussion</option>
            <option value="Material Delivery">Material Delivery</option>
            <option value="Complaint Resolution">Complaint Resolution</option>
            <option value="Payment Collection">Payment Collection</option>
            <option value="+ Add Custom Purpose">+ Add Custom Purpose</option>
          </select>
          {purpose === '+ Add Custom Purpose' && (
            <input
              type="text"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              required
              placeholder="Specify Custom Purpose..."
              className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            />
          )}
        </div>

        {/* Minutes of Meeting / Discussion */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
            Discussion / Minutes of Meeting (MOM) *
          </label>
          <textarea
            value={discussionMOM}
            onChange={(e) => setDiscussionMOM(e.target.value)}
            required
            rows={4}
            placeholder="Detailed meeting notes, refractory specs discussed, price quotes..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white"
          />
        </div>

        {/* Next Action Item */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
            Next Action Item
          </label>
          <input
            type="text"
            value={nextActionItem}
            onChange={(e) => setNextActionItem(e.target.value)}
            placeholder="e.g. Send quotation for High Alumina Bricks by Friday"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
          />
        </div>

        {/* Calendar Picker for Follow-up Date (Enforcing DD-MMM-YYYY Visual Format) */}
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
          <label className="block text-xs font-bold text-amber-950 uppercase flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>Follow-up Date (Calendar Picker)</span>
          </label>

          <input
            type="date"
            value={rawFollowUpDate}
            onChange={(e) => setRawFollowUpDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-semibold"
          />

          <p className="text-[11px] text-amber-800 font-medium">
            Saved & Displayed Format: <span className="font-extrabold text-amber-950">[{formatDateDDMMMYYYY(rawFollowUpDate)}]</span>
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-900 hover:bg-cyan-800 text-white font-bold rounded-xl shadow-md text-sm uppercase flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Visit Record</span>
          </button>
        </div>
      </form>
    </div>
  );
};
