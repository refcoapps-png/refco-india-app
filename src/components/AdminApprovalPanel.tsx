import React, { useState } from 'react';
import { ShieldCheck, UserCheck, UserX, Download, FileSpreadsheet, ShieldAlert, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getUsers, saveUsers, getVisits, getAccessLogs } from '../services/dbService';
import { User, VisitRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminApprovalPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const users = getUsers();
  const visits = getVisits();
  const accessLogs = getAccessLogs();

  const [activeTab, setActiveTab] = useState<'approvals' | 'reports' | 'logs'>('approvals');

  // Pending users
  const pendingUsers = users.filter(u => u.approvalStatus === 'Pending');

  // Date Range Filter for Report
  const [fromDate, setFromDate] = useState('2026-07-01');
  const [toDate, setToDate] = useState('2026-07-31');

  if (!isOpen) return null;

  const handleApprove = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, approvalStatus: 'Approved' as const, accountStatus: 'Active' as const };
      }
      return u;
    });
    saveUsers(updated);
  };

  const handleReject = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, approvalStatus: 'Rejected' as const, accountStatus: 'Inactive' as const };
      }
      return u;
    });
    saveUsers(updated);
  };

  const handleDownloadExcelReport = () => {
    const filteredVisits = visits.filter(v => {
      if (!v.visitDateTime) return true;
      const vDate = v.visitDateTime.split('T')[0];
      return vDate >= fromDate && vDate <= toDate;
    });

    const reportData = filteredVisits.map(v => ({
      'Visit Date & Time': v.visitDateTime,
      'Salesperson Name': v.salespersonName,
      'Company Name': v.companyName,
      'Contact Person Met': v.contactPersonName,
      'Purpose of Visit': v.purpose,
      'Discussion / MOM': v.discussionMOM,
      'Next Action Item': v.nextActionItem,
      'Follow-up Date': v.followUpDate,
      'Follow-up Status': v.followUpStatus || 'Pending'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Visit Report');

    XLSX.writeFile(workbook, `Refco_Master_Visit_Report_${fromDate}_to_${toDate}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-lg">Master Admin Control Panel</h2>
              <p className="text-xs text-amber-400">info@refcoindia.com Authority Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="bg-slate-100 p-2 flex space-x-2 border-b">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'approvals' ? 'bg-cyan-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Sign-Up Approvals ({pendingUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports' ? 'bg-cyan-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Download Master Visit Report (.xlsx)
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logs' ? 'bg-cyan-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Document Access Audit Logs ({accessLogs.length})
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: USER APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Pending Account Access Requests
              </h3>

              {pendingUsers.length > 0 ? (
                <div className="space-y-3">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-slate-900">{u.fullName}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">Email: {u.email} | Mobile: {u.mobile}</p>
                        <p className="text-[10px] text-slate-400">Requested On: {new Date(u.createdOn).toLocaleDateString('en-IN')}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReject(u.id)}
                          className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center space-x-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(u.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1 uppercase"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-6 bg-slate-50 rounded-2xl text-center">
                  No pending user approval requests.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: VISIT REPORT EXPORTER */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Export Master Visit Report to Excel (.xlsx)
              </h3>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDownloadExcelReport}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 uppercase tracking-wide"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>[ Download Master Visit Report (.xlsx) ]</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT ACCESS AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Financial Document Security Access Trail
              </h3>

              {accessLogs.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {accessLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 border rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{log.userName} ({log.userEmail})</p>
                        <p className="text-slate-600">Opened {log.documentType}: {log.documentNumber} for company <span className="font-extrabold text-cyan-900">{log.companyName}</span></p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-6 bg-slate-50 rounded-2xl text-center">
                  No document access logs recorded yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
