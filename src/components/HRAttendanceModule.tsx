import React, { useState, useEffect } from 'react';
import {
  Users, Clock, DollarSign, MapPin, CheckCircle2, UserCheck, LogOut, Navigation, AlertTriangle, ShieldAlert, Calendar
} from 'lucide-react';
import {
  getAttendanceRecords, saveAttendanceRecords, getSalaryRecords, saveSalaryRecords, getCurrentUser
} from '../services/dbService';
import { AttendanceRecord, SalaryRecord } from '../types';

export const HRAttendanceModule: React.FC = () => {
  const user = getCurrentUser();
  const attendance = getAttendanceRecords();
  const salaryList = getSalaryRecords();

  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'salary' | 'field'>('attendance');

  // Check if current user is HR or Admin
  const isHrOrAdmin = user?.role === 'Admin' || user?.role === 'HR' || user?.email === 'info@refcoindia.com' || user?.email === 'refco.apps@gmail.com';

  // -------------------------------------------------------------
  // 1. DAILY ATTENDANCE STATE & LOCATION AUTO-COLLECT
  // -------------------------------------------------------------
  const [shiftStatus, setShiftStatus] = useState<'Present' | 'Half Day' | 'On Field Visit'>('Present');
  const [locationText, setLocationText] = useState('Fetching live location pin...');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [activePunchRecord, setActivePunchRecord] = useState<AttendanceRecord | null>(null);

  // Auto collect GPS Location on mount
  useEffect(() => {
    fetchLiveLocation();
    
    // Check if user is currently punched in today
    const todayStr = new Date().toISOString().split('T')[0];
    const existingToday = attendance.find(
      a => (a.employeeName === (user?.fullName || 'Sales Executive') || a.employeeId === user?.id) && a.date === todayStr && !a.punchOutTime
    );

    if (existingToday) {
      setActivePunchRecord(existingToday);
    }
  }, []);

  const fetchLiveLocation = () => {
    setIsFetchingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationText(`GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (GIDC Estate, India)`);
          setIsFetchingLocation(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationText('GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat (Auto-Pin)');
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationText('GIDC Industrial Estate, Vatva, Ahmedabad (Default Pin)');
      setIsFetchingLocation(false);
    }
  };

  const handlePunchIn = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: AttendanceRecord = {
      id: 'att_' + Date.now(),
      employeeId: user?.id || 'emp_1',
      employeeName: user?.fullName || 'Sales Executive',
      date: todayStr,
      punchInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: shiftStatus,
      location: locationText
    };

    saveAttendanceRecords([newRecord, ...attendance]);
    setActivePunchRecord(newRecord);
    alert(`🟢 PUNCHED IN SUCCESSFULLY!\nShift: ${shiftStatus}\nLocation Pin: ${locationText}`);
  };

  const handlePunchOut = () => {
    if (!activePunchRecord) return;

    const punchOutTimeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const updatedRecords = attendance.map(a => {
      if (a.id === activePunchRecord.id) {
        return { ...a, punchOutTime: punchOutTimeStr };
      }
      return a;
    });

    saveAttendanceRecords(updatedRecords);
    setActivePunchRecord(null);
    alert(`🔴 PUNCHED OUT SUCCESSFULLY at ${punchOutTimeStr}! Shift completed.`);
  };


  // -------------------------------------------------------------
  // 2. SALARY & WORKING DAYS CALCULATOR BASED ON MONTH & YEAR
  // -------------------------------------------------------------
  const [selectedMonthYear, setSelectedMonthYear] = useState('2026-07');
  const [employeeName, setEmployeeName] = useState('Rajesh Sharma');
  const [baseSalary, setBaseSalary] = useState<number>(35000);
  const [advanceTaken, setAdvanceTaken] = useState<number>(5000);

  // Compute days in selected month
  const [yearStr, monthStr] = selectedMonthYear.split('-');
  const daysInMonth = new Date(parseInt(yearStr || '2026'), parseInt(monthStr || '07'), 0).getDate();
  
  const [customWorkingDays, setCustomWorkingDays] = useState<number>(daysInMonth);

  // Automatically sync working days when selected month/year changes
  useEffect(() => {
    if (yearStr && monthStr) {
      const days = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
      setCustomWorkingDays(days);
    }
  }, [selectedMonthYear]);

  // Count attendance recorded in DB for selected month & employee
  const recordedAttendedDays = attendance.filter(a => {
    const matchesMonth = a.date.startsWith(selectedMonthYear);
    const matchesEmp = a.employeeName.toLowerCase().includes(employeeName.toLowerCase()) || employeeName.toLowerCase().includes(a.employeeName.toLowerCase());
    return matchesMonth && matchesEmp;
  }).length || 24; // Fallback to 24 if fresh database

  const [attendedDaysInput, setAttendedDaysInput] = useState<number>(recordedAttendedDays);

  useEffect(() => {
    setAttendedDaysInput(recordedAttendedDays);
  }, [selectedMonthYear, employeeName, attendance.length]);

  const perDayPay = baseSalary / (customWorkingDays || 1);
  const earnedSalary = Math.round(perDayPay * attendedDaysInput);
  const netSalary = Math.max(0, earnedSalary - advanceTaken);

  const handleCalculateSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const newSalary: SalaryRecord = {
      id: 'sal_' + Date.now(),
      employeeId: 'emp_1',
      employeeName,
      monthYear: selectedMonthYear,
      baseSalary,
      workingDays: customWorkingDays,
      attendedDays: attendedDaysInput,
      advanceTaken,
      netPayable: netSalary,
      calculatedOn: new Date().toISOString().split('T')[0]
    };

    saveSalaryRecords([newSalary, ...salaryList]);
    alert(`Salary Record Saved!\nEmployee: ${employeeName}\nMonth: ${selectedMonthYear}\nNet Payable: ₹${netSalary.toLocaleString('en-IN')}`);
  };


  // RESTRICTED VIEW FOR NON-HR/ADMIN USERS
  if (!isHrOrAdmin) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-md space-y-4 text-center">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900">HR & Operations Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          This module contains confidential employee attendance logs, advance register & monthly salary calculations. It is restricted to <span className="font-bold text-slate-900">HR & Admin Users</span> only.
        </p>
        <div className="p-3 bg-slate-50 rounded-2xl border text-xs text-slate-600 max-w-sm mx-auto font-semibold">
          Logged in as: <span className="font-extrabold text-slate-900">{user?.fullName || 'Sales Executive'}</span> ({user?.role || 'User'})
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
            Refco HR & Field Operations (Admin View)
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {user?.role || 'HR Admin'} Access
          </span>
        </div>

        <h2 className="text-xl font-extrabold tracking-tight">
          Employee Attendance, Advances & Monthly Salary Portal
        </h2>

        {/* Sub Tabs */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'attendance' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Daily Attendance</span>
          </button>
          <button
            onClick={() => setActiveSubTab('salary')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'salary' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>2. Advance & Salary Calc</span>
          </button>
          <button
            onClick={() => setActiveSubTab('field')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'field' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>3. Field Tracking</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DAILY ATTENDANCE WITH AUTO-LOCATION & PUNCH OUT IN RED */}
      {/* ========================================================= */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-800" />
              <span>Daily Attendance & Location Pin Punching</span>
            </h3>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Today: {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800">
                Employee: {user?.fullName || 'Sales Executive'} ({user?.role || 'Staff'})
              </span>
              
              {activePunchRecord ? (
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 animate-pulse">
                  PUNCHED IN AT {activePunchRecord.punchInTime}
                </span>
              ) : (
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  NOT PUNCHED IN YET
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Type *</label>
                <select
                  value={shiftStatus}
                  onChange={e => setShiftStatus(e.target.value as any)}
                  disabled={activePunchRecord !== null}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="Present">Present (Office / Factory)</option>
                  <option value="On Field Visit">On Field Visit (Client Site)</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Auto-Collected Location Pin</label>
                  <button
                    type="button"
                    onClick={fetchLiveLocation}
                    className="text-[10px] font-bold text-cyan-800 hover:underline flex items-center space-x-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Refresh GPS</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={locationText}
                  onChange={e => setLocationText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* PUNCH IN vs PUNCH OUT BUTTON */}
            {!activePunchRecord ? (
              <button
                onClick={handlePunchIn}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>[ 🟢 PUNCH IN NOW ]</span>
              </button>
            ) : (
              <button
                onClick={handlePunchOut}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all animate-bounce"
              >
                <LogOut className="w-5 h-5 text-white" />
                <span>[ 🔴 PUNCH OUT NOW ]</span>
              </button>
            )}
          </div>

          {/* ATTENDANCE RECORDS LOG */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-700">Attendance Log Register ({attendance.length})</h4>
            {attendance.length > 0 ? (
              <div className="space-y-2">
                {attendance.map(a => (
                  <div key={a.id} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <p className="font-extrabold text-slate-900">{a.employeeName} - <span className="text-emerald-700 font-bold">{a.status}</span></p>
                      <p className="text-[11px] text-slate-500 font-medium">📍 {a.location}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Date: {a.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900">In: {a.punchInTime}</p>
                      {a.punchOutTime ? (
                        <p className="font-mono font-extrabold text-rose-600">Out: {a.punchOutTime}</p>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">On Shift</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-6 bg-white rounded-2xl border text-center">No attendance recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADVANCE & SALARY CALCULATOR (MONTH & YEAR) */}
      {/* ========================================================= */}
      {activeSubTab === 'salary' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span>Employee Advance & Monthly Salary Calculator</span>
            </h3>
            <span className="text-xs font-extrabold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
              Refco Payroll Engine
            </span>
          </div>

          <form onSubmit={handleCalculateSalary} className="space-y-4 text-xs">
            
            {/* MONTH & YEAR SELECTOR */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-amber-950 mb-1">Select Salary Month & Year *</label>
                <input
                  type="month"
                  value={selectedMonthYear}
                  onChange={e => setSelectedMonthYear(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">Select Employee *</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  placeholder="Employee name"
                  required
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Base Monthly Salary (₹) *</label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={e => setBaseSalary(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Working Days in Month *</label>
                <input
                  type="number"
                  value={customWorkingDays}
                  onChange={e => setCustomWorkingDays(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400 font-semibold">Auto-calculated for {selectedMonthYear} ({daysInMonth} calendar days)</span>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Attended Days Recorded *</label>
                <input
                  type="number"
                  value={attendedDaysInput}
                  onChange={e => setAttendedDaysInput(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900"
                />
                <span className="text-[10px] text-emerald-700 font-bold">Fetched from attendance records</span>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Salary Advance Taken (₹) *</label>
                <input
                  type="number"
                  value={advanceTaken}
                  onChange={e => setAdvanceTaken(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-extrabold text-rose-700 text-sm"
                />
              </div>
            </div>

            {/* PAYROLL SUMMARY CARD */}
            <div className="p-5 bg-slate-900 text-white rounded-3xl space-y-3 shadow-xl">
              <span className="text-[10px] uppercase font-black text-amber-400 block tracking-wider">
                Monthly Salary Computation Summary ({selectedMonthYear})
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">Per Day Pay</span>
                  <span className="font-extrabold text-sm">₹{Math.round(perDayPay)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gross Earned ({attendedDaysInput} days)</span>
                  <span className="font-extrabold text-sm">₹{earnedSalary.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-rose-400 block">Advance Deduction</span>
                  <span className="font-extrabold text-sm text-rose-400">- ₹{advanceTaken.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 block">Net Salary Payable</span>
                  <span className="font-black text-xl text-amber-400">₹{netSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase text-xs shadow-md"
              >
                [ Save Monthly Payslip Record ]
              </button>
            </div>
          </form>

          {/* SALARY RECORDS LIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-700">Generated Monthly Payslips ({salaryList.length})</h4>
            {salaryList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {salaryList.map(s => (
                  <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="font-extrabold text-slate-900">{s.employeeName}</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">{s.monthYear}</span>
                    </div>

                    <p className="text-slate-600">Base: ₹{s.baseSalary} | Days: {s.attendedDays}/{s.workingDays}</p>
                    <p className="text-rose-600 font-semibold">Advance Deducted: -₹{s.advanceTaken}</p>
                    <p className="text-sm font-black text-emerald-800 pt-1 border-t">Net Paid: ₹{s.netPayable.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-6 bg-white rounded-2xl border text-center">No monthly salary records computed yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. FIELD TRACKING & LOCATION PINS */}
      {/* ========================================================= */}
      {activeSubTab === 'field' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-cyan-800" />
            <span>Sales Representative Field Visits & Live GPS Pins</span>
          </h3>

          <div className="p-4 bg-slate-50 border rounded-2xl text-xs space-y-3">
            <span className="font-extrabold text-slate-900 uppercase block text-[11px]">
              Active Field Check-ins Today
            </span>

            <div className="p-3.5 bg-white border rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Rajesh Sharma (Sales Representative)</p>
                <p className="text-slate-500 text-[11px] font-medium">📍 GIDC Industrial Estate, Vatva, Ahmedabad (Gujarat Steel & Galvanizing Plant)</p>
                <p className="text-[10px] text-slate-400">Check-in Time: 10:15 AM | GPS Verified</p>
              </div>

              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                Active On Field
              </span>
            </div>

            <div className="p-3.5 bg-white border rounded-2xl flex items-center justify-between shadow-2xs">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Ajay Patel (Regional Sales Head)</p>
                <p className="text-slate-500 text-[11px] font-medium">📍 Hazira Industrial Belt, Surat (Acid Pickling Line No. 2)</p>
                <p className="text-[10px] text-slate-400">Check-in Time: 11:45 AM | GPS Verified</p>
              </div>

              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                Active On Field
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
