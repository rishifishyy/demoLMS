'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { Trash2, RotateCcw, AlertTriangle, Clock, Building } from 'lucide-react';

export function RecycleBin() {
  const {
    leads,
    projects,
    users,
    currentUser,
    restoreLead,
    permanentDeleteLead,
    emptyRecycleBin
  } = useLMS();

  const isSalesperson = currentUser?.role === 'salesperson';
  const isAdmin = currentUser?.role === 'admin';

  const trashedLeads = leads.filter((l) => {
    if (!l.isArchived && !l.deletedAt) return false;
    if (isSalesperson && l.assignedTo !== currentUser?.id) return false;
    return true;
  });

  const getDaysRemaining = (deletedAt?: string | null) => {
    if (!deletedAt) return 15;
    const deletedTime = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysPassed = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));
    const remaining = 15 - daysPassed;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Recycle Bin / Deleted Leads</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deleted leads are safely stored here for <strong>15 days</strong> before permanent deletion. You can restore or delete them anytime.
          </p>
        </div>

        {trashedLeads.length > 0 && isAdmin && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently delete ALL leads in the Recycle Bin? This action cannot be undone.')) {
                emptyRecycleBin();
              }
            }}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Recycle Bin ({trashedLeads.length})</span>
          </button>
        )}
      </div>

      {/* Trashed Leads List */}
      {trashedLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Recycle Bin is Empty</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No deleted leads found. Any leads moved to trash will be held here safely for 15 days.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trashedLeads.map((lead) => {
            const project = projects.find((p) => p.id === lead.projectId);
            const assignee = users.find((u) => u.id === lead.assignedTo);
            const daysRemaining = getDaysRemaining(lead.deletedAt);

            return (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{lead.id}</span>
                      <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {project?.name || 'Property'} &bull; 📱 {lead.mobile} &bull; Assigned to: <strong>{assignee?.name || 'Agent'}</strong>
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2 mt-2 border border-slate-100">
                      <em>"{lead.latestRemark || 'No notes'}"</em>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Clock className="w-3.5 h-3.5" />
                    Auto-purges in {daysRemaining} days
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restoreLead(lead.id)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Lead</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete lead ${lead.name}? This cannot be undone.`)) {
                            permanentDeleteLead(lead.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Forever</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
