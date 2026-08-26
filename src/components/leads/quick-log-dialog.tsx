'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { LeadStatus } from '@/lib/types';
import { X, Check } from 'lucide-react';
import { CustomDateTimePicker } from '@/components/ui/date-time-picker';

export function QuickLogDialog() {
  const {
    quickLogLeadId,
    closeQuickLog,
    leads,
    recordActivity
  } = useLMS();

  const [outcomeStatus, setOutcomeStatus] = useState<LeadStatus>('Interested');
  const [remark, setRemark] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');

  if (!quickLogLeadId) return null;

  const lead = leads.find((l) => l.id === quickLogLeadId);
  if (!lead) return null;

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

          {/* In-App Custom Date & Time Picker */}
          <CustomDateTimePicker
            value={nextFollowup}
            onChange={(val) => setNextFollowup(val)}
            label="Schedule Next Follow-up Action"
          />

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
