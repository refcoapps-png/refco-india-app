import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Building, ShieldAlert, ArrowLeft,
  FileText, CheckSquare, Camera, Upload, Layers
} from 'lucide-react';
import { getCompanies, saveCompanies } from '../services/dbService';
import {
  Company, PlantAddress, GSTMapping, EquipmentItem,
  AcidSpec, ProductMatrix, FinancialDocument, RelationshipType, DocumentType
} from '../types';
import { fileToBase64 } from '../utils/formatters';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
];

interface Props {
  initialCompany?: Company | null;
  onSavedSuccess: (company: Company) => void;
  onCancel: () => void;
}

export const CompanyForm: React.FC<Props> = ({ initialCompany, onSavedSuccess, onCancel }) => {
  const [companyName, setCompanyName] = useState(initialCompany?.companyName || '');
  const [nameError, setNameError] = useState('');
  const [isNameDuplicate, setIsNameDuplicate] = useState(false);

  const [industryType, setIndustryType] = useState(initialCompany?.industryType || 'Steel');
  const [customIndustry, setCustomIndustry] = useState(initialCompany?.customIndustry || '');

  // Registered Address
  const [addressLine, setAddressLine] = useState(initialCompany?.registeredAddress?.addressLine || '');
  const [city, setCity] = useState(initialCompany?.registeredAddress?.city || '');
  const [state, setState] = useState(initialCompany?.registeredAddress?.state || 'Gujarat');
  const [pinCode, setPinCode] = useState(initialCompany?.registeredAddress?.pinCode || '');

  // Dynamic Arrays
  const [plants, setPlants] = useState<PlantAddress[]>(initialCompany?.plants || []);
  const [gstMappings, setGstMappings] = useState<GSTMapping[]>(initialCompany?.gstMappings || []);
  const [panNumber, setPanNumber] = useState(initialCompany?.panNumber || '');

  // Reference / Lead Source
  const [leadSource, setLeadSource] = useState(initialCompany?.leadSource || 'Direct Visit / Cold Call');
  const [applicatorName, setApplicatorName] = useState(initialCompany?.applicatorName || '');
  const [otherReferenceDetails, setOtherReferenceDetails] = useState(initialCompany?.otherReferenceDetails || '');

  // Assets & Tech Specs
  const [equipments, setEquipments] = useState<EquipmentItem[]>(initialCompany?.equipments || []);
  const [acidSpecs, setAcidSpecs] = useState<AcidSpec[]>(initialCompany?.acidSpecs || []);
  const [acidSectionRemarks, setAcidSectionRemarks] = useState(initialCompany?.acidSectionRemarks || '');

  // Product Matrix
  const [productsMatrix, setProductsMatrix] = useState<ProductMatrix>(
    initialCompany?.productsMatrix || {
      refractoryInsulation: { ceramicFiberBlankets: false, ceramicFiberPaper: false, ceramicFiberBoards: false, ceramicFiberModules: false, others: false },
      refractoryBricks: { highAluminaBricks: false, insulationBricks: false, fireBricks: false, magnesiaBricks: false, magnesiteBricks: false, others: false },
      refractoryMaterials: { mortars: false, anchors: false, fireclay: false, asbestosMillBoard: false, others: false },
      acidResistantMaterials: { arBrick: false, arTile: false, arMortar: false, arEpoxyFloor: false, arEpoxyPaint: false, others: false },
      industrialTilesBricks: { industrialTiles: false, parkingTiles: false, floorTiles: false, adhesives: false, others: false },
      othersRemarks: ''
    }
  );

  // Financial Documents
  const [financialDocuments, setFinancialDocuments] = useState<FinancialDocument[]>(initialCompany?.financialDocuments || []);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(initialCompany?.relationshipType || 'Client/Customer');

  // On Blur / On Change Name Duplicate Check
  const checkDuplicateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setNameError('');
      setIsNameDuplicate(false);
      return;
    }

    const companies = getCompanies();
    const duplicate = companies.find(
      c => c.companyName.toLowerCase() === trimmed.toLowerCase() && c.id !== initialCompany?.id
    );

    if (duplicate) {
      setNameError('This company name is already registered!');
      setIsNameDuplicate(true);
    } else {
      setNameError('');
      setIsNameDuplicate(false);
    }
  };

  const handleAddPlant = () => {
    if (plants.length >= 10) return;
    setPlants([...plants, { id: 'p_' + Date.now(), plantAddress: '', city: '', state: 'Gujarat', pinCode: '' }]);
  };

  const handleAddEquipment = () => {
    if (equipments.length >= 20) return;
    setEquipments([...equipments, { id: 'eq_' + Date.now(), equipmentName: 'Furnace', quantity: 1 }]);
  };

  const handleAddAcid = () => {
    if (acidSpecs.length >= 5) return;
    setAcidSpecs([...acidSpecs, { id: 'ac_' + Date.now(), acidName: 'HCl', remarks: '' }]);
  };

  const handleAddDocument = () => {
    setFinancialDocuments([
      ...financialDocuments,
      {
        id: 'doc_' + Date.now(),
        documentType: 'PO',
        documentNumber: '',
        documentDate: new Date().toISOString().split('T')[0],
        fileUrl: '',
        fileName: ''
      }
    ]);
  };

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    const updated = [...financialDocuments];
    updated[index].fileUrl = base64;
    updated[index].fileName = file.name;
    setFinancialDocuments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameDuplicate) return;

    // Derived Account Status
    let accountStatus: 'Prospect' | 'Verified Active Customer' = 'Prospect';
    if (financialDocuments.length > 0) {
      accountStatus = 'Verified Active Customer';
    }

    const companies = getCompanies();
    const newCompany: Company = {
      id: initialCompany?.id || 'comp_' + Date.now(),
      companyName: companyName.trim(),
      industryType,
      customIndustry: (industryType === 'Other' || industryType === '+ Add Custom Industry') ? customIndustry : undefined,
      registeredAddress: {
        addressLine,
        city,
        state,
        pinCode
      },
      plants,
      gstMappings,
      panNumber,
      leadSource,
      applicatorName: leadSource === 'Applicator' ? applicatorName : undefined,
      otherReferenceDetails: leadSource === 'Other' ? otherReferenceDetails : undefined,
      equipments,
      acidSpecs,
      acidSectionRemarks,
      productsMatrix,
      financialDocuments,
      relationshipType,
      accountStatus,
      createdOn: initialCompany?.createdOn || new Date().toISOString()
    };

    if (initialCompany) {
      const idx = companies.findIndex(c => c.id === initialCompany.id);
      if (idx >= 0) companies[idx] = newCompany;
      else companies.push(newCompany);
    } else {
      companies.push(newCompany);
    }

    saveCompanies(companies);
    onSavedSuccess(newCompany);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h2 className="font-extrabold text-lg">
              {initialCompany ? 'Edit Company Profile' : 'Register New Customer / Company'}
            </h2>
            <p className="text-xs text-amber-400">Refco Database Management</p>
          </div>
        </div>
        <Building className="w-8 h-8 text-amber-400/80" />
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* PART 1: CORE COMPANY DETAILS */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Building className="w-4 h-4 text-cyan-800" />
            <span>Part 1: Basic Company Schema & Address</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name with Instant On-Blur Duplicate Check */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  checkDuplicateName(e.target.value);
                }}
                onBlur={(e) => checkDuplicateName(e.target.value)}
                required
                placeholder="e.g. Refco Industrial Solutions"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl focus:bg-white text-sm font-medium ${
                  isNameDuplicate ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300 focus:ring-2 focus:ring-cyan-800'
                }`}
              />
              {nameError && (
                <p className="text-xs font-bold text-rose-600 mt-1 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Industry Type */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Industry Type *
              </label>
              <select
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-800 text-sm"
              >
                <option value="Steel">Steel</option>
                <option value="Chemical">Chemical</option>
                <option value="Galvanizing">Galvanizing</option>
                <option value="Cement">Cement</option>
                <option value="Power">Power</option>
                <option value="Other">Other (+ Add Custom)</option>
              </select>
              {(industryType === 'Other' || industryType === '+ Add Custom Industry') && (
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="Specify Custom Industry..."
                  required
                  className="w-full mt-2 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              )}
            </div>
          </div>

          {/* Registered Address */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Registered Office Address
            </span>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  placeholder="Address Line"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="City"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="6-Digit Pin Code"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Repeatable Plant Addresses (Up to 10 Plants) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase">
                Plant Addresses (Max 10 Plants)
              </span>
              {plants.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddPlant}
                  className="px-3 py-1 bg-cyan-900 text-white text-xs font-semibold rounded-lg hover:bg-cyan-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>[+ Add Another Plant]</span>
                </button>
              )}
            </div>

            {plants.map((plant, idx) => (
              <div key={plant.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-2 relative">
                <input
                  type="text"
                  value={plant.plantAddress}
                  onChange={(e) => {
                    const updated = [...plants];
                    updated[idx].plantAddress = e.target.value;
                    setPlants(updated);
                  }}
                  placeholder={`Plant #${idx + 1} Address`}
                  className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm md:col-span-2"
                />
                <input
                  type="text"
                  value={plant.city}
                  onChange={(e) => {
                    const updated = [...plants];
                    updated[idx].city = e.target.value;
                    setPlants(updated);
                  }}
                  placeholder="City"
                  className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={plant.pinCode}
                    onChange={(e) => {
                      const updated = [...plants];
                      updated[idx].pinCode = e.target.value.replace(/\D/g, '');
                      setPlants(updated);
                    }}
                    placeholder="Pin Code"
                    className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setPlants(plants.filter((_, i) => i !== idx))}
                    className="text-rose-600 hover:text-rose-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Lead Source / Customer Reference Source with Dynamic Dependent Fields */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Customer Reference Source / Lead Source *
              </label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
              >
                <option value="Direct Visit / Cold Call">Direct Visit / Cold Call</option>
                <option value="Applicator">Applicator</option>
                <option value="CUMI">CUMI</option>
                <option value="MMTCL">MMTCL</option>
                <option value="Google Search">Google Search</option>
                <option value="IndiaMart">IndiaMart</option>
                <option value="Email Marketing">Email Marketing</option>
                <option value="WhatsApp Marketing">WhatsApp Marketing</option>
                <option value="Other">Other (Please Specify)</option>
              </select>
            </div>

            {/* Dynamic Dependent Input for Applicator */}
            {leadSource === 'Applicator' && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Specify Applicator Name *
                </label>
                <input
                  type="text"
                  value={applicatorName}
                  onChange={(e) => setApplicatorName(e.target.value)}
                  required
                  placeholder="e.g. Shree Sai Insulation Services"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm"
                />
              </div>
            )}

            {/* Dynamic Dependent Input for Other */}
            {leadSource === 'Other' && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Specify Reference Details *
                </label>
                <input
                  type="text"
                  value={otherReferenceDetails}
                  onChange={(e) => setOtherReferenceDetails(e.target.value)}
                  required
                  placeholder="e.g. Reference by Mr. Rajesh (Ex-GACL)"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* PART 2: TECHNICAL ASSETS & PRODUCTS MATRIX */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Layers className="w-4 h-4 text-cyan-800" />
            <span>Part 2: Plant Assets, Acid Specs & Products Matrix</span>
          </h3>

          {/* Equipment Availability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase">
                A. Equipment Availability (Up to 20 Equipment Items)
              </span>
              {equipments.length < 20 && (
                <button
                  type="button"
                  onClick={handleAddEquipment}
                  className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Equipment</span>
                </button>
              )}
            </div>

            {equipments.map((eq, idx) => (
              <div key={eq.id} className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <select
                  value={eq.equipmentName}
                  onChange={(e) => {
                    const updated = [...equipments];
                    updated[idx].equipmentName = e.target.value;
                    setEquipments(updated);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm flex-1"
                >
                  <option value="Furnace">Furnace</option>
                  <option value="Galvanizing Line">Galvanizing Line</option>
                  <option value="Acid Tank">Acid Tank</option>
                  <option value="Pickling Tank">Pickling Tank</option>
                  <option value="Chimney">Chimney</option>
                  <option value="Duct">Duct</option>
                  <option value="Industrial Floor">Industrial Floor</option>
                </select>
                <span className="text-xs font-bold text-slate-600">Qty:</span>
                <select
                  value={eq.quantity}
                  onChange={(e) => {
                    const updated = [...equipments];
                    updated[idx].quantity = parseInt(e.target.value);
                    setEquipments(updated);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm w-20"
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setEquipments(equipments.filter((_, i) => i !== idx))}
                  className="text-rose-600 hover:text-rose-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Type of Acid Used */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase">
                B. Type of Acid Used (Up to 5 Entries)
              </span>
              {acidSpecs.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddAcid}
                  className="px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Acid Record</span>
                </button>
              )}
            </div>

            {acidSpecs.map((ac, idx) => (
              <div key={ac.id} className="p-2.5 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-3">
                  <select
                    value={ac.acidName}
                    onChange={(e) => {
                      const updated = [...acidSpecs];
                      updated[idx].acidName = e.target.value;
                      setAcidSpecs(updated);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-rose-900"
                  >
                    <option value="HCl">HCl (Hydrochloric Acid)</option>
                    <option value="H2SO4">H2SO4 (Sulphuric Acid)</option>
                    <option value="HNO3">HNO3 (Nitric Acid)</option>
                    <option value="Other">Other Acid</option>
                  </select>
                  <input
                    type="text"
                    value={ac.remarks}
                    onChange={(e) => {
                      const updated = [...acidSpecs];
                      updated[idx].remarks = e.target.value;
                      setAcidSpecs(updated);
                    }}
                    placeholder="Concentration, temperature or tank notes..."
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setAcidSpecs(acidSpecs.filter((_, i) => i !== idx))}
                    className="text-rose-600 hover:text-rose-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <textarea
              value={acidSectionRemarks}
              onChange={(e) => setAcidSectionRemarks(e.target.value)}
              placeholder="Overall Acid Handling & Containment Remarks..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          {/* Products Interested In Matrix */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              C. Products Interested In (Checkbox Matrix)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Refractory Insulation */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-cyan-950 block border-b pb-1">Refractory Insulation</span>
                {[
                  ['ceramicFiberBlankets', 'Ceramic Fiber Blankets'],
                  ['ceramicFiberPaper', 'Ceramic Fiber Paper'],
                  ['ceramicFiberBoards', 'Ceramic Fiber Boards'],
                  ['ceramicFiberModules', 'Ceramic Fiber Modules'],
                  ['others', 'Others']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(productsMatrix.refractoryInsulation as any)[key]}
                      onChange={(e) => setProductsMatrix({
                        ...productsMatrix,
                        refractoryInsulation: {
                          ...productsMatrix.refractoryInsulation,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded text-cyan-800"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Refractory Bricks */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-cyan-950 block border-b pb-1">Refractory Bricks</span>
                {[
                  ['highAluminaBricks', 'High Alumina Bricks'],
                  ['insulationBricks', 'Insulation Bricks'],
                  ['fireBricks', 'Fire Bricks'],
                  ['magnesiaBricks', 'Magnesia Bricks'],
                  ['magnesiteBricks', 'Magnesite Bricks'],
                  ['others', 'Others']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(productsMatrix.refractoryBricks as any)[key]}
                      onChange={(e) => setProductsMatrix({
                        ...productsMatrix,
                        refractoryBricks: {
                          ...productsMatrix.refractoryBricks,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded text-cyan-800"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Refractory Materials */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-cyan-950 block border-b pb-1">Refractory Materials</span>
                {[
                  ['mortars', 'Mortars'],
                  ['anchors', 'Anchors'],
                  ['fireclay', 'Fireclay'],
                  ['asbestosMillBoard', 'Asbestos Mill Board'],
                  ['others', 'Others']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(productsMatrix.refractoryMaterials as any)[key]}
                      onChange={(e) => setProductsMatrix({
                        ...productsMatrix,
                        refractoryMaterials: {
                          ...productsMatrix.refractoryMaterials,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded text-cyan-800"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Acid Resistant Materials */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-cyan-950 block border-b pb-1">Acid Resistant Materials</span>
                {[
                  ['arBrick', 'AR Brick'],
                  ['arTile', 'AR Tile'],
                  ['arMortar', 'AR Mortar'],
                  ['arEpoxyFloor', 'AR Epoxy Floor'],
                  ['arEpoxyPaint', 'AR Epoxy Paint'],
                  ['others', 'Others']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(productsMatrix.acidResistantMaterials as any)[key]}
                      onChange={(e) => setProductsMatrix({
                        ...productsMatrix,
                        acidResistantMaterials: {
                          ...productsMatrix.acidResistantMaterials,
                          [key]: e.target.checked
                        }
                      })}
                      className="rounded text-cyan-800"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OTHERS (Remarks / Specific Product Name)
              </label>
              <input
                type="text"
                value={productsMatrix.othersRemarks}
                onChange={(e) => setProductsMatrix({ ...productsMatrix, othersRemarks: e.target.value })}
                placeholder="Specific custom products or specs..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* PART 3: RELATIONSHIP TYPE & FINANCIAL DOCUMENTS */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
            <FileText className="w-4 h-4 text-cyan-800" />
            <span>Part 3: Financial Documents & Relationship Type</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Relationship Type *
              </label>
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
              >
                <option value="Client/Customer">Client / Customer</option>
                <option value="Vendor/Supplier">Vendor / Supplier</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Vendor = Blue Theme | Prospect Client (No Docs) = Yellow Theme | Active Customer (Has Docs) = Green Theme
              </p>
            </div>
          </div>

          {/* Financial Documents Array */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase">
                Financial Document Uploads (PO / PI / Invoice)
              </span>
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-3 py-1 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Attach Document</span>
              </button>
            </div>

            {financialDocuments.map((doc, idx) => (
              <div key={doc.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-2 relative">
                <select
                  value={doc.documentType}
                  onChange={(e) => {
                    const updated = [...financialDocuments];
                    updated[idx].documentType = e.target.value as DocumentType;
                    setFinancialDocuments(updated);
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm font-bold"
                >
                  <option value="PO">PO (Purchase Order)</option>
                  <option value="PI">PI (Proforma Invoice)</option>
                  <option value="Invoice">Invoice</option>
                </select>

                <input
                  type="text"
                  value={doc.documentNumber}
                  onChange={(e) => {
                    const updated = [...financialDocuments];
                    updated[idx].documentNumber = e.target.value;
                    setFinancialDocuments(updated);
                  }}
                  placeholder="Doc / PO Number"
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm"
                />

                <input
                  type="date"
                  value={doc.documentDate}
                  onChange={(e) => {
                    const updated = [...financialDocuments];
                    updated[idx].documentDate = e.target.value;
                    setFinancialDocuments(updated);
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm"
                />

                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold text-emerald-900 flex items-center space-x-1 w-full justify-center">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{doc.fileName ? doc.fileName.substring(0, 12) + '...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(idx, e)}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setFinancialDocuments(financialDocuments.filter((_, i) => i !== idx))}
                    className="text-rose-600 hover:text-rose-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isNameDuplicate}
            className={`px-7 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center space-x-2 uppercase tracking-wide ${
              isNameDuplicate ? 'bg-slate-400 cursor-not-allowed' : 'bg-cyan-900 hover:bg-cyan-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>[ Save & Continue ]</span>
          </button>
        </div>
      </form>
    </div>
  );
};
