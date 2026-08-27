'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { LeadStatus } from '@/lib/types';
import { X, Plus, AlertCircle } from 'lucide-react';
import { CustomDateTimePicker } from '@/components/ui/date-time-picker';

export function NewLeadDialog() {
  const {
    isNewLeadModalOpen,
    closeNewLeadModal,
    createLead,
    projects,
    users,
    currentUser
  } = useLMS();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [projectId, setProjectId] = useState('a1b2c3d4-0001-4000-8000-000000000001');
  const [sourceType, setSourceType] = useState('WHATSAPP');
  const [customSource, setCustomSource] = useState('');
  const [assignedTo, setAssignedTo] = useState(currentUser?.id || '');
  const [status, setStatus] = useState<LeadStatus>('New Lead');
  const [nextFollowup, setNextFollowup] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [latestRemark, setLatestRemark] = useState('');
  const [error, setError] = useState('');

  if (!isNewLeadModalOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  // Handle strictly numbers only for mobile inputs
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(numericOnly);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setWhatsapp(numericOnly);
  };

  // Quick DateTime preset helpers
  const setPresetTime = (hoursFromNow: number, setHour?: number) => {
    const d = new Date();
    if (setHour !== undefined) {
      d.setDate(d.getDate() + (hoursFromNow > 24 ? Math.floor(hoursFromNow / 24) : 0));
      d.setHours(setHour, 0, 0, 0);
    } else {
      d.setHours(d.getHours() + hoursFromNow);
    }
    // Format YYYY-MM-DDTHH:MM for datetime-local input
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter customer full name');
      return;
    }

    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9876543210)');
      return;
    }

    let finalSource = sourceType;
    if (sourceType === 'CUSTOM') {
      if (!customSource.trim()) {
        setError('Please enter your custom source name');
        return;
      }
      finalSource = customSource.trim().toUpperCase();
    }

    createLead({
      name: name.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      projectId: projectId || 'a1b2c3d4-0001-4000-8000-000000000001',
      source: finalSource,
      assignedTo: isAdmin ? (assignedTo || currentUser?.id || '') : (currentUser?.id || ''),
      status,
      nextFollowup: nextFollowup ? new Date(nextFollowup).toISOString() : null,
      latestRemark: latestRemark.trim() || 'Inquiry registered into system'
    });

    // Reset form
    setName('');
    setMobile('');
    setWhatsapp('');
    setProjectId('a1b2c3d4-0001-4000-8000-000000000001');
    setSourceType('WHATSAPP');
    setCustomSource('');
    setLatestRemark('');
    setNextFollowup('');
    closeNewLeadModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={closeNewLeadModal}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Add New Customer Lead</h3>
            <p className="text-xs text-slate-500">Enter customer details and property inquiry</p>
          </div>
          <button
            onClick={closeNewLeadModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amit Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Primary Mobile (Strict Numbers Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Mobile (Numbers Only) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="9876543210"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono font-bold tracking-wider"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">10 digits, strictly numeric</p>
            </div>

            {/* WhatsApp Number (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500">
                  +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Same as mobile"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono font-bold tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Interested Location & Lead Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Interested Property Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="a1b2c3d4-0001-4000-8000-000000000001">📍 MODINAGAR</option>
                <option value="a1b2c3d4-0002-4000-8000-000000000002">📍 MURADNAGAR</option>
                <option value="a1b2c3d4-0003-4000-8000-000000000003">📍 MEERUT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lead Source <span className="text-rose-500">*</span>
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="WHATSAPP">💬 WHATSAPP</option>
                <option value="INSTAGRAM">📸 INSTAGRAM</option>
                <option value="REFERRAL">🤝 REFERRAL</option>
                <option value="CUSTOM">✏️ + CUSTOM SOURCE (CAPITAL)</option>
              </select>
            </div>
          </div>

          {/* Custom Source Input */}
          {sourceType === 'CUSTOM' && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-1">
              <label className="block text-[11px] font-bold text-blue-900">
                Custom Source Name (Auto-Capitalized)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FACEBOOK ADS, HOARDING, COLD CALL"
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value.toUpperCase())}
                className="w-full bg-white border border-blue-300 rounded-lg px-3 py-2 text-xs text-blue-900 placeholder:text-blue-300 focus:outline-none focus:border-blue-600 font-bold uppercase"
              />
            </div>
          )}

          {/* Assignee & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assign to Agent {!isAdmin && <span className="text-slate-400 font-normal">(Auto-assigned)</span>}
              </label>
              <select
                value={isAdmin ? assignedTo : (currentUser?.id || '')}
                disabled={!isAdmin}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-60"
              >
                {isAdmin ? (
                  users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))
                ) : (
                  <option value={currentUser?.id || ''}>{currentUser?.name || 'You'}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="New Lead">New Lead</option>
                <option value="Interested">Interested</option>
                <option value="Not Picked">Not Picked</option>
                <option value="Visit Done">Visit Done</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Junk">Junk</option>
              </select>
            </div>
          </div>

          <CustomDateTimePicker
            value={nextFollowup}
            onChange={(val) => setNextFollowup(val)}
            label="Schedule Follow-up Call / Site Visit"
          />

          {/* Initial Discussion Remark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Discussion Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Inquired for 200 sq yard plot in Modinagar, looking for site visit on Sunday."
              value={latestRemark}
              onChange={(e) => setLatestRemark(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={closeNewLeadModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Register Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
