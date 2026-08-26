'use client';

import React, { useState, useEffect } from 'react';
import { useLMS } from '@/lib/store';
import { LeadStatus, ActivityType } from '@/lib/types';
import { X, Sparkles } from 'lucide-react';

export function QuickLogDialog() {
  const {
    leads,
    quickLogLeadId,
    isQuickLogOpen,
    closeQuickLog,
    recordActivity
  } = useLMS();

  const lead = leads.find((l) => l.id === quickLogLeadId);

  const [activityType, setActivityType] = useState<ActivityType>('Call');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('Interested');
  const [details, setDetails] = useState('');
  const [followupDateTime, setFollowupDateTime] = useState('');

  useEffect(() => {
    if (lead) {
      setSelectedStatus(lead.status === 'New Lead' ? 'Interested' : lead.status);
      setDetails('');
      // Default follow up to tomorrow 11 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const localIso = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
      setFollowupDateTime(localIso);
    }
  }, [lead]);

  if (!isQuickLogOpen || !lead) return null;

  const quickOutcomes = [
    {
      label: '⭐ Interested',
      status: 'Interested' as LeadStatus,
      preset: 'Customer showed genuine interest. Discussed pricing and requested brochure.'
    },
    {
      label: '📞 Not Picked',
      status: 'Not Picked' as LeadStatus,
      preset: 'Dialed phone, rang without answer. Sent WhatsApp follow-up greeting.'
    },
    {
      label: '🏡 Visit Done',
      status: 'Visit Done' as LeadStatus,
      preset: 'Completed site visit walkthrough with customer.'
    },
    {
      label: '❌ Not Interested',
      status: 'Not Interested' as LeadStatus,
      preset: 'Customer declined, cited budget or location mismatch.'
    },
    {
      label: '🗑️ Junk Lead',
      status: 'Junk' as LeadStatus,
      preset: 'Invalid contact number or spam inquiry.'
    }
  ];

  const handlePresetDays = (days: number, hours = 0) => {
    const target = new Date();
    if (hours > 0) {
      target.setHours(target.getHours() + hours);
    } else {
      target.setDate(target.getDate() + days);
      target.setHours(11, 0, 0, 0);
    }
    const tzOffset = target.getTimezoneOffset() * 60000;
    const localIso = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
    setFollowupDateTime(localIso);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordActivity(lead.id, {
      type: activityType,
      details: details.trim() || `${activityType} completed with customer.`,
      newStatus: selectedStatus,
      scheduledFollowup: followupDateTime ? new Date(followupDateTime).toISOString() : null
    });
    closeQuickLog();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={closeQuickLog} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Record Call & Activity Outcome</h3>
            <p className="text-xs text-slate-500">{lead.name} ({lead.id})</p>
          </div>
          <button
            onClick={closeQuickLog}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Call">📞 Phone Call</option>
              <option value="WhatsApp">💬 WhatsApp Message</option>
              <option value="Visit">🏡 Site Visit</option>
              <option value="Remark">📝 General Remark / Note</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1.5">Quick Call Outcome Preset</label>
            <div className="flex flex-wrap gap-1.5">
              {quickOutcomes.map((item) => (
                <button
                  type="button"
                  key={item.status}
                  onClick={() => {
                    setSelectedStatus(item.status);
                    setDetails(item.preset);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs border transition-all cursor-pointer ${
                    selectedStatus === item.status
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Update Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="New Lead">New Lead</option>
                <option value="Interested">Interested</option>
                <option value="Not Picked">Not Picked</option>
                <option value="Visit Done">Visit Done</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Junk">Junk</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Next Follow-up Date/Time</label>
              <input
                type="datetime-local"
                value={followupDateTime}
                onChange={(e) => setFollowupDateTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => handlePresetDays(0, 2)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-600 font-semibold cursor-pointer"
                >
                  +2 hrs
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(1)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-600 font-semibold cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays(3)}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-600 font-semibold cursor-pointer"
                >
                  3 Days
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Discussion Remarks & Notes</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter details of conversation..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeQuickLog}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
            >
              Save & Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
