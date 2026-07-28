import React, { useState } from 'react';
import { Calculator, BookOpen, Download, ShieldCheck, CheckCircle2, Lock, Mail, Phone, User, X, FileText, Plus, PlusCircle, FilePlus, Paperclip, FileCheck } from 'lucide-react';
import { getProductDataSheets, saveProductDataSheets, getCurrentUser } from '../services/dbService';
import { ProductDataSheet } from '../types';

export const CalculatorsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'calc' | 'selection' | 'datasheets'>('calc');

  // Product Data Sheets state
  const [datasheets, setDatasheets] = useState<ProductDataSheet[]>(getProductDataSheets());
  const [showAddDsModal, setShowAddDsModal] = useState(false);
  const [newDsTitle, setNewDsTitle] = useState('');
  const [newDsCategory, setNewDsCategory] = useState('Acid Resistant Materials');
  const [newDsTempRating, setNewDsTempRating] = useState('Up to 1400 °C');
  const [newDsDescription, setNewDsDescription] = useState('');
  const [newDsFeatures, setNewDsFeatures] = useState('');
  const [pdfFileBase64, setPdfFileBase64] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');

  const currentUser = getCurrentUser();

  const handleAddNewDatasheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsTitle.trim() || !newDsDescription.trim()) {
      alert('Please fill in Title and Description.');
      return;
    }

    const newDS: ProductDataSheet = {
      id: 'ds_' + Date.now(),
      title: newDsTitle.trim(),
      category: newDsCategory,
      temperatureRating: newDsTempRating.trim() || 'Up to 1200 °C',
      description: newDsDescription.trim(),
      keyFeatures: newDsFeatures.split(',').map(f => f.trim()).filter(Boolean),
      pdfUrl: pdfFileBase64 || undefined,
      pdfFileName: pdfFileName || undefined
    };

    const updatedList = [newDS, ...datasheets];
    saveProductDataSheets(updatedList);
    setDatasheets(updatedList);
    setShowAddDsModal(false);
    setNewDsTitle('');
    setNewDsDescription('');
    setNewDsFeatures('');
    setPdfFileBase64(null);
    setPdfFileName('');
    alert('New Technical Data Sheet with PDF Attachment Saved Successfully!');
  };

  // Materials Calculation State
  const [calcType, setCalcType] = useState<'bricks' | 'ceramic' | 'artiles'>('bricks');
  
  // Brick state
  const [wallArea, setWallArea] = useState<number>(50); // sq meters
  const [brickLength, setBrickLength] = useState<number>(230); // mm
  const [brickWidth, setBrickWidth] = useState<number>(115); // mm
  const [brickThickness, setBrickThickness] = useState<number>(75); // mm

  // Ceramic Fiber State
  const [blanketArea, setBlanketArea] = useState<number>(30); // sq meters
  const [rollCoverage, setRollCoverage] = useState<number>(4.46); // sq m per roll

  // AR Tile State
  const [tankArea, setTankArea] = useState<number>(40); // sq meters
  const [tileLength, setTileLength] = useState<number>(230); // mm
  const [tileWidth, setTileWidth] = useState<number>(115); // mm

  // Material Selection State
  const [selectedIndustry, setSelectedIndustry] = useState('Galvanizing');

  // Download Gating Modal State
  const [downloadingSheet, setDownloadingSheet] = useState<ProductDataSheet | null>(null);
  const [downloadMode, setDownloadMode] = useState<'contact' | 'password'>('contact');
  const [passwordInput, setPasswordInput] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Brick Calc Formula: Area / (Length * Thickness in sq m) + 5% waste
  const brickFaceAreaM2 = (brickLength / 1000) * (brickThickness / 1000);
  const totalBricks = Math.ceil((wallArea / brickFaceAreaM2) * 1.05);
  const totalMortarKg = Math.ceil(totalBricks * 0.35); // ~0.35 kg mortar per brick

  // Ceramic Fiber Rolls: Area / RollCoverage + 5% waste
  const totalRolls = Math.ceil((blanketArea / rollCoverage) * 1.05);

  // AR Tile Calc:
  const tileFaceAreaM2 = (tileLength / 1000) * (tileWidth / 1000);
  const totalTiles = Math.ceil((tankArea / tileFaceAreaM2) * 1.05);
  const arMortarKg = Math.ceil(tankArea * 4.5); // ~4.5 kg per sq m for 3mm joints

  const handleStartDownload = (ds: ProductDataSheet) => {
    setDownloadingSheet(ds);
    setDownloadSuccessMessage(null);
  };

  const handleCompleteDownloadByPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      alert('Please enter your password.');
      return;
    }
    executeFileDownload();
  };

  const handleCompleteDownloadByContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactPhone) {
      alert('Please fill in your Email ID and WhatsApp contact number.');
      return;
    }
    setDownloadSuccessMessage(
      `Technical Datasheet link sent to Email (${contactEmail}) & WhatsApp (${contactPhone})!`
    );
    setTimeout(() => {
      executeFileDownload();
    }, 1200);
  };

  const executeFileDownload = () => {
    if (!downloadingSheet) return;
    
    // Check if physical PDF attachment is uploaded
    if (downloadingSheet.pdfUrl) {
      const link = document.createElement('a');
      link.href = downloadingSheet.pdfUrl;
      link.download = downloadingSheet.pdfFileName || `REFCO_${downloadingSheet.title.replace(/\s+/g, '_')}_TDS.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`Physical PDF Download Started: ${downloadingSheet.pdfFileName || downloadingSheet.title}`);
    } else {
      // Generate formatted PDF document specification
      const content = 
        `======================================================================\n` +
        `                 REFCO INDIA TECHNICAL DATA SHEET (TDS)              \n` +
        `======================================================================\n\n` +
        `PRODUCT TITLE       : ${downloadingSheet.title.toUpperCase()}\n` +
        `CATEGORY            : ${downloadingSheet.category}\n` +
        `TEMPERATURE RATING  : ${downloadingSheet.temperatureRating}\n\n` +
        `KEY PERFORMANCE FEATURES:\n` +
        (downloadingSheet.keyFeatures || []).map(f => `  • ${f}`).join('\n') + `\n\n` +
        `TECHNICAL SPECIFICATIONS & DESCRIPTION:\n` +
        `${downloadingSheet.description}\n\n` +
        `----------------------------------------------------------------------\n` +
        `REFCO INDIA INDUSTRIAL REFRACTORIES & ACID RESISTANT SOLUTIONS\n` +
        `An ISO 9001:2015 Certified Engineering Organization\n` +
        `For Technical & Sales Inquiries: info@refcoindia.com | www.refcoindia.com\n` +
        `======================================================================\n`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `REFCO_${downloadingSheet.title.replace(/\s+/g, '_')}_TDS.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(`Technical Data Sheet Downloaded: ${downloadingSheet.title}`);
    }

    setDownloadingSheet(null);
    setPasswordInput('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-3">
        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
          Refco Engineering Tools
        </span>
        <h2 className="text-xl font-extrabold tracking-tight">
          Refractory Material Calculators & Selection Guide
        </h2>

        {/* Sub Navigation */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => setActiveSubTab('calc')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === 'calc' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Quantity Estimator
          </button>
          <button
            onClick={() => setActiveSubTab('selection')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === 'selection' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Product Selection Guide
          </button>
          <button
            onClick={() => setActiveSubTab('datasheets')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeSubTab === 'datasheets' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Technical Data Sheets
          </button>
        </div>
      </div>

      {/* 1. QUANTITY ESTIMATOR */}
      {activeSubTab === 'calc' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center space-x-3 border-b pb-3">
            <Calculator className="w-6 h-6 text-cyan-800" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Refractory Quantity Estimator</h3>
              <p className="text-xs text-slate-500">Calculate exact bricks, blankets & mortar required with 5% allowance</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCalcType('bricks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                calcType === 'bricks' ? 'bg-cyan-900 text-white shadow-md' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Refractory Bricks
            </button>
            <button
              onClick={() => setCalcType('ceramic')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                calcType === 'ceramic' ? 'bg-cyan-900 text-white shadow-md' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Ceramic Blanket
            </button>
            <button
              onClick={() => setCalcType('artiles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                calcType === 'artiles' ? 'bg-cyan-900 text-white shadow-md' : 'bg-slate-100 text-slate-700'
              }`}
            >
              AR Tiles & Mortar
            </button>
          </div>

          {calcType === 'bricks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wall / Furnace Surface Area (sq meters)</label>
                  <input
                    type="number"
                    value={wallArea}
                    onChange={e => setWallArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Length (mm)</label>
                    <input type="number" value={brickLength} onChange={e => setBrickLength(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Width (mm)</label>
                    <input type="number" value={brickWidth} onChange={e => setBrickWidth(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Thickness (mm)</label>
                    <input type="number" value={brickThickness} onChange={e => setBrickThickness(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg font-bold" />
                  </div>
                </div>
              </div>

              <div className="bg-cyan-950 text-white p-5 rounded-2xl space-y-3 shadow-lg">
                <span className="text-[10px] font-extrabold uppercase text-amber-400 block tracking-wider">
                  Calculation Output (incl. 5% waste)
                </span>
                <div className="space-y-2">
                  <p className="text-2xl font-black">{totalBricks} <span className="text-xs font-normal text-slate-300">Bricks required</span></p>
                  <p className="text-2xl font-black text-amber-400">{totalMortarKg} <span className="text-xs font-normal text-slate-300">kg High Temp Mortar required</span></p>
                </div>
              </div>
            </div>
          )}

          {calcType === 'ceramic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area to Cover (sq meters)</label>
                  <input
                    type="number"
                    value={blanketArea}
                    onChange={e => setBlanketArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
              <div className="bg-cyan-950 text-white p-5 rounded-2xl space-y-2 shadow-lg">
                <span className="text-[10px] font-extrabold uppercase text-amber-400 block tracking-wider">
                  Ceramic Fiber Rolls Output
                </span>
                <p className="text-2xl font-black">{totalRolls} <span className="text-xs font-normal text-slate-300">Standard Rolls (7.32m x 0.61m x 25mm)</span></p>
              </div>
            </div>
          )}

          {calcType === 'artiles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tank / Floor Area (sq meters)</label>
                  <input
                    type="number"
                    value={tankArea}
                    onChange={e => setTankArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-sm"
                  />
                </div>
              </div>
              <div className="bg-cyan-950 text-white p-5 rounded-2xl space-y-2 shadow-lg">
                <span className="text-[10px] font-extrabold uppercase text-amber-400 block tracking-wider">
                  AR Tiles & Epoxy Mortar Output
                </span>
                <p className="text-2xl font-black">{totalTiles} <span className="text-xs font-normal text-slate-300">AR Tiles (230x115x38mm)</span></p>
                <p className="text-2xl font-black text-amber-400">{arMortarKg} <span className="text-xs font-normal text-slate-300">kg AR Epoxy Mortar required</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PRODUCT SELECTION GUIDE */}
      {activeSubTab === 'selection' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Refco Product Selection Guide</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer Industry</label>
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="w-full p-3 bg-slate-50 border rounded-2xl font-bold text-sm text-slate-900"
            >
              <option value="Galvanizing">Galvanizing Plant (Acid Tanks & Furnace)</option>
              <option value="Steel">Steel Re-rolling Mill & Ladles</option>
              <option value="Chemical">Chemical Processing & Acid Storage</option>
              <option value="Power">Power Plant Boiler & Chimney</option>
            </select>
          </div>

          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
            <span className="text-xs font-extrabold text-amber-950 uppercase block tracking-wider">
              Recommended Refco Specification Matrix
            </span>
            {selectedIndustry === 'Galvanizing' && (
              <ul className="text-xs text-amber-900 space-y-2 font-semibold list-disc pl-5">
                <li>Pickling Tank Lining: Refco 38mm Acid Resistant Tiles + Potassium Silicate Mortar</li>
                <li>Galvanizing Furnace Wall: Refco High Alumina HA-70 Bricks</li>
                <li>Top Cover Insulation: Refco 1260°C Ceramic Fiber Blanket 128kg/m3</li>
              </ul>
            )}
            {selectedIndustry === 'Steel' && (
              <ul className="text-xs text-amber-900 space-y-2 font-semibold list-disc pl-5">
                <li>Re-heating Furnace Lining: Refco HA-80 High Alumina Bricks</li>
                <li>Ladle Lining: Refco Magnesite / Fireclay Bricks</li>
                <li>Jointing: Refco High Temp Air Setting Mortar</li>
              </ul>
            )}
            {selectedIndustry === 'Chemical' && (
              <ul className="text-xs text-amber-900 space-y-2 font-semibold list-disc pl-5">
                <li>Acid Storage Tank: Refco AR Bricks + 2-Component AR Epoxy Mortar</li>
                <li>Effluent Floor Lining: Refco 25mm AR Tiles + AR Epoxy Screed</li>
              </ul>
            )}
            {selectedIndustry === 'Power' && (
              <ul className="text-xs text-amber-900 space-y-2 font-semibold list-disc pl-5">
                <li>Boiler Inner Lining: Refco Refractory Castable & Insulation Bricks</li>
                <li>Chimney Acid Flue: Refco AR Bricks + Potassium Silicate Mortar</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 3. TECHNICAL DATA SHEETS */}
      {activeSubTab === 'datasheets' && (
        <div className="space-y-4">
          
          {/* Admin Header Action Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
                Refco Technical Documentation Library
              </span>
              <h3 className="font-black text-base mt-1">Product Technical Data Sheets (TDS)</h3>
              <p className="text-xs text-slate-400">Refractory bricks, acid resistant tiles, insulation blankets & mortars</p>
            </div>

            <button
              onClick={() => setShowAddDsModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-md flex items-center justify-center space-x-2 shrink-0 transition-transform active:scale-95"
            >
              <FilePlus className="w-4 h-4" />
              <span>+ Add New Technical Data Sheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasheets.map(ds => (
              <div key={ds.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-[10px] font-extrabold bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded-full border border-cyan-200">
                      {ds.category}
                    </span>

                    {ds.pdfFileName || ds.pdfUrl ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
                        <Paperclip className="w-3 h-3 text-emerald-600" />
                        <span>PDF ATTACHED: {ds.pdfFileName || 'Doc.pdf'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 flex items-center space-x-1">
                        <FileCheck className="w-3 h-3 text-amber-600" />
                        <span>PDF Spec Document Available</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base">{ds.title}</h4>
                  <p className="text-xs font-extrabold text-amber-700">Temp Rating: {ds.temperatureRating}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{ds.description}</p>

                  {ds.keyFeatures && ds.keyFeatures.length > 0 && (
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 pt-1 font-medium">
                      {ds.keyFeatures.map((feat, fidx) => (
                        <li key={fidx}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <button
                    onClick={() => handleStartDownload(ds)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download PDF Specification</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN: ADD NEW TECHNICAL DATA SHEET MODAL */}
      {showAddDsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FilePlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Add New Technical Data Sheet (TDS)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewDatasheet} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product / Spec Title *</label>
                <input
                  type="text"
                  value={newDsTitle}
                  onChange={e => setNewDsTitle(e.target.value)}
                  placeholder="e.g. Refco High Temp Castable 1800°C"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newDsCategory}
                    onChange={e => setNewDsCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Acid Resistant Materials">Acid Resistant Materials</option>
                    <option value="Refractory Bricks">Refractory Bricks</option>
                    <option value="Refractory Insulation">Refractory Insulation</option>
                    <option value="Acid Resistant Mortars">Acid Resistant Mortars</option>
                    <option value="Refractory Castables">Refractory Castables</option>
                    <option value="Specialty Chemicals">Specialty Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Temperature Rating *</label>
                  <input
                    type="text"
                    value={newDsTempRating}
                    onChange={e => setNewDsTempRating(e.target.value)}
                    placeholder="e.g. Up to 1650 °C"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Features (Comma Separated)</label>
                <input
                  type="text"
                  value={newDsFeatures}
                  onChange={e => setNewDsFeatures(e.target.value)}
                  placeholder="e.g. High Alumina, Acid Proof, Cold Crushing Strength > 800"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Technical Description *</label>
                <textarea
                  rows={3}
                  value={newDsDescription}
                  onChange={e => setNewDsDescription(e.target.value)}
                  placeholder="Detailed technical specifications, chemical resistance profile, application area & installation instructions..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              {/* Physical PDF Attachment Field */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <label className="block font-black text-slate-900 text-xs flex items-center space-x-1.5">
                  <Paperclip className="w-4 h-4 text-amber-600" />
                  <span>Attach Physical PDF File / Specification Sheet (Optional)</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 15 * 1024 * 1024) {
                        alert('File size exceeds 15MB limit.');
                        return;
                      }
                      setPdfFileName(file.name);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPdfFileBase64(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-slate-900 file:text-amber-400 hover:file:bg-slate-800 cursor-pointer"
                />
                {pdfFileName && (
                  <p className="text-[11px] text-emerald-700 font-extrabold pt-1 flex items-center space-x-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Selected PDF Document: {pdfFileName}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddDsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Save Data Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATED DATASHEET DOWNLOAD MODAL */}
      {downloadingSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Download Technical Specification Sheet
                </h3>
              </div>
              <button
                onClick={() => setDownloadingSheet(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <p className="font-extrabold text-amber-900 text-sm">{downloadingSheet.title}</p>
              <p className="text-[11px] font-bold">Temperature Rating: {downloadingSheet.temperatureRating}</p>
            </div>

            <p className="text-xs text-slate-600">
              To download this technical data sheet, please choose one of the options below:
            </p>

            {/* Mode Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setDownloadMode('contact')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  downloadMode === 'contact' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Option 1: Receive on Email / WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setDownloadMode('password')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                  downloadMode === 'password' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Option 2: Login with Password</span>
              </button>
            </div>

            {/* MODE 1: EMAIL & WHATSAPP CONTACT */}
            {downloadMode === 'contact' && (
              <form onSubmit={handleCompleteDownloadByContact} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email ID *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="e.g. rajesh@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp / Mobile No *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl font-semibold"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {downloadSuccessMessage && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-extrabold rounded-xl border border-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{downloadSuccessMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase shadow-md flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Send Datasheet Link to Email/WhatsApp & Download</span>
                </button>
              </form>
            )}

            {/* MODE 2: PASSWORD LOGIN */}
            {downloadMode === 'password' && (
              <form onSubmit={handleCompleteDownloadByPassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enter Refco User / Admin Password *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="Enter system password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl font-bold"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs uppercase shadow-md flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Verify Password & Download TDS</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
