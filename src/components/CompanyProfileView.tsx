import React, { useState } from 'react';
import {
  Building, Phone, Mail, Plus, MapPin, Layers, Clock,
  FileText, ShieldCheck, User as UserIcon, ArrowLeft, Camera, ExternalLink, Calendar
} from 'lucide-react';
import { Company, Contact, VisitRecord, FinancialDocument } from '../types';
import { getContacts, getVisits } from '../services/dbService';
import { PasswordPromptModal } from './PasswordPromptModal';

interface Props {
  company: Company;
  onBack: () => void;
  onAddContact: (companyId: string) => void;
  onLogVisit: (companyId: string) => void;
}

export const CompanyProfileView: React.FC<Props> = ({
  company,
  onBack,
  onAddContact,
  onLogVisit,
}) => {
  const contacts = getContacts().filter(
    c => c.currentCompanyId === company.id && c.employmentStatus === 'Active'
  );

  const visits = getVisits().filter(v => v.companyId === company.id);

  // Security Lock Modal State for viewing financial documents
  const [selectedDoc, setSelectedDoc] = useState<FinancialDocument | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [openedDocumentUrl, setOpenedDocumentUrl] = useState<string | null>(null);

  // Determine Dynamic Background Theme
  let themeContainerClass = 'bg-amber-50/80 border-amber-200 text-amber-950'; // Default Yellow (Prospect)
  let themeBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  let themeTitle = 'PROSPECT CLIENT (Unverified / No Docs)';

  if (company.relationshipType === 'Vendor/Supplier') {
    themeContainerClass = 'bg-blue-50/80 border-blue-200 text-blue-950';
    themeBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    themeTitle = 'VENDOR / SUPPLIER';
  } else if (company.financialDocuments && company.financialDocuments.length > 0) {
    themeContainerClass = 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
    themeBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    themeTitle = 'VERIFIED ACTIVE CUSTOMER';
  }

  const handleDocClick = (doc: FinancialDocument) => {
    setSelectedDoc(doc);
    setIsPasswordModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 mb-12">
      
      {/* Top Navigation & Status Banner */}
      <div className={`p-6 rounded-3xl border shadow-lg transition-all ${themeContainerClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-current/10">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${themeBadgeClass}`}>
                  {themeTitle}
                </span>
                <span className="text-xs font-semibold opacity-75">{company.industryType} Industry</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-1">
                {company.companyName}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onAddContact(company.id)}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>[+ Add New Person]</span>
            </button>
            <button
              onClick={() => onLogVisit(company.id)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>[+ Log New Visit]</span>
            </button>
          </div>
        </div>

        {/* Addresses & GST Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold opacity-70 uppercase tracking-wider text-[10px] block flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Registered Office</span>
            </span>
            <p className="font-medium">
              {company.registeredAddress.addressLine}, {company.registeredAddress.city},{' '}
              {company.registeredAddress.state} - <span className="font-bold">{company.registeredAddress.pinCode}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="font-bold opacity-70 uppercase tracking-wider text-[10px] block">
              Plants Count ({company.plants?.length || 0})
            </span>
            {company.plants && company.plants.length > 0 ? (
              <ul className="space-y-1">
                {company.plants.map((p, i) => (
                  <li key={p.id || i} className="text-[11px] font-medium">
                    Plant {i + 1}: {p.plantAddress}, {p.city} ({p.pinCode})
                  </li>
                ))}
              </ul>
            ) : (
              <span className="italic opacity-60">No plant addresses added</span>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-bold opacity-70 uppercase tracking-wider text-[10px] block">
              Tax & Lead Source
            </span>
            <p className="text-[11px]">PAN: <span className="font-bold">{company.panNumber || 'N/A'}</span></p>
            <p className="text-[11px]">Ref Source: <span className="font-bold">{company.leadSource}</span> {company.applicatorName ? `(${company.applicatorName})` : ''}</p>
          </div>
        </div>
      </div>

      {/* FINANCIAL DOCUMENTS & SECURITY LOCK */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Financial Documents ({company.financialDocuments?.length || 0})
            </h3>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full border">
            Password Protected Vault
          </span>
        </div>

        {company.financialDocuments && company.financialDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {company.financialDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleDocClick(doc)}
                className="p-3 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mb-1">
                    {doc.documentType}
                  </span>
                  <p className="font-bold text-xs text-slate-900">{doc.documentNumber}</p>
                  <p className="text-[10px] text-slate-500">{doc.documentDate}</p>
                </div>
                <div className="p-2 bg-slate-200 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white rounded-xl transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl text-center">
            No financial documents (PO/PI/Invoice) attached yet. Uploading a document will automatically upgrade this account to "Verified Active Customer".
          </p>
        )}
      </div>

      {/* TECHNICAL ASSETS, ACIDS & PRODUCT MATRIX */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b pb-2">
          <Layers className="w-4 h-4 text-cyan-800" />
          <span>Technical Assets & Chemical Specs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Equipments */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase block">Plant Equipments</span>
            {company.equipments && company.equipments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {company.equipments.map(eq => (
                  <span key={eq.id} className="bg-white border px-2.5 py-1 rounded-lg font-semibold text-slate-800">
                    {eq.equipmentName} <span className="text-cyan-800 font-extrabold">(Qty: {eq.quantity})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No equipment listed</p>
            )}
          </div>

          {/* Acid Specs */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 uppercase block">Acids Used</span>
            {company.acidSpecs && company.acidSpecs.length > 0 ? (
              <div className="space-y-1">
                {company.acidSpecs.map(ac => (
                  <p key={ac.id} className="font-medium text-rose-950">
                    <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">{ac.acidName}:</span> {ac.remarks || 'Standard concentration'}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No acids listed</p>
            )}
            {company.acidSectionRemarks && (
              <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border italic mt-2">
                "{company.acidSectionRemarks}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LINKED CONTACTS SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-cyan-800" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Linked Active Contacts ({contacts.length})
            </h3>
          </div>
          <button
            onClick={() => onAddContact(company.id)}
            className="px-3.5 py-1.5 bg-cyan-900 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>[+ Add Person]</span>
          </button>
        </div>

        {contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative group hover:border-cyan-800 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-800 uppercase bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 inline-block mb-1">
                      {c.designation}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {c.salutation} {c.fullName}
                    </h4>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-800 shrink-0" />
                    <span className="font-semibold text-slate-800">{c.mobile1?.number}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                      {c.mobile1?.tag}
                    </span>
                    
                    {/* DIRECT PHONE CALL CTA BUTTON */}
                    <a
                      href={`tel:${c.mobile1?.number}`}
                      className="ml-auto px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 shadow-xs"
                      title="Direct Mobile Call"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Now</span>
                    </a>
                  </div>

                  {c.email1 && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.email1}</span>
                    </div>
                  )}
                </div>

                {/* Visiting Card Thumbnail Preview */}
                {(c.visitingCardFront || c.visitingCardBack) && (
                  <div className="pt-2 flex items-center space-x-2">
                    {c.visitingCardFront && (
                      <img src={c.visitingCardFront} alt="Card Front" className="h-10 rounded border object-contain" />
                    )}
                    {c.visitingCardBack && (
                      <img src={c.visitingCardBack} alt="Card Back" className="h-10 rounded border object-contain" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
            No active contacts linked to this company yet. Click "+ Add Person" above.
          </p>
        )}
      </div>

      {/* VISIT HISTORY TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              Visit History Timeline ({visits.length})
            </h3>
          </div>
          <button
            onClick={() => onLogVisit(company.id)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>[+ Log Visit]</span>
          </button>
        </div>

        {visits.length > 0 ? (
          <div className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-amber-200/50 pb-2">
                  <span className="font-extrabold text-slate-900 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>{v.followUpDate || 'Recent Visit'}</span>
                  </span>
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    Purpose: {v.purpose}
                  </span>
                </div>

                <div className="grid grid-cols-2 text-[11px] font-semibold text-slate-700">
                  <p>Salesperson: <span className="text-slate-900 font-extrabold">{v.salespersonName}</span></p>
                  <p className="text-right">Met With: <span className="text-slate-900 font-extrabold">{v.contactPersonName}</span></p>
                </div>

                <p className="text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-amber-200/80 font-medium leading-relaxed">
                  "{v.discussionMOM}"
                </p>

                {v.nextActionItem && (
                  <p className="text-xs text-amber-900 font-bold bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                    Action: {v.nextActionItem}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
            No past visit logs recorded for this company.
          </p>
        )}
      </div>

      {/* SECURITY RE-AUTHENTICATION PASSWORD PROMPT MODAL */}
      {selectedDoc && (
        <PasswordPromptModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          companyName={company.companyName}
          documentType={selectedDoc.documentType}
          documentNumber={selectedDoc.documentNumber}
          onSuccess={() => {
            setIsPasswordModalOpen(false);
            setOpenedDocumentUrl(selectedDoc.fileUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c');
          }}
        />
      )}

      {/* Opened Document Overlay */}
      {openedDocumentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900">
                Opened Financial Document: {selectedDoc?.documentNumber}
              </h3>
              <button
                onClick={() => setOpenedDocumentUrl(null)}
                className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
            <img src={openedDocumentUrl} alt="Document" className="w-full max-h-[70vh] object-contain rounded-xl border" />
          </div>
        </div>
      )}
    </div>
  );
};
