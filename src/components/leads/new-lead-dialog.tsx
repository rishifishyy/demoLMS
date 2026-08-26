'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { LeadStatus, LeadSource } from '@/lib/types';
import { X, UserPlus } from 'lucide-react';

export function NewLeadDialog() {
  const {
    projects,
    users,
    currentUser,
    isNewLeadModalOpen,
    closeNewLeadModal,
    createLead
  } = useLMS();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || 'PRJ-01');
  const [source, setSource] = useState<LeadSource>('Meta Ads');
  const [assignedTo, setAssignedTo] = useState(currentUser?.id || '');
  const [status, setStatus] = useState<LeadStatus>('New Lead');
  const [remark, setRemark] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');

  if (!isNewLeadModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    createLead({
      name: name.trim(),
      mobile: mobile.trim(),
      whatsapp: whatsapp.trim() || mobile.trim(),
      projectId,
      source,
      assignedTo: assignedTo || currentUser?.id || '',
      status,
      nextFollowup: nextFollowup ? new Date(nextFollowup).toISOString() : null,
      latestRemark: remark.trim() || 'Lead registered into system.'
    });

    // Reset form
    setName('');
    setMobile('');
    setWhatsapp('');
    setRemark('');
    setNextFollowup('');
    closeNewLeadModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={closeNewLeadModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Add New Real Estate Lead</h3>
              <p className="text-xs text-slate-500">Capture incoming inquiry into central database</p>
            </div>
          </div>
          <button
            onClick={closeNewLeadModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Primary Mobile *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98200 12345"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">WhatsApp Number (Optional)</label>
              <input
                type="tel"
                placeholder="Leave blank if same as mobile"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Interested Project / Property *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Lead Source *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Meta Ads">Meta Ads</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Google Ads">Google Ads</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Assign to Salesperson *</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {users.filter(u => u.role === 'salesperson').map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="New Lead">New Lead</option>
                <option value="Interested">Interested</option>
                <option value="Not Picked">Not Picked</option>
                <option value="Visit Done">Visit Done</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Schedule First Follow-up</label>
              <input
                type="datetime-local"
                value={nextFollowup}
                onChange={(e) => setNextFollowup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Initial Requirement / Notes</label>
            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Inquiring for 3BHK East-facing plot..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeNewLeadModal}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
            >
              Create & Assign Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
