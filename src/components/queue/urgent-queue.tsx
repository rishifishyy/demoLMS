'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { getFollowupCategory, formatDateTime } from '@/lib/utils';
import { Phone, MessageSquare, Eye, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function UrgentQueue() {
  const {
    leads,
    projects,
    currentUser,
    openLeadDrawer,
    triggerCall,
    triggerWhatsApp
  } = useLMS();

  const isSalesperson = currentUser?.role === 'salesperson';

  const urgentLeads = leads
    .filter((l) => {
      if (l.isArchived) return false;
      if (isSalesperson && l.assignedTo !== currentUser?.id) return false;
      const cat = getFollowupCategory(l.nextFollowup);
      return cat === 'overdue' || cat === 'today';
    })
    .sort((a, b) => new Date(a.nextFollowup || 0).getTime() - new Date(b.nextFollowup || 0).getTime());

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-1">⚡ Today's Calls & Follow-up List</h3>
        <p className="text-xs text-slate-500">
          Calls you need to make today and missed follow-ups with property buyers.
        </p>
      </div>

      {urgentLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">All caught up!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no pending follow-ups due today or overdue. Great job keeping your leads updated!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {urgentLeads.map((lead, idx) => {
            const project = projects.find((p) => p.id === lead.projectId);
            const cat = getFollowupCategory(lead.nextFollowup);

            return (
              <div
                key={lead.id}
                className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  cat === 'overdue' ? 'border-l-4 border-l-rose-500 border-slate-200' : 'border-l-4 border-l-amber-500 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openLeadDrawer(lead.id)}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                      >
                        {lead.name}
                      </button>
                      <span className="text-[10px] font-mono font-bold text-slate-400">({lead.id})</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      🏢 {project?.name || 'Property'} &bull; 📱 {lead.mobile}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 rounded-md p-2 mt-2 border border-slate-100">
                      <em>"{lead.latestRemark}"</em>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  {cat === 'overdue' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Overdue: {formatDateTime(lead.nextFollowup)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      <Clock className="w-3.5 h-3.5" />
                      Due Today: {formatDateTime(lead.nextFollowup)}
                    </span>
                  )}

                  <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center">
                    <button
                      onClick={() => triggerCall(lead.id)}
                      className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </button>
                    <button
                      onClick={() => triggerWhatsApp(lead.id)}
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => openLeadDrawer(lead.id)}
                      className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
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
