import React, { useState } from 'react';
import {
  FileText, Truck, DollarSign, Plus, Trash2, Upload, Image as ImageIcon, CheckCircle2, UserCheck, ShieldCheck, UserPlus
} from 'lucide-react';
import {
  getExpenses, saveExpenses, getMaterialVouchers, saveMaterialVouchers, getCompanies, getVisits,
  getMasterStaffNames, addMasterStaffName
} from '../services/dbService';
import { ExpenseVoucher, MaterialVoucher, ExpenseItem, MaterialVoucherItem } from '../types';

export const VouchersTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'material' | 'expenses'>('material');

  const companies = getCompanies();
  const visits = getVisits();

  // Master Staff Names for Dropdowns
  const [masterStaff, setMasterStaff] = useState<string[]>(getMasterStaffNames());
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffNameInput, setNewStaffNameInput] = useState('');

  const handleAddNewMasterStaff = () => {
    if (!newStaffNameInput.trim()) return;
    const updated = addMasterStaffName(newStaffNameInput.trim());
    setMasterStaff(updated);
    setHandledBySelect(newStaffNameInput.trim());
    setNewStaffNameInput('');
    setShowAddStaffModal(false);
    alert(`Name "${newStaffNameInput.trim()}" added to Master Dropdown Entries!`);
  };

  // -------------------------------------------------------------
  // 1. MATERIAL VOUCHERS STATE (LOADING / UNLOADING)
  // -------------------------------------------------------------
  const [voucherType, setVoucherType] = useState<'Loading' | 'Unloading'>('Loading');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transporter, setTransporter] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  
  // Handled By Dropdown State
  const [handledBySelect, setHandledBySelect] = useState('Sandeep');
  const [customHandledBy, setCustomHandledBy] = useState('');
  
  // Paid By Dropdown State
  const [paidBySelect, setPaidBySelect] = useState<string>('Refco India');
  const [customPaidBy, setCustomPaidBy] = useState('');

  // Line Items (up to 20 items with price and total price)
  const [materialItems, setMaterialItems] = useState<MaterialVoucherItem[]>([
    { id: 'mitem_1', description: 'Refco Acid Resistant Tiles (230x115x38mm)', quantity: '1000', unit: 'Pcs', price: 85, totalPrice: 85000 },
    { id: 'mitem_2', description: 'Refco Potassium Silicate AR Mortar', quantity: '500', unit: 'Kg', price: 42, totalPrice: 21000 }
  ]);

  const materialVouchers = getMaterialVouchers();

  const handleAddMaterialLine = () => {
    if (materialItems.length >= 20) {
      alert('Maximum 20 line items allowed per voucher.');
      return;
    }
    setMaterialItems([
      ...materialItems,
      { id: 'mitem_' + Date.now(), description: '', quantity: '1', unit: 'Pcs', price: 0, totalPrice: 0 }
    ]);
  };

  const handleRemoveMaterialLine = (id: string) => {
    if (materialItems.length <= 1) {
      alert('At least 1 line item is required.');
      return;
    }
    setMaterialItems(materialItems.filter(item => item.id !== id));
  };

  const handleUpdateMaterialLine = (id: string, field: keyof MaterialVoucherItem, value: any) => {
    setMaterialItems(materialItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate totalPrice if quantity or price changed
        const qtyNum = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
        const priceNum = parseFloat(field === 'price' ? value : String(updated.price || 0)) || 0;
        updated.totalPrice = Math.round(qtyNum * priceNum * 100) / 100;
        return updated;
      }
      return item;
    }));
  };

  // Calculate Material Items Totals
  const totalMaterialQtySum = materialItems.reduce((acc, item) => {
    const num = parseFloat(item.quantity);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const totalMaterialPriceSum = materialItems.reduce((acc, item) => {
    const total = item.totalPrice || ((parseFloat(item.quantity) || 0) * (item.price || 0));
    return acc + (isNaN(total) ? 0 : total);
  }, 0);

  const handleSaveMaterialVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo || !transporter) {
      alert('Please fill in Vehicle Number and Transporter Name.');
      return;
    }

    const finalHandledBy = handledBySelect === '+ Add Custom Name' ? customHandledBy : handledBySelect;
    const finalPaidBy = paidBySelect === 'Others' ? customPaidBy : paidBySelect;

    const newVoucher: MaterialVoucher = {
      id: 'mv_' + Date.now(),
      voucherNo: (voucherType === 'Loading' ? 'LV/' : 'UV/') + Date.now().toString().slice(-6),
      type: voucherType,
      date: new Date().toISOString().split('T')[0],
      vehicleNo,
      transporterName: transporter,
      driverName: driverName || 'Driver',
      driverMobile: driverMobile || '',
      handledBy: finalHandledBy || 'Supervisor',
      paidBy: finalPaidBy || 'Refco India',
      items: materialItems,
      totalQuantitySummary: `${totalMaterialQtySum} (${materialItems.length} items)`,
      totalItemCount: materialItems.length,
      totalQuantity: totalMaterialQtySum,
      totalPrice: totalMaterialPriceSum,
      remarks: 'Gate Pass verified & dispatched'
    };

    saveMaterialVouchers([newVoucher, ...materialVouchers]);
    setVehicleNo('');
    setTransporter('');
    setDriverName('');
    setDriverMobile('');
    alert('Material Gate Pass Voucher Generated Successfully!');
  };


  // -------------------------------------------------------------
  // 2. SALES EXPENSE VOUCHER STATE
  // -------------------------------------------------------------
  const [salespersonName, setSalespersonName] = useState('Ajay Patel');
  const [salespersonMobile, setSalespersonMobile] = useState('9825012345');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState('Surat Hazira Plant Visit - Galvanizing Division');

  // Expense Line Items (Multi-line)
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    {
      id: 'eitem_1',
      category: 'Travel',
      amount: 1200,
      remarks: 'Fuel & Toll tax for Surat plant visit',
      receiptImage: undefined
    },
    {
      id: 'eitem_2',
      category: 'Food',
      amount: 450,
      remarks: 'Lunch during client meeting',
      receiptImage: undefined
    }
  ]);

  const expenses = getExpenses();

  const handleAddExpenseLine = () => {
    setExpenseItems([
      ...expenseItems,
      {
        id: 'eitem_' + Date.now(),
        category: 'Travel',
        amount: 500,
        remarks: '',
        receiptImage: undefined
      }
    ]);
  };

  const handleRemoveExpenseLine = (id: string) => {
    if (expenseItems.length <= 1) {
      alert('At least 1 expense category item is required.');
      return;
    }
    setExpenseItems(expenseItems.filter(item => item.id !== id));
  };

  const handleUpdateExpenseLine = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenseItems(expenseItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateExpenseLine(id, 'receiptImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Total Expenses sum
  const totalExpenseAmount = expenseItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSaveExpenseVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseItems.length === 0) {
      alert('Please add at least one expense line.');
      return;
    }

    const newExpense: ExpenseVoucher = {
      id: 'exp_' + Date.now(),
      voucherNo: 'EXP/' + Date.now().toString().slice(-6),
      date: expenseDate,
      submittedBy: salespersonName,
      salespersonMobile,
      visitDetails: selectedVisitDetails,
      items: expenseItems,
      totalAmount: totalExpenseAmount,
      status: 'Pending'
    };

    saveExpenses([newExpense, ...expenses]);
    alert(`Expense Voucher Submitted Successfully! Total Amount: ₹${totalExpenseAmount.toLocaleString('en-IN')}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-3">
        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
          Refco Operations & Logistics
        </span>
        <h2 className="text-xl font-extrabold tracking-tight">
          Refco Vouchers Hub (Gate Pass & Sales Expenses)
        </h2>

        {/* Sub Tabs */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => setActiveSubTab('material')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'material' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>1. Loading / Unloading Vouchers</span>
          </button>
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'expenses' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>2. Sales Expense Vouchers</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. LOADING / UNLOADING MATERIAL VOUCHERS */}
      {/* ========================================================= */}
      {activeSubTab === 'material' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-cyan-800" />
                <span>Create Material Gate Pass Voucher</span>
              </h3>
              <span className="text-xs font-extrabold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                Outward / Inward Gate Pass
              </span>
            </div>

            <form onSubmit={handleSaveMaterialVoucher} className="space-y-5">
              
              {/* Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Voucher Type *</label>
                  <select
                    value={voucherType}
                    onChange={e => setVoucherType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Loading">Loading Voucher (Outward)</option>
                    <option value="Unloading">Unloading Voucher (Inward)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700">Vehicle No *</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value)}
                    required
                    placeholder="GJ-01-XX-1234"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700">Transporter Name *</label>
                  <input
                    type="text"
                    value={transporter}
                    onChange={e => setTransporter(e.target.value)}
                    required
                    placeholder="e.g. Shree Ram Logistics"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Handled By, Paid By & Driver Details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {/* Handled By Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Handled By *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(true)}
                      className="text-[10px] text-amber-700 font-extrabold hover:underline"
                    >
                      + Add Name
                    </button>
                  </div>
                  <select
                    value={handledBySelect}
                    onChange={e => setHandledBySelect(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {masterStaff.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="+ Add Custom Name">+ Add Custom Name</option>
                  </select>

                  {handledBySelect === '+ Add Custom Name' && (
                    <input
                      type="text"
                      placeholder="Type person name"
                      value={customHandledBy}
                      onChange={e => setCustomHandledBy(e.target.value)}
                      required
                      className="w-full p-2 bg-amber-50 border border-amber-300 rounded-xl mt-1.5 font-bold text-xs"
                    />
                  )}
                </div>

                {/* Paid By Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Paid By *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(true)}
                      className="text-[10px] text-amber-700 font-extrabold hover:underline"
                    >
                      + Add Name
                    </button>
                  </div>
                  <select
                    value={paidBySelect}
                    onChange={e => setPaidBySelect(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {masterStaff.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="Others">Others</option>
                  </select>

                  {paidBySelect === 'Others' && (
                    <input
                      type="text"
                      placeholder="Specify paid by"
                      value={customPaidBy}
                      onChange={e => setCustomPaidBy(e.target.value)}
                      required
                      className="w-full p-2 bg-amber-50 border border-amber-300 rounded-xl mt-1.5 font-bold text-xs"
                    />
                  )}
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Driver Name *</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    required
                    placeholder="e.g. Ramesh Singh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                {/* Driver Mobile */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700">Driver Mobile *</label>
                  <input
                    type="tel"
                    value={driverMobile}
                    onChange={e => setDriverMobile(e.target.value)}
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* LINE ITEM DETAILS (UP TO 20 ITEMS) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-slate-800">
                      Line Item Details (Items: {materialItems.length} / 20)
                    </span>
                    <p className="text-[11px] text-slate-500">Add materials loaded or unloaded into vehicle</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMaterialLine}
                    disabled={materialItems.length >= 20}
                    className="px-3 py-1.5 bg-cyan-900 hover:bg-cyan-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Line Item</span>
                  </button>
                </div>

                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-black uppercase text-slate-500 px-2 py-1 bg-slate-100 rounded-lg">
                  <div className="col-span-1 text-center">S.NO</div>
                  <div className="col-span-4">ITEM</div>
                  <div className="col-span-2 text-center">QTY</div>
                  <div className="col-span-2">UOM</div>
                  <div className="col-span-1 text-right">PRICE (₹)</div>
                  <div className="col-span-1 text-right">TOTAL (₹)</div>
                  <div className="col-span-1 text-center">ACTION</div>
                </div>

                {/* Table of items */}
                <div className="space-y-2">
                  {materialItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      {/* S.NO */}
                      <span className="col-span-1 text-center font-extrabold text-xs text-slate-500">
                        {index + 1}
                      </span>
                      
                      {/* ITEM */}
                      <div className="col-span-11 sm:col-span-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleUpdateMaterialLine(item.id, 'description', e.target.value)}
                          placeholder="Material description (e.g. AR Bricks 38mm)"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                          required
                        />
                      </div>

                      {/* QTY */}
                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleUpdateMaterialLine(item.id, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                          required
                        />
                      </div>

                      {/* UOM */}
                      <div className="col-span-4 sm:col-span-2">
                        <select
                          value={item.unit}
                          onChange={e => handleUpdateMaterialLine(item.id, 'unit', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Bags">Bags</option>
                          <option value="Kg">Kg</option>
                          <option value="Tons">Tons</option>
                          <option value="Boxes">Boxes</option>
                          <option value="Rolls">Rolls</option>
                          <option value="Mtr">Mtr</option>
                          <option value="Ltr">Ltr</option>
                          <option value="Sets">Sets</option>
                          <option value="Nos">Nos</option>
                          <option value="Sqm">Sqm</option>
                        </select>
                      </div>

                      {/* PRICE */}
                      <div className="col-span-4 sm:col-span-1">
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={e => handleUpdateMaterialLine(item.id, 'price', e.target.value)}
                          placeholder="Price"
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-right"
                        />
                      </div>

                      {/* TOTAL PRICE */}
                      <div className="col-span-3 sm:col-span-1 text-right font-black text-xs text-slate-900 pr-1">
                        ₹{item.totalPrice?.toLocaleString('en-IN') || 0}
                      </div>

                      {/* REMOVE */}
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterialLine(item.id)}
                          title="Remove Line Item"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTALS FOOTER SUMMARY BAR */}
                <div className="p-3.5 bg-slate-900 text-white rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-extrabold border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">ITEM TOTAL:</span>
                    <span className="text-white text-sm">{materialItems.length} items</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">QUANTITY TOTAL:</span>
                    <span className="text-amber-400 text-sm">{totalMaterialQtySum.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center space-x-2 sm:justify-end">
                    <span className="text-slate-400">TOTAL PRICE TOTAL:</span>
                    <span className="text-emerald-400 text-base">₹{totalMaterialPriceSum.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs uppercase shadow-lg flex items-center justify-center space-x-2 tracking-wide"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>[ Generate Material Gate Pass Voucher ]</span>
              </button>
            </form>
          </div>

          {/* Vouchers History List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-700">Generated Material Vouchers ({materialVouchers.length})</h4>
            {materialVouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materialVouchers.map(v => (
                  <div key={v.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-black text-cyan-900">{v.voucherNo}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        v.type === 'Loading' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {v.type} Gate Pass
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-700">
                      <p><span className="font-bold">Vehicle:</span> {v.vehicleNo} | <span className="font-bold">Transporter:</span> {v.transporterName}</p>
                      <p><span className="font-bold">Handled By:</span> {v.handledBy} | <span className="font-bold">Paid By:</span> {v.paidBy || 'Refco India'}</p>
                      
                      <div className="bg-slate-50 p-2 rounded-xl text-[11px] space-y-1 font-semibold text-slate-800 mt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Items List ({v.items?.length || 0}):</span>
                        {v.items?.map((it, idx) => (
                          <p key={idx}>• {it.description}: <span className="font-bold text-cyan-900">{it.quantity} {it.unit}</span></p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-6 bg-white rounded-2xl border text-center">No material vouchers recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SALES EXPENSE VOUCHER */}
      {/* ========================================================= */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span>Submit Sales Person Expense Claim Voucher</span>
              </h3>
              <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-200">
                Sales & Field Operations
              </span>
            </div>

            <form onSubmit={handleSaveExpenseVoucher} className="space-y-5">
              
              {/* SALES PERSON DETAILS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-extrabold uppercase text-slate-700 block">
                  1. Sales Person Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700">Sales Person Name *</label>
                    <input
                      type="text"
                      value={salespersonName}
                      onChange={e => setSalespersonName(e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700">Mobile Number *</label>
                    <input
                      type="tel"
                      value={salespersonMobile}
                      onChange={e => setSalespersonMobile(e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700">Expense Date *</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={e => setExpenseDate(e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* VISIT DETAILS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold uppercase text-slate-700 block">
                  2. Visit Details
                </span>

                <div>
                  <label className="block font-bold text-xs text-slate-700 mb-1">Select Client Visit / Company Name *</label>
                  <input
                    type="text"
                    value={selectedVisitDetails}
                    onChange={e => setSelectedVisitDetails(e.target.value)}
                    placeholder="e.g. Surat Hazira Plant Visit - Galvanizing Division"
                    required
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* EXPENSES CATEGORY LIST */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-slate-800 block">
                      3. Expenses Category Breakdown
                    </span>
                    <p className="text-[11px] text-slate-500">Add travel, lodging, food & meeting expenses with bill receipts</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddExpenseLine}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Expense Item</span>
                  </button>
                </div>

                {/* Expense Items Rows */}
                <div className="space-y-3">
                  {expenseItems.map((item, index) => (
                    <div key={item.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-extrabold text-xs text-slate-800">
                          Expense Line #{index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveExpenseLine(item.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center space-x-1 text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                          <select
                            value={item.category}
                            onChange={e => handleUpdateExpenseLine(item.id, 'category', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                          >
                            <option value="Travel">Travel (Fuel, Taxi, Train)</option>
                            <option value="Food">Food & Refreshments</option>
                            <option value="Client Meeting">Client Meeting Expense</option>
                            <option value="Lodging">Hotel / Lodging</option>
                            <option value="Material Purchase">Sample / Material Purchase</option>
                            <option value="Misc">Misc</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={e => handleUpdateExpenseLine(item.id, 'amount', Number(e.target.value))}
                            required
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-extrabold text-sm text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Remarks / Note</label>
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={e => handleUpdateExpenseLine(item.id, 'remarks', e.target.value)}
                            placeholder="Brief description"
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                          />
                        </div>
                      </div>

                      {/* Image Upload for Receipt */}
                      <div className="flex items-center space-x-3 text-xs">
                        <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 border border-slate-300">
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Attach Receipt Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageUpload(item.id, e)}
                            className="hidden"
                          />
                        </label>

                        {item.receiptImage && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={item.receiptImage}
                              alt="Receipt preview"
                              className="w-10 h-10 object-cover rounded-lg border border-emerald-300 shadow-2xs"
                            />
                            <span className="text-[10px] font-bold text-emerald-700">Receipt Attached!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TOTAL EXPENSES BANNER */}
                <div className="p-4 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-between shadow-md">
                  <span className="font-extrabold uppercase text-xs">TOTAL EXPENSES CLAIM AMOUNT:</span>
                  <span className="text-2xl font-black">₹{totalExpenseAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-xs uppercase shadow-xl flex items-center justify-center space-x-2 tracking-wider"
              >
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>[ SUBMIT EXPENSES VOUCHERS ]</span>
              </button>
            </form>
          </div>

          {/* Submitted Expense Vouchers List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-700">Submitted Expense Claims ({expenses.length})</h4>
            {expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.map(e => (
                  <div key={e.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="font-black text-sm text-slate-900">{e.voucherNo}</span>
                        <span className="text-xs font-bold text-slate-500 block">Submitted by: {e.submittedBy} ({e.salespersonMobile || 'N/A'})</span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 block">
                          ₹{(e.totalAmount || e.amount || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-amber-300">
                          {e.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">Visit: {e.visitDetails || 'Client Visit'}</p>

                    {e.items && e.items.length > 0 && (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 font-medium">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Breakdown:</span>
                        {e.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px]">
                            <span>• {it.category} ({it.remarks || 'No remark'})</span>
                            <span className="font-extrabold text-slate-900">₹{it.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-6 bg-white rounded-2xl border text-center">No expense claims submitted yet.</p>
            )}
          </div>
        </div>
      )}

      {/* MASTER STAFF / DROPDOWN ENTRY MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Add Master Dropdown Staff Name
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Add a new staff, supervisor, or executive name to master dropdown list. This will automatically appear in Handled By and Paid By dropdowns across the application.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Person / Staff Name *</label>
                <input
                  type="text"
                  value={newStaffNameInput}
                  onChange={e => setNewStaffNameInput(e.target.value)}
                  placeholder="e.g. Vikas Sharma / Production Head"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNewMasterStaff}
                  disabled={!newStaffNameInput.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  Save to Master Dropdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
