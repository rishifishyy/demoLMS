'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { STATUS_CONFIG, LeadStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { X, Phone, MessageSquare, Plus, Trash2 } from 'lucide-react';

export function LeadDrawer() {
  const {
    leads,
    users,
    projects,
    currentUser,
    selectedLeadId,
    isDrawerOpen,
    closeLeadDrawer,
    updateLeadStatus,
    updateLeadAssignee,
    archiveLead, deleteLead,
    triggerCall,
    triggerWhatsApp,
    openQuickLog
  } = useLMS();

  if (!isDrawerOpen || !selectedLeadId) return null;

  const lead = leads.find((l) => l.id === selectedLeadId);
  if (!lead) return null;

  const project = projects.find((p) => p.id === lead.projectId);
  const isAdmin = currentUser?.role === 'admin';

  const statuses: LeadStatus[] = [
    'New Lead',
    'Interested',
    'Not Picked',
    'Visit Done',
    'Not Interested',
    'Junk'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeLeadDrawer}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex w-full md:w-auto md:pl-10">
        <div className="w-full md:w-screen md:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600">{lead.id}</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{lead.name}</h3>
              </div>
              <p className="text-xs text-slate-500">{project?.name || 'Real Estate Project'}</p>
            </div>
            <button
              onClick={closeLeadDrawer}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
            {/* Quick 1-Tap Action Bar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerCall(lead.id)}
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <Phone className="w-4 h-4" />
                <span>1-Tap Call</span>
              </button>
              <button
                onClick={() => triggerWhatsApp(lead.id)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <MessageSquare className="w-4 h-4" />
                <span>1-Tap WhatsApp</span>
              </button>
            </div>

            {/* Status & Reassignment Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Lead Information
                </span>
                <button
                  onClick={() => openQuickLog(lead.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Activity</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assigned Salesperson</label>
                  <select
                    value={lead.assignedTo}
                    disabled={!isAdmin}
                    onChange={(e) => updateLeadAssignee(lead.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-60"
                  >
                    {users.filter(u => u.role === 'salesperson').map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Primary Mobile</span>
                  <p className="font-bold text-slate-800">{lead.mobile}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">WhatsApp</span>
                  <p className="font-bold text-emerald-600">{lead.whatsapp || lead.mobile}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-400 block text-[10px]">Next Scheduled Follow-up</span>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="font-bold text-slate-800">
                    {lead.nextFollowup ? formatDateTime(lead.nextFollowup) : 'None scheduled'}
                  </p>
                  <button
                    onClick={() => openQuickLog(lead.id)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>

            {/* Chronological Activity Timeline */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Activity Timeline ({lead.timeline.length})
                </span>
              </div>

              <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {lead.timeline.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No previous activities logged.</p>
                ) : (
                  lead.timeline.map((act) => {
                    const author = users.find((u) => u.id === act.userId);
                    return (
                      <div key={act.id} className="relative text-xs">
                        <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">{act.type}</span>
                            <span className="text-[10px] text-slate-400">{formatDateTime(act.timestamp)}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{act.details}</p>
                          {act.previousStatus && act.newStatus && act.previousStatus !== 'None' && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Status: <span className="font-semibold text-slate-600">{act.previousStatus}</span> &rarr;{' '}
                              <span className="font-bold text-blue-600">{act.newStatus}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            <img src={author?.avatar} alt={author?.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span>{author?.name || 'User'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm(`Move lead ${lead.name} to the Recycle Bin? You can restore it within 15 days.`)) {
                  deleteLead(lead.id);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Move to Recycle Bin</span>
            </button>
            <button
              onClick={closeLeadDrawer}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
