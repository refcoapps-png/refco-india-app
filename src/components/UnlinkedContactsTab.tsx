import React, { useState } from 'react';
import { UserCheck, Building, Phone, Mail, Link as LinkIcon, Search, Calendar, History } from 'lucide-react';
import { getCompanies, getContacts, saveContacts } from '../services/dbService';
import { Contact } from '../types';

export const UnlinkedContactsTab: React.FC = () => {
  const allContacts = getContacts();
  const companies = getCompanies();

  // Filter unlinked contacts
  const unlinked = allContacts.filter(
    c => c.currentCompanyId === null || c.employmentStatus === 'Left Job' || c.employmentStatus === 'Inactive'
  );

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [newDesignation, setNewDesignation] = useState('Purchase Manager');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCompanies = companies.filter(c =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLinkCompany = () => {
    if (!selectedContact || !targetCompanyId) return;

    const targetCompany = companies.find(c => c.id === targetCompanyId);
    if (!targetCompany) return;

    const updatedContacts = getContacts().map(c => {
      if (c.id === selectedContact.id) {
        const nowIso = new Date().toISOString();
        return {
          ...c,
          currentCompanyId: targetCompany.id,
          currentCompanyName: targetCompany.companyName,
          designation: newDesignation,
          employmentStatus: 'Active' as const,
          employmentHistory: [
            ...(c.employmentHistory || []),
            {
              id: 'h_' + Date.now(),
              companyName: targetCompany.companyName,
              companyId: targetCompany.id,
              designation: newDesignation,
              startDate: nowIso,
              endDate: 'Present'
            }
          ]
        };
      }
      return c;
    });

    saveContacts(updatedContacts);
    setSelectedContact(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
            Job Transition & Lead Tracking
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-1">
            Unlinked Contacts Directory ({unlinked.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key decision-makers who have left previous companies. Re-link them to their new employers!
          </p>
        </div>
        <UserCheck className="w-8 h-8 text-amber-400 shrink-0" />
      </div>

      {unlinked.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unlinked.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3 relative hover:border-amber-500 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Status: {contact.employmentStatus}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">
                    {contact.salutation} {contact.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">{contact.designation}</p>
                </div>

                <button
                  onClick={() => setSelectedContact(contact)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>[ Link to New Company ]</span>
                </button>
              </div>

              {/* Contact Communications */}
              <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-800 shrink-0" />
                    <span className="font-extrabold text-slate-900">{contact.mobile1?.number}</span>
                  </div>
                  <a
                    href={`tel:${contact.mobile1?.number}`}
                    className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg"
                  >
                    Call
                  </a>
                </div>
                {contact.email1 && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{contact.email1}</span>
                  </div>
                )}
              </div>

              {/* Timeline Display: Past -> Current */}
              <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase block flex items-center space-x-1">
                  <History className="w-3 h-3" />
                  <span>Career Timeline</span>
                </span>
                <p className="font-semibold text-slate-200">
                  Past: <span className="text-amber-300 font-bold">{contact.employmentHistory?.[0]?.companyName || 'Refco India'}</span> ➔ Current: <span className="text-rose-400 font-bold">Unlinked ({contact.employmentStatus})</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No unlinked contacts right now.</p>
          <p className="text-xs text-slate-400">
            When a salesperson marks a contact's status as "Left Job" or "Inactive", they will automatically appear here.
          </p>
        </div>
      )}

      {/* MODAL WIZARD: LINK TO NEW COMPANY */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Link {selectedContact.salutation} {selectedContact.fullName} to New Company
                </h3>
                <p className="text-xs text-slate-500">Update employer & career timeline</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Search Target Company *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type company name to search..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  Select New Employer Company *
                </label>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="">-- Choose Company --</option>
                  {filteredCompanies.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.industryType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                  New Designation at Company *
                </label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkCompany}
                disabled={!targetCompanyId}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md uppercase tracking-wide ${
                  targetCompanyId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Confirm Link & Set Active
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
