import React, { useState } from 'react';
import { Search, Phone, MapPin, Building, User, Filter, ArrowRight, ShieldCheck } from 'lucide-react';
import { getCompanies, getContacts } from '../services/dbService';
import { Company, Contact } from '../types';

interface Props {
  onSelectCompany: (company: Company) => void;
  onRegisterNewCompany: () => void;
}

export const AdvancedSearchPanel: React.FC<Props> = ({
  onSelectCompany,
  onRegisterNewCompany,
}) => {
  const companies = getCompanies();
  const contacts = getContacts();

  const [activeTab, setActiveTab] = useState<'company' | 'person' | 'pincode' | 'industry'>('company');

  // Search Inputs
  const [companySearch, setCompanySearch] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [pincodeSearch, setPincodeSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');

  // Filtering Logic
  const filteredByCompany = companySearch.trim()
    ? companies.filter(c => c.companyName.toLowerCase().includes(companySearch.toLowerCase()))
    : [];

  const filteredByPerson = personSearch.trim()
    ? contacts.filter(c => c.fullName.toLowerCase().includes(personSearch.toLowerCase()))
    : [];

  const filteredByPincode = pincodeSearch.trim().length >= 3
    ? companies.filter(c => {
        const regMatch = c.registeredAddress?.pinCode?.includes(pincodeSearch);
        const plantMatch = c.plants?.some(p => p.pinCode?.includes(pincodeSearch));
        return regMatch || plantMatch;
      })
    : [];

  const filteredByIndustry = selectedIndustry
    ? companies.filter(c => c.industryType.toLowerCase() === selectedIndustry.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4">
        <div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
            Refco Directory Search
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-1">
            4-Way Multi-Criteria Lead & Contact Search
          </h2>
          <p className="text-xs text-slate-300">
            Search companies, person names, pin codes for location leads, or industry references.
          </p>
        </div>

        {/* 4 Search Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'company'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>By Company</span>
          </button>

          <button
            onClick={() => setActiveTab('person')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'person'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>By Person Name</span>
          </button>

          <button
            onClick={() => setActiveTab('pincode')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'pincode'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>By Pin Code</span>
          </button>

          <button
            onClick={() => setActiveTab('industry')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'industry'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-102'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Industry Filter</span>
          </button>
        </div>
      </div>

      {/* SEARCH METHOD 1: COMPANY NAME */}
      {activeTab === 'company' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder="Search Company Name (e.g. Gujarat Steel, Surat Chemical)..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-cyan-800"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          </div>

          {companySearch.trim() !== '' && (
            <div>
              {filteredByCompany.length > 0 ? (
                <div className="space-y-2">
                  {filteredByCompany.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => onSelectCompany(comp)}
                      className="p-4 bg-white border border-slate-200 hover:border-cyan-800 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            comp.relationshipType === 'Vendor/Supplier' ? 'bg-blue-100 text-blue-800' :
                            comp.financialDocuments?.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {comp.relationshipType === 'Vendor/Supplier' ? 'VENDOR' : comp.financialDocuments?.length > 0 ? 'ACTIVE CUSTOMER' : 'PROSPECT'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{comp.industryType}</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1">{comp.companyName}</h4>
                        <p className="text-xs text-slate-500">
                          {comp.registeredAddress?.city}, {comp.registeredAddress?.state} ({comp.registeredAddress?.pinCode})
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-cyan-800 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-2xl border text-center space-y-3">
                  <p className="text-sm font-bold text-rose-600">No company found with this name.</p>
                  <button
                    onClick={onRegisterNewCompany}
                    className="px-5 py-2.5 bg-cyan-900 hover:bg-cyan-800 text-white text-xs font-extrabold rounded-xl shadow-md uppercase tracking-wide"
                  >
                    [+ Register New Company]
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SEARCH METHOD 2: PERSON NAME */}
      {activeTab === 'person' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={personSearch}
              onChange={(e) => setPersonSearch(e.target.value)}
              placeholder="Search Person Name (e.g. Vikram Mehta, Ramesh)..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-cyan-800"
            />
            <User className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          </div>

          {personSearch.trim() !== '' && (
            <div className="space-y-2">
              {filteredByPerson.map((contact) => {
                const parentCompany = companies.find(c => c.id === contact.currentCompanyId);

                return (
                  <div
                    key={contact.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-800 uppercase bg-cyan-50 px-2 py-0.5 rounded">
                          {contact.designation}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base">
                          {contact.salutation} {contact.fullName}
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                        Company: {parentCompany?.companyName || contact.currentCompanyName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-bold text-slate-800">{contact.mobile1?.number}</span>
                      
                      {/* DIRECT CALL CTA */}
                      <a
                        href={`tel:${contact.mobile1?.number}`}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center space-x-1 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Now</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEARCH METHOD 3: PIN CODE LOCATION LEADS + DIRECT CALL CTA */}
      {activeTab === 'pincode' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={pincodeSearch}
              onChange={(e) => setPincodeSearch(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-Digit Pin Code (e.g. 380015, 395003)..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl shadow-sm text-sm font-semibold focus:ring-2 focus:ring-cyan-800"
            />
            <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          </div>

          {pincodeSearch.trim() !== '' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Location Leads in Pin Code [{pincodeSearch}] ({filteredByPincode.length} Companies)
              </span>

              {filteredByPincode.map((comp) => {
                const compContacts = contacts.filter(
                  c => c.currentCompanyId === comp.id && c.employmentStatus === 'Active'
                );

                return (
                  <div
                    key={comp.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{comp.companyName}</h4>
                        <p className="text-xs text-slate-500">
                          {comp.registeredAddress?.addressLine}, {comp.registeredAddress?.city} ({comp.registeredAddress?.pinCode})
                        </p>
                      </div>
                      <button
                        onClick={() => onSelectCompany(comp)}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
                      >
                        View Profile
                      </button>
                    </div>

                    {/* DIRECT CALL CTA FOR ALL CONTACTS OF THIS COMPANY */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Contacts:</span>
                      {compContacts.length > 0 ? (
                        compContacts.map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <div>
                              <span className="text-xs font-extrabold text-slate-900">{c.salutation} {c.fullName}</span>
                              <span className="text-[10px] text-slate-600 block">{c.designation}</span>
                            </div>
                            <a
                              href={`tel:${c.mobile1?.number}`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call {c.mobile1?.number}</span>
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No contact numbers linked</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEARCH METHOD 4: INDUSTRY-WISE REFERENCE FILTER */}
      {activeTab === 'industry' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
              Select Industry Type for Client References
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl shadow-sm text-sm font-bold text-slate-900"
            >
              <option value="">-- Choose Industry Reference --</option>
              <option value="Steel">Steel Industry</option>
              <option value="Chemical">Chemical Industry</option>
              <option value="Galvanizing">Galvanizing Industry</option>
              <option value="Cement">Cement Industry</option>
              <option value="Power">Power Industry</option>
              <option value="Other">Other Industry</option>
            </select>
          </div>

          {selectedIndustry && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Active Refco Client References for [{selectedIndustry}] ({filteredByIndustry.length})
              </span>

              {filteredByIndustry.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => onSelectCompany(comp)}
                  className="p-4 bg-white border border-slate-200 hover:border-amber-500 rounded-2xl shadow-sm cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{comp.companyName}</h4>
                    <p className="text-xs text-slate-500">{comp.registeredAddress?.city}, {comp.registeredAddress?.state}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl">
                    Reference
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
