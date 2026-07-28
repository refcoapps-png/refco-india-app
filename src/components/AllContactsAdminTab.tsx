import React, { useState } from 'react';
import {
  ShieldCheck, Users, Search, Phone, Mail, Building,
  FileSpreadsheet, Lock, ExternalLink, Calendar, MessageSquare, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getContacts, getCompanies, saveContacts } from '../services/dbService';
import { Contact, User } from '../types';

interface Props {
  currentUser: User | null;
  onOpenAdminAuth: () => void;
  onSelectCompanyById?: (companyId: string) => void;
}

export const AllContactsAdminTab: React.FC<Props> = ({
  currentUser,
  onOpenAdminAuth,
  onSelectCompanyById,
}) => {
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.email === 'info@refcoindia.com';
  
  const contacts = getContacts();
  const companies = getCompanies();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter contacts logic
  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.fullName.toLowerCase().includes(query) ||
      c.currentCompanyName.toLowerCase().includes(query) ||
      c.designation.toLowerCase().includes(query) ||
      c.mobile1?.number.includes(query) ||
      c.mobile2?.number.includes(query) ||
      c.email1?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && c.employmentStatus === 'Active') ||
      (statusFilter === 'Unlinked' && (c.currentCompanyId === null || c.employmentStatus === 'Left Job' || c.employmentStatus === 'Inactive'));

    return matchesSearch && matchesStatus;
  });

  const handleExportToExcel = () => {
    const dataToExport = filteredContacts.map((c) => ({
      'Contact ID': c.id,
      'Salutation': c.salutation,
      'Full Name': c.fullName,
      'Designation': c.designation,
      'Company Name': c.currentCompanyName,
      'Employment Status': c.employmentStatus,
      'Primary Mobile': c.mobile1?.number || '',
      'Primary Mobile Tag': c.mobile1?.tag || '',
      'Secondary Mobile': c.mobile2?.number || '',
      'Landline': c.landline?.number || '',
      'Email 1': c.email1 || '',
      'Email 2': c.email2 || '',
      'Created Date': c.createdOn ? new Date(c.createdOn).toLocaleDateString('en-IN') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Contacts');
    XLSX.writeFile(workbook, `Refco_Master_Contacts_Admin_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Restricted Access View for Non-Admin
  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-4 my-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Admin Access Restricted
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 pt-1">
            Master Contact Directory (Admin Only)
          </h3>
          <p className="text-xs text-slate-500">
            Viewing all client & vendor contact persons across Refco India operations requires Administrator authorization (`info@refcoindia.com`).
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenAdminAuth}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wide flex items-center space-x-2 mx-auto"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Open Admin Panel / Verify Admin Authorization</span>
          </button>
        </div>
      </div>
    );
  }

  // Admin View
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
            Admin Privilege View
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-1 flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-400 inline" />
            <span>Master Contact Directory ({contacts.length} Total)</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Full view & management of all contact persons across all Refco clients & vendors
          </p>
        </div>

        <button
          onClick={handleExportToExcel}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center space-x-2 uppercase tracking-wide shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Contacts (.xlsx)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Contacts</span>
          <span className="text-xl font-extrabold text-slate-900">{contacts.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Active Linked</span>
          <span className="text-xl font-extrabold text-emerald-700">
            {contacts.filter(c => c.employmentStatus === 'Active' && c.currentCompanyId).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Unlinked / Left Job</span>
          <span className="text-xl font-extrabold text-rose-700">
            {contacts.filter(c => !c.currentCompanyId || c.employmentStatus === 'Left Job' || c.employmentStatus === 'Inactive').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Companies</span>
          <span className="text-xl font-extrabold text-cyan-800">{companies.length}</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contact name, company, mobile, designation..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="All">All Statuses ({contacts.length})</option>
            <option value="Active">Active Only</option>
            <option value="Unlinked">Unlinked / Job Changed</option>
          </select>
        </div>
      </div>

      {/* Contacts List Grid */}
      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => {
            const company = companies.find((c) => c.id === contact.currentCompanyId);

            return (
              <div
                key={contact.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-cyan-800 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        contact.employmentStatus === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {contact.employmentStatus}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1">
                      {contact.salutation} {contact.fullName}
                    </h3>
                    <p className="text-xs font-bold text-slate-600">{contact.designation}</p>
                  </div>

                  {company && onSelectCompanyById && (
                    <button
                      onClick={() => onSelectCompanyById(company.id)}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold rounded-xl border border-cyan-200 flex items-center space-x-1"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>{company.companyName.slice(0, 18)}...</span>
                    </button>
                  )}
                </div>

                {/* Company Name info */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-bold text-slate-700">Employer:</span>
                  <span className="font-extrabold text-slate-900">
                    {company ? company.companyName : contact.currentCompanyName || 'Unlinked'}
                  </span>
                </div>

                {/* Communication details & Direct CTA buttons */}
                <div className="space-y-2 pt-1 border-t text-xs">
                  {contact.mobile1?.number && (
                    <div className="flex items-center justify-between bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                          Mobile ({contact.mobile1.tag})
                        </span>
                        <span className="font-extrabold text-slate-900">{contact.mobile1.number}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <a
                          href={`tel:${contact.mobile1.number}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg flex items-center space-x-1 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${contact.mobile1.number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg flex items-center space-x-1 shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.email1 && (
                    <div className="flex items-center justify-between text-slate-600 px-1">
                      <span className="truncate max-w-[200px]">{contact.email1}</span>
                      <a
                        href={`mailto:${contact.email1}`}
                        className="text-cyan-800 hover:underline font-bold flex items-center space-x-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No contacts matching search query.</p>
        </div>
      )}
    </div>
  );
};
