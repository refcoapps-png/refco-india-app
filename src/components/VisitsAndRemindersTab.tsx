import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, RefreshCw, AlertCircle, MessageSquare, Plus, PlusCircle } from 'lucide-react';
import { getVisits, saveVisits } from '../services/dbService';
import { VisitRecord } from '../types';
import { formatDateDDMMMYYYY, toInputDateValue } from '../utils/formatters';

interface Props {
  onLogNewVisit?: () => void;
}

export const VisitsAndRemindersTab: React.FC<Props> = ({ onLogNewVisit }) => {
  const visits = getVisits();

  const todayDDMMM = formatDateDDMMMYYYY(new Date());

  const pendingReminders = visits.filter(
    v => v.followUpStatus === 'Pending' || !v.followUpStatus
  );

  const [reschedulingVisit, setReschedulingVisit] = useState<VisitRecord | null>(null);
  const [newDateInput, setNewDateInput] = useState(toInputDateValue(new Date()));
  const [rescheduleRemarks, setRescheduleRemarks] = useState('');

  const handleCloseFollowUp = (visitId: string) => {
    const updated = visits.map(v => {
      if (v.id === visitId) {
        return { ...v, followUpStatus: 'Completed' as const };
      }
      return v;
    });
    saveVisits(updated);
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingVisit) return;
    const formatted = formatDateDDMMMYYYY(newDateInput);

    const updated = visits.map(v => {
      if (v.id === reschedulingVisit.id) {
        return {
          ...v,
          followUpDate: formatted,
          followUpStatus: 'Rescheduled' as const,
          followUpRescheduleRemarks: rescheduleRemarks
        };
      }
      return v;
    });

    saveVisits(updated);
    setReschedulingVisit(null);
    setRescheduleRemarks('');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-wider">
            Sales Automation & Follow-ups
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-1">
            Follow-up Reminders & Actions ({pendingReminders.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Scheduled follow-ups for Refco India client visits
          </p>
        </div>

        {onLogNewVisit && (
          <button
            onClick={onLogNewVisit}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-md flex items-center justify-center space-x-2 shrink-0 transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log Sales Visit Record</span>
          </button>
        )}
      </div>

      {pendingReminders.length > 0 ? (
        <div className="space-y-4">
          {pendingReminders.map((visit) => {
            const isToday = visit.followUpDate === todayDDMMM;

            return (
              <div
                key={visit.id}
                className={`p-5 rounded-3xl border shadow-md space-y-3 transition-all ${
                  isToday
                    ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Due Date: <span className="text-amber-800">{visit.followUpDate}</span>
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-full uppercase animate-pulse">
                        DUE TODAY!
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    Client: <span className="text-cyan-900 font-extrabold">{visit.companyName}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <p className="text-slate-700">Met With: <span className="font-bold text-slate-900">{visit.contactPersonName}</span></p>
                  <p className="text-slate-700">Salesperson: <span className="font-bold text-slate-900">{visit.salespersonName}</span></p>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border text-xs text-slate-800 font-medium">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">MOM Summary</span>
                  "{visit.discussionMOM}"
                </div>

                {visit.nextActionItem && (
                  <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-xs font-extrabold text-amber-950">
                    Action Item: {visit.nextActionItem}
                  </div>
                )}

                {/* Follow-up Closure / Reschedule Action Buttons */}
                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setReschedulingVisit(visit)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>[ Reschedule / Set New Follow-up ]</span>
                  </button>

                  <button
                    onClick={() => handleCloseFollowUp(visit.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>[ Close Follow-up ]</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">All follow-ups are up to date!</p>
          <p className="text-xs text-slate-400">No pending follow-up reminders right now.</p>
        </div>
      )}

      {/* RESCHEDULE MODAL WITH CALENDAR PICKER */}
      {reschedulingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Reschedule Follow-up for {reschedulingVisit.companyName}
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                New Follow-up Date (Calendar Picker) *
              </label>
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
              <p className="text-[11px] text-amber-800 font-bold mt-1">
                Formatted as: [{formatDateDDMMMYYYY(newDateInput)}]
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                Reschedule Reason / Remark
              </label>
              <textarea
                value={rescheduleRemarks}
                onChange={(e) => setRescheduleRemarks(e.target.value)}
                rows={2}
                placeholder="e.g. Client requested callback next week..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t">
              <button
                type="button"
                onClick={() => setReschedulingVisit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-5 py-2.5 text-xs font-bold text-white bg-cyan-900 hover:bg-cyan-800 rounded-xl shadow-md uppercase tracking-wide"
              >
                Save New Follow-up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
