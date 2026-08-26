'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { LeadStatus } from '@/lib/types';
import { X, Check, Clock, MessageSquare, Calendar } from 'lucide-react';

export function QuickLogDialog() {
  const {
    quickLogLeadId,
    closeQuickLog,
    leads,
    recordActivity,
    currentUser
  } = useLMS();

  const [outcomeStatus, setOutcomeStatus] = useState<LeadStatus>('Interested');
  const [remark, setRemark] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  if (!quickLogLeadId) return null;

  const lead = leads.find((l) => l.id === quickLogLeadId);
  if (!lead) return null;

  const setPresetTime = (hoursFromNow: number, setHour?: number) => {
    const d = new Date();
    if (setHour !== undefined) {
      d.setDate(d.getDate() + (hoursFromNow > 24 ? Math.floor(hoursFromNow / 24) : 0));
      d.setHours(setHour, 0, 0, 0);
    } else {
      d.setHours(d.getHours() + hoursFromNow);
    }
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setNextFollowup(localIso);
    setIsDatePickerOpen(false);
  };

  const formatFollowupDisplay = (isoStr: string) => {
    if (!isoStr) return null;
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    recordActivity(lead.id, {
      type: 'Call',
      details: remark.trim() || `Call completed. Marked as ${outcomeStatus}.`,
      newStatus: outcomeStatus,
      scheduledFollowup: nextFollowup ? new Date(nextFollowup).toISOString() : null
    });

    setRemark('');
    setNextFollowup('');
    closeQuickLog();
  };

  const statusOptions: { label: string; value: LeadStatus; colorClass: string }[] = [
    { label: '⭐ Interested', value: 'Interested', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { label: '🏢 Visit Done', value: 'Visit Done', colorClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { label: '📞 Not Picked', value: 'Not Picked', colorClass: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
    { label: '🚫 Not Interested', value: 'Not Interested', colorClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
    { label: '🗑️ Junk Lead', value: 'Junk', colorClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div onClick={closeQuickLog} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Quick Call Outcome Log</h3>
            <p className="text-xs text-slate-500 font-medium">{lead.name} &bull; +91 {lead.mobile}</p>
          </div>
          <button onClick={closeQuickLog} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Call Result:</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutcomeStatus(opt.value)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    outcomeStatus === opt.value
                      ? 'ring-2 ring-blue-500 shadow-xs ' + opt.colorClass
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {outcomeStatus === opt.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Call Notes / Discussion:</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Customer requested price quote on WhatsApp, interested in 150 sq yd plot."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
            />
          </div>

          {/* Quick DateTime Presets */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Schedule Next Action
              </label>
              {nextFollowup && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                  ⏰ {formatFollowupDisplay(nextFollowup)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPresetTime(0, 17)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
              >
                Today 5:00 PM
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(24, 11)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
              >
                Tomorrow 11:00 AM
              </button>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>{isDatePickerOpen ? 'Close' : 'Custom'}</span>
              </button>
            </div>

            {isDatePickerOpen && (
              <div className="bg-white border border-blue-200 rounded-lg p-2.5 flex items-center gap-2 mt-2">
                <input
                  type="datetime-local"
                  value={nextFollowup}
                  onChange={(e) => setNextFollowup(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeQuickLog}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Save Call Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
