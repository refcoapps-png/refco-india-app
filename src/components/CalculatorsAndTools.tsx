import React, { useState } from 'react';
import { Calculator, FileText, Truck, DollarSign, BookOpen, CheckCircle2, Download, Plus } from 'lucide-react';
import { REFCO_PRODUCT_DATASHEETS, getExpenses, saveExpenses, getMaterialVouchers, saveMaterialVouchers } from '../services/dbService';
import { ExpenseVoucher, MaterialVoucher } from '../types';

export const CalculatorsAndTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calc' | 'selection' | 'loading' | 'expenses' | 'datasheets'>('calc');

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

  // Expenses State
  const [expenseCategory, setExpenseCategory] = useState<'Travel' | 'Food' | 'Client Meeting' | 'Lodging' | 'Material Purchase' | 'Misc'>('Travel');
  const [expenseAmount, setExpenseAmount] = useState<number>(1500);
  const [expenseRemarks, setExpenseRemarks] = useState('');
  const expenses = getExpenses();

  // Loading Voucher State
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [voucherType, setVoucherType] = useState<'Loading' | 'Unloading'>('Loading');
  const materialVouchers = getMaterialVouchers();

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

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: ExpenseVoucher = {
      id: 'exp_' + Date.now(),
      voucherNo: 'EXP/' + Date.now().toString().slice(-6),
      date: new Date().toISOString().split('T')[0],
      submittedBy: 'Sales Executive',
      items: [{
        id: 'item_1',
        category: expenseCategory,
        amount: expenseAmount,
        remarks: expenseRemarks
      }],
      totalAmount: expenseAmount,
      category: expenseCategory,
      amount: expenseAmount,
      remarks: expenseRemarks,
      status: 'Pending'
    };
    saveExpenses([newExpense, ...expenses]);
    setExpenseRemarks('');
    alert('Expense Voucher Submitted Successfully!');
  };

  const handleSaveMaterialVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const newVoucher: MaterialVoucher = {
      id: 'mv_' + Date.now(),
      voucherNo: (voucherType === 'Loading' ? 'LV/' : 'UV/') + Date.now().toString().slice(-6),
      type: voucherType,
      date: new Date().toISOString().split('T')[0],
      vehicleNo,
      transporterName: transporter,
      items: [{ id: 'mitem_1', description: 'Refco Refractory Bricks / Tiles', quantity: '5000', unit: 'Pcs' }],
      handledBy: 'Supervisor',
      paidBy: 'Refco India',
      driverName: 'Driver',
      remarks: 'Gate Pass verified'
    };
    saveMaterialVouchers([newVoucher, ...materialVouchers]);
    setVehicleNo('');
    setTransporter('');
    alert('Material Voucher Generated Successfully!');
  };

  return (
    <div className="space-y-6 mb-12">
      
      {/* Module Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-3">
        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
          Refco Engineering Suite
        </span>
        <h2 className="text-xl font-extrabold tracking-tight">
          Material Calculators, Selection & Vouchers
        </h2>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('calc')}
            className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'calc' ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white'
            }`}
          >
            Material Calc
          </button>
          <button
            onClick={() => setActiveTab('selection')}
            className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'selection' ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white'
            }`}
          >
            Selection Guide
          </button>
          <button
            onClick={() => setActiveTab('loading')}
            className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'loading' ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white'
            }`}
          >
            Loading Voucher
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'expenses' ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white'
            }`}
          >
            Expenses Voucher
          </button>
          <button
            onClick={() => setActiveTab('datasheets')}
            className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition-all col-span-2 sm:col-span-1 ${
              activeTab === 'datasheets' ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-white'
            }`}
          >
            Data Sheets
          </button>
        </div>
      </div>

      {/* 1. MATERIAL CALCULATORS */}
      {activeTab === 'calc' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="flex items-center space-x-3 border-b pb-3">
            <Calculator className="w-6 h-6 text-cyan-800" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Refractory Quantity Estimator</h3>
              <p className="text-xs text-slate-500">Calculate exact bricks, blankets & mortar required</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCalcType('bricks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                calcType === 'bricks' ? 'bg-cyan-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Refractory Bricks
            </button>
            <button
              onClick={() => setCalcType('ceramic')}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                calcType === 'ceramic' ? 'bg-cyan-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              Ceramic Blanket
            </button>
            <button
              onClick={() => setCalcType('artiles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                calcType === 'artiles' ? 'bg-cyan-900 text-white' : 'bg-slate-100 text-slate-700'
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
                  <input type="number" value={wallArea} onChange={e => setWallArea(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Length (mm)</label>
                    <input type="number" value={brickLength} onChange={e => setBrickLength(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Width (mm)</label>
                    <input type="number" value={brickWidth} onChange={e => setBrickWidth(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Thickness (mm)</label>
                    <input type="number" value={brickThickness} onChange={e => setBrickThickness(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-cyan-950 text-white p-5 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Calculation Output (incl. 5% waste)</span>
                <div className="space-y-2">
                  <p className="text-xl font-black">{totalBricks} <span className="text-xs font-normal text-slate-300">Bricks required</span></p>
                  <p className="text-xl font-black text-amber-400">{totalMortarKg} <span className="text-xs font-normal text-slate-300">kg High Temp Mortar required</span></p>
                </div>
              </div>
            </div>
          )}

          {calcType === 'ceramic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area to Cover (sq meters)</label>
                  <input type="number" value={blanketArea} onChange={e => setBlanketArea(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" />
                </div>
              </div>
              <div className="bg-cyan-950 text-white p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Ceramic Fiber Rolls Output</span>
                <p className="text-2xl font-black">{totalRolls} <span className="text-xs font-normal text-slate-300">Standard Rolls (7.32m x 0.61m x 25mm)</span></p>
              </div>
            </div>
          )}

          {calcType === 'artiles' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tank / Floor Area (sq meters)</label>
                  <input type="number" value={tankArea} onChange={e => setTankArea(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" />
                </div>
              </div>
              <div className="bg-cyan-950 text-white p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">AR Tiles & Epoxy Mortar Output</span>
                <p className="text-xl font-black">{totalTiles} <span className="text-xs font-normal text-slate-300">AR Tiles (230x115x38mm)</span></p>
                <p className="text-xl font-black text-amber-400">{arMortarKg} <span className="text-xs font-normal text-slate-300">kg AR Epoxy Mortar required</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MATERIALS SELECTION GUIDE */}
      {activeTab === 'selection' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Refco Product Selection Guide</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer Industry</label>
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              className="w-full p-3 bg-slate-50 border rounded-2xl font-bold text-sm"
            >
              <option value="Galvanizing">Galvanizing Plant (Acid Tanks & Furnace)</option>
              <option value="Steel">Steel Re-rolling Mill & Ladles</option>
              <option value="Chemical">Chemical Processing & Acid Storage</option>
              <option value="Power">Power Plant Boiler & Chimney</option>
            </select>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <span className="text-xs font-extrabold text-amber-950 uppercase block">Recommended Refco Specification</span>
            {selectedIndustry === 'Galvanizing' && (
              <ul className="text-xs text-amber-900 space-y-1 font-semibold list-disc pl-4">
                <li>Pickling Tank Lining: Refco 38mm Acid Resistant Tiles + Potassium Silicate Mortar</li>
                <li>Galvanizing Furnace Wall: Refco High Alumina HA-70 Bricks</li>
                <li>Top Cover Insulation: Refco 1260°C Ceramic Fiber Blanket 128kg/m3</li>
              </ul>
            )}
            {selectedIndustry === 'Steel' && (
              <ul className="text-xs text-amber-900 space-y-1 font-semibold list-disc pl-4">
                <li>Re-heating Furnace Lining: Refco HA-80 High Alumina Bricks</li>
                <li>Ladle Lining: Refco Magnesite / Fireclay Bricks</li>
                <li>Jointing: Refco High Temp Air Setting Mortar</li>
              </ul>
            )}
            {selectedIndustry === 'Chemical' && (
              <ul className="text-xs text-amber-900 space-y-1 font-semibold list-disc pl-4">
                <li>Acid Storage Tank: Refco AR Bricks + 2-Component AR Epoxy Mortar</li>
                <li>Effluent Floor Lining: Refco 25mm AR Tiles + AR Epoxy Screed</li>
              </ul>
            )}
            {selectedIndustry === 'Power' && (
              <ul className="text-xs text-amber-900 space-y-1 font-semibold list-disc pl-4">
                <li>Boiler Inner Lining: Refco Refractory Castable & Insulation Bricks</li>
                <li>Chimney Acid Flue: Refco AR Bricks + Potassium Silicate Mortar</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 3. LOADING / UNLOADING VOUCHER */}
      {activeTab === 'loading' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Loading / Unloading Voucher Generator</h3>
          <form onSubmit={handleSaveMaterialVoucher} className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Voucher Type</label>
                <select value={voucherType} onChange={e => setVoucherType(e.target.value as any)} className="w-full p-2 bg-slate-50 border rounded-xl">
                  <option value="Loading">Loading Voucher</option>
                  <option value="Unloading">Unloading Voucher</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Vehicle No *</label>
                <input type="text" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} required placeholder="GJ-01-XX-1234" className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Transporter Name *</label>
              <input type="text" value={transporter} onChange={e => setTransporter(e.target.value)} required placeholder="Shree Ram Logistics" className="w-full p-2 bg-slate-50 border rounded-xl text-xs" />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-cyan-900 text-white font-bold rounded-xl text-xs uppercase">
              Generate Material Voucher
            </button>
          </form>
        </div>
      )}

      {/* 4. EXPENSE VOUCHER */}
      {activeTab === 'expenses' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Sales Expense Voucher</h3>
          <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Category</label>
                <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value as any)} className="w-full p-2 bg-slate-50 border rounded-xl">
                  <option value="Travel">Travel</option>
                  <option value="Food">Food</option>
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="Lodging">Lodging</option>
                  <option value="Material Purchase">Material Purchase</option>
                  <option value="Misc">Misc</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Amount (₹) *</label>
                <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(Number(e.target.value))} required className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-1">Remarks / Client Visited</label>
              <input type="text" value={expenseRemarks} onChange={e => setExpenseRemarks(e.target.value)} placeholder="e.g. Travel to Vatva for GACL meeting..." className="w-full p-2 bg-slate-50 border rounded-xl" />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl uppercase">
              Submit Expense Voucher
            </button>
          </form>
        </div>
      )}

      {/* 5. PRODUCT DATA SHEETS */}
      {activeTab === 'datasheets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REFCO_PRODUCT_DATASHEETS.map(ds => (
            <div key={ds.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-2">
              <span className="text-[10px] font-bold bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded">{ds.category}</span>
              <h4 className="font-black text-slate-900 text-sm">{ds.title}</h4>
              <p className="text-xs font-bold text-amber-700">Temp Rating: {ds.temperatureRating}</p>
              <p className="text-xs text-slate-600">{ds.description}</p>
              <div className="pt-2">
                <button
                  onClick={() => alert(`Downloading Technical Spec Data Sheet: ${ds.title}`)}
                  className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Spec Sheet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
