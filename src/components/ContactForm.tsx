import React, { useState } from 'react';
import {
  User as UserIcon, Phone, Mail, Building, ArrowLeft,
  Camera, Upload, CheckCircle2, ShieldAlert, X
} from 'lucide-react';
import { getCompanies, getContacts, saveContacts } from '../services/dbService';
import { Contact, Salutation, PhoneTag, EmploymentStatus } from '../types';
import { fileToBase64 } from '../utils/formatters';

interface Props {
  prefilledCompanyId?: string | null;
  initialContact?: Contact | null;
  onFinished: (returnToDashboard: boolean) => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<Props> = ({
  prefilledCompanyId,
  initialContact,
  onFinished,
  onCancel,
}) => {
  const companies = getCompanies();
  const selectedCompany = companies.find(c => c.id === (initialContact?.currentCompanyId || prefilledCompanyId));

  const [salutation, setSalutation] = useState<Salutation>(initialContact?.salutation || 'Mr.');
  const [fullName, setFullName] = useState(initialContact?.fullName || '');

  // Mobile 1 with Real-time Unique Validation
  const [mobile1, setMobile1] = useState(initialContact?.mobile1?.number || '');
  const [mobile1Tag, setMobile1Tag] = useState<PhoneTag>(initialContact?.mobile1?.tag || 'Office');
  const [mobileError, setMobileError] = useState('');
  const [isMobileDuplicate, setIsMobileDuplicate] = useState(false);

  // Mobile 2, Landline, International
  const [mobile2, setMobile2] = useState(initialContact?.mobile2?.number || '');
  const [mobile2Tag, setMobile2Tag] = useState<PhoneTag>(initialContact?.mobile2?.tag || 'Personal');

  const [landline, setLandline] = useState(initialContact?.landline?.number || '');
  const [landlineTag, setLandlineTag] = useState<PhoneTag>(initialContact?.landline?.tag || 'Office');

  const [internationalNo, setInternationalNo] = useState(initialContact?.internationalNo || '');

  // Emails & Designation
  const [email1, setEmail1] = useState(initialContact?.email1 || '');
  const [email2, setEmail2] = useState(initialContact?.email2 || '');

  const [designation, setDesignation] = useState(initialContact?.designation || 'Purchase Manager');
  const [customDesignation, setCustomDesignation] = useState('');

  // Company Linkage & Status
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(
    initialContact?.currentCompanyId || prefilledCompanyId || (companies[0]?.id || '')
  );
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(initialContact?.employmentStatus || 'Active');

  // Visiting Card Photos
  const [visitingCardFront, setVisitingCardFront] = useState(initialContact?.visitingCardFront || '');
  const [visitingCardBack, setVisitingCardBack] = useState(initialContact?.visitingCardBack || '');

  // Modal prompt after save
  const [showSaveSuccessPrompt, setShowSaveSuccessPrompt] = useState(false);

  // Real-time unique mobile number validation
  const checkDuplicateMobile = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 10) {
      const contacts = getContacts();
      const existing = contacts.find(
        c => (c.mobile1?.number === cleaned || c.mobile2?.number === cleaned) && c.id !== initialContact?.id
      );

      if (existing) {
        setMobileError(`This mobile number is already registered to another contact (${existing.fullName})!`);
        setIsMobileDuplicate(true);
      } else {
        setMobileError('');
        setIsMobileDuplicate(false);
      }
    } else {
      setMobileError('');
      setIsMobileDuplicate(false);
    }
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      setVisitingCardFront(b64);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      setVisitingCardBack(b64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMobileDuplicate) return;

    const contacts = getContacts();
    const activeCompany = companies.find(c => c.id === currentCompanyId);

    const isUnlinking = employmentStatus === 'Left Job' || employmentStatus === 'Inactive';
    const nowIso = new Date().toISOString();

    const newContact: Contact = {
      id: initialContact?.id || 'cnt_' + Date.now(),
      salutation,
      fullName: fullName.trim(),
      mobile1: { number: mobile1.replace(/\D/g, ''), tag: mobile1Tag },
      mobile2: { number: mobile2.replace(/\D/g, ''), tag: mobile2Tag },
      landline: { number: landline.trim(), tag: landlineTag },
      internationalNo: internationalNo.trim(),
      email1: email1.trim(),
      email2: email2.trim(),
      designation: designation === '+ Add New Designation' ? customDesignation : designation,
      currentCompanyId: isUnlinking ? null : currentCompanyId,
      currentCompanyName: isUnlinking ? 'Unlinked' : (activeCompany?.companyName || 'Unlinked'),
      employmentStatus,
      createdOn: initialContact?.createdOn || nowIso,
      inactiveDate: isUnlinking ? nowIso : initialContact?.inactiveDate,
      visitingCardFront,
      visitingCardBack,
      employmentHistory: [
        ...(initialContact?.employmentHistory || []),
        {
          id: 'h_' + Date.now(),
          companyName: activeCompany?.companyName || 'Unknown',
          companyId: currentCompanyId,
          designation: designation === '+ Add New Designation' ? customDesignation : designation,
          startDate: initialContact?.createdOn || nowIso,
          endDate: isUnlinking ? nowIso : 'Present'
        }
      ]
    };

    if (initialContact) {
      const idx = contacts.findIndex(c => c.id === initialContact.id);
      if (idx >= 0) contacts[idx] = newContact;
      else contacts.push(newContact);
    } else {
      contacts.push(newContact);
    }

    saveContacts(contacts);
    setShowSaveSuccessPrompt(true);
  };

  const resetFormForNextContact = () => {
    setShowSaveSuccessPrompt(false);
    setSalutation('Mr.');
    setFullName('');
    setMobile1('');
    setMobile2('');
    setLandline('');
    setInternationalNo('');
    setEmail1('');
    setEmail2('');
    setVisitingCardFront('');
    setVisitingCardBack('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h2 className="font-extrabold text-base">
              {initialContact ? 'Edit Contact Person' : 'Add New Contact Person'}
            </h2>
            <p className="text-xs text-amber-400">
              {selectedCompany ? `Linked Company: ${selectedCompany.companyName}` : 'Refco Contact Directory'}
            </p>
          </div>
        </div>
        <UserIcon className="w-6 h-6 text-amber-400" />
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Company Linkage */}
        <div className="bg-cyan-950 text-white p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-300 block">Current Company</span>
              <span className="font-extrabold text-sm text-white">
                {selectedCompany?.companyName || 'No Company Linked'}
              </span>
            </div>
          </div>
          {prefilledCompanyId && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold uppercase">
              Auto-Filled & Locked
            </span>
          )}
        </div>

        {/* Primary Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Salutation *
            </label>
            <select
              value={salutation}
              onChange={(e) => setSalutation(e.target.value as Salutation)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            >
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Er.">Er.</option>
              <option value="Shri">Shri</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Person Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="e.g. Rajesh Kumar Sharma"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white"
            />
          </div>
        </div>

        {/* Mobile No 1 with Real-time Unique Constraint */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
            Mobile No 1 (10 Digits) *
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="tel"
                maxLength={10}
                value={mobile1}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setMobile1(val);
                  checkDuplicateMobile(val);
                }}
                required
                placeholder="10-digit mobile number"
                className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white ${
                  isMobileDuplicate ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300'
                }`}
              />
            </div>
            <select
              value={mobile1Tag}
              onChange={(e) => setMobile1Tag(e.target.value as PhoneTag)}
              className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold"
            >
              <option value="Office">Office</option>
              <option value="Personal">Personal</option>
              <option value="Home">Home</option>
            </select>
          </div>
          {mobileError && (
            <p className="text-xs font-bold text-rose-600 mt-1 flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{mobileError}</span>
            </p>
          )}
        </div>

        {/* Mobile No 2 & Landline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Mobile No 2 (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="tel"
                maxLength={10}
                value={mobile2}
                onChange={(e) => setMobile2(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
              <select
                value={mobile2Tag}
                onChange={(e) => setMobile2Tag(e.target.value as PhoneTag)}
                className="px-2.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="Personal">Personal</option>
                <option value="Office">Office</option>
                <option value="Home">Home</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Landline No (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={landline}
                onChange={(e) => setLandline(e.target.value)}
                placeholder="STD Code + Number"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
              <select
                value={landlineTag}
                onChange={(e) => setLandlineTag(e.target.value as PhoneTag)}
                className="px-2.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="Office">Office</option>
                <option value="Plant">Plant</option>
                <option value="Home">Home</option>
              </select>
            </div>
          </div>
        </div>

        {/* Emails & Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Email ID 1
            </label>
            <input
              type="email"
              value={email1}
              onChange={(e) => setEmail1(e.target.value)}
              placeholder="e.g. name@company.com"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Designation *
            </label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            >
              <option value="Purchase Manager">Purchase Manager</option>
              <option value="Purchase Executive">Purchase Executive</option>
              <option value="Plant Head">Plant Head</option>
              <option value="Maintenance Engineer">Maintenance Engineer</option>
              <option value="Managing Director">Managing Director</option>
              <option value="Owner">Owner</option>
              <option value="Accounts Manager">Accounts Manager</option>
              <option value="Stores In-charge">Stores In-charge</option>
              <option value="+ Add New Designation">+ Add New Designation</option>
            </select>
            {designation === '+ Add New Designation' && (
              <input
                type="text"
                value={customDesignation}
                onChange={(e) => setCustomDesignation(e.target.value)}
                required
                placeholder="Type custom designation..."
                className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            )}
          </div>
        </div>

        {/* Employment Status */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
            Employment Status *
          </label>
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
          >
            <option value="Active">Active</option>
            <option value="Left Job">Left Job (Unlink from company)</option>
            <option value="Inactive">Inactive (Unlink from company)</option>
            <option value="Department Change">Department Change</option>
          </select>
        </div>

        {/* Visiting Card Photos (Front / Back) */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
            Visiting Card Photos (Optional)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slot 1: Front */}
            <div className="border border-dashed border-slate-300 p-3 rounded-xl bg-white text-center">
              <span className="text-xs font-bold text-slate-700 block mb-2">Slot 1: Front Side Photo</span>
              {visitingCardFront ? (
                <div className="relative">
                  <img src={visitingCardFront} alt="Card Front" className="h-28 mx-auto rounded-lg object-contain border" />
                  <button
                    type="button"
                    onClick={() => setVisitingCardFront('')}
                    className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer py-3 bg-cyan-900/10 hover:bg-cyan-900/20 text-cyan-950 text-xs font-bold rounded-xl border border-cyan-800/20 flex items-center justify-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>[ Open Camera / Upload ]</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFrontUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Slot 2: Back */}
            <div className="border border-dashed border-slate-300 p-3 rounded-xl bg-white text-center">
              <span className="text-xs font-bold text-slate-700 block mb-2">Slot 2: Back Side Photo</span>
              {visitingCardBack ? (
                <div className="relative">
                  <img src={visitingCardBack} alt="Card Back" className="h-28 mx-auto rounded-lg object-contain border" />
                  <button
                    type="button"
                    onClick={() => setVisitingCardBack('')}
                    className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer py-3 bg-cyan-900/10 hover:bg-cyan-900/20 text-cyan-950 text-xs font-bold rounded-xl border border-cyan-800/20 flex items-center justify-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>[ Open Camera / Upload ]</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleBackUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
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
            disabled={isMobileDuplicate}
            className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center space-x-2 uppercase tracking-wide ${
              isMobileDuplicate ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-900 hover:bg-cyan-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>[ Save Contact ]</span>
          </button>
        </div>
      </form>

      {/* POP-UP PROMPT CONFIRMATION LOGIC */}
      {showSaveSuccessPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Contact Saved Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Do you want to add another contact person for this same company ({selectedCompany?.companyName || 'Refco'})?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSaveSuccessPrompt(false);
                  onFinished(true); // Return to Search Dashboard
                }}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                [ NO ] Done
              </button>
              <button
                onClick={resetFormForNextContact}
                className="py-2.5 px-3 bg-cyan-900 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-md"
              >
                [ YES ] Add Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
