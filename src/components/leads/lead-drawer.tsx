'use client';

import React, { useState, useEffect } from 'react';
import { useLMS } from '@/lib/store';
import { LeadStatus, STATUS_CONFIG } from '@/lib/types';
import {
  X,
  Phone,
  MessageSquare,
  Building,
  User,
  Trash2,
  Send,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export function LeadDrawer() {
    const {
    selectedLeadId,
    isDrawerOpen,
    closeLeadDrawer,
    leads,
    projects,
    users,
    currentUser,
    updateLeadStatus,
    updateLeadAssignee,
    recordActivity,
    deleteLead,
    triggerCall,
    triggerWhatsApp
  } = useLMS();

  const [noteInput, setNoteInput] = useState('');
  const [scheduledFollowup, setScheduledFollowup] = useState('');
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [selectedNewAssignee, setSelectedNewAssignee] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState('');

  const lead = leads.find((l) => l.id === selectedLeadId);

  useEffect(() => {
    if (lead) {
      setSelectedNewAssignee(lead.assignedTo);
      setReassignSuccessMsg('');
    }
  }, [lead?.id, lead?.assignedTo]);

  if (!isDrawerOpen || !lead) return null;

  const project = projects.find((p) => p.id === lead.projectId);
  const assignee = users.find((u) => u.id === lead.assignedTo);
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG['New Lead'];
  const isAdmin = currentUser?.role === 'admin';

  const hasAssigneeChanged = selectedNewAssignee !== lead.assignedTo;
  const newAssigneeObj = users.find((u) => u.id === selectedNewAssignee);

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    recordActivity(lead.id, {
      type: 'Remark',
      details: noteInput.trim(),
      scheduledFollowup: scheduledFollowup ? new Date(scheduledFollowup).toISOString() : null
    });

    setNoteInput('');
    setScheduledFollowup('');
    setIsFollowupOpen(false);
  };

  const handleConfirmReassignment = async () => {
    if (!selectedNewAssignee || selectedNewAssignee === lead.assignedTo) return;

    setIsReassigning(true);
    await updateLeadAssignee(lead.id, selectedNewAssignee);
    setIsReassigning(false);
    setReassignSuccessMsg(`✓ Successfully reassigned to ${newAssigneeObj?.name || 'Agent'}! Notification sent.`);

    setTimeout(() => {
      setReassignSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div onClick={closeLeadDrawer} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {lead.id}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.badgeClass}`}>
              {lead.status}
            </span>
          </div>

          <button
            onClick={closeLeadDrawer}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Customer Title & Quick Actions */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{lead.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>📍 {project?.name || 'Property'}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600 font-semibold">{lead.source}</span>
              </p>
            </div>

            {/* 1-Tap Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => triggerCall(lead.id)}
                className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call +91 {lead.mobile}</span>
              </button>

              <button
                onClick={() => triggerWhatsApp(lead.id)}
                className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* REASSIGNMENT PANEL (Admin Only) */}
          {isAdmin && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Assigned Team Member
                </label>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Admin Control</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedNewAssignee}
                  onChange={(e) => setSelectedNewAssignee(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({u.role === 'admin' ? 'Admin' : 'Agent'})
                    </option>
                  ))}
                </select>

                {/* Confirm Reassignment Button (Appears when different member is selected) */}
                {hasAssigneeChanged && (
                  <button
                    onClick={handleConfirmReassignment}
                    disabled={isReassigning}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer shrink-0 animate-in fade-in"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReassigning ? 'animate-spin' : ''}`} />
                    <span>Confirm Reassign</span>
                  </button>
                )}
              </div>

              {reassignSuccessMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{reassignSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

                    {/* 1-Tap Share Lead to Agent via WhatsApp */}
          {isAdmin && assignee && (
            <a
              href={`https://wa.me/${assignee.phone ? ('91' + assignee.phone.replace(/\D/g, '').slice(-10)) : ''}?text=${encodeURIComponent(
                `⚡ *NEW LEAD ASSIGNED TO YOU*\n\n👤 *Customer:* ${lead.name}\n📱 *Mobile:* +91 ${lead.mobile}\n📍 *Location:* ${project?.name || 'Property'}\n🏷️ *Source:* ${lead.source}\n📝 *Notes:* ${lead.latestRemark || 'New inquiry'}\n\n🔗 *Open CRM:* https://happy-lms.vercel.app`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <span>📲 Notify {assignee.name.split(' ')[0]} on WhatsApp {assignee.phone ? `(+91 ${assignee.phone})` : ''}</span>
            </a>
          )}

          {/* Status Progression Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Update Lead Status:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['New Lead', 'Interested', 'Visit Done', 'Not Picked', 'Not Interested', 'Junk'] as LeadStatus[]).map(
                (st) => {
                  const cfg = STATUS_CONFIG[st];
                  const isCurrent = lead.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => updateLeadStatus(lead.id, st)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all text-center cursor-pointer ${
                        isCurrent
                          ? `ring-2 ring-blue-500 shadow-xs ${cfg.badgeClass}`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Add Remark & Follow-up Form */}
          <form onSubmit={handleAddRemark} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Call Notes & Remarks:</label>
            <textarea
              rows={2}
              placeholder="e.g. Discussed plot pricing, customer wants site visit next Sunday."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none font-medium"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsFollowupOpen(!isFollowupOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{scheduledFollowup ? 'Change Schedule' : '+ Schedule Follow-up'}</span>
              </button>

              <button
                type="submit"
                disabled={!noteInput.trim()}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {isFollowupOpen && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Select Date & Time:</label>
                <input
                  type="datetime-local"
                  value={scheduledFollowup}
                  onChange={(e) => setScheduledFollowup(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </form>

          {/* Timeline of Activities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Discussion History & Timeline ({lead.timeline.length})
            </h4>

            <div className="space-y-2.5">
              {lead.timeline.map((act) => (
                <div
                  key={act.id}
                  className="bg-white border border-slate-100 rounded-xl p-3 shadow-2xs flex items-start gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{act.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(act.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Move to Recycle Bin */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                if (confirm(`Move lead ${lead.name} to the Recycle Bin? You can restore it within 15 days.`)) {
                  deleteLead(lead.id);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Move to Recycle Bin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
