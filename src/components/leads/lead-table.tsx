'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { STATUS_CONFIG, LEAD_SOURCES, LeadStatus } from '@/lib/types';
import { formatDateTime, getFollowupCategory } from '@/lib/utils';
import { BulkReassignDialog } from './bulk-reassign-dialog';
import { 
  Phone, 
  MessageSquare, 
  Eye, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Trash2, 
  X, 
  CheckSquare, 
  Square, 
  MinusSquare,
  AlertCircle
} from 'lucide-react';

export function LeadTable() {
  const {
    getFilteredLeads,
    projects,
    users,
    currentUser,
    filterStatus,
    setFilterStatus,
    filterProject,
    setFilterProject,
    filterSource,
    setFilterSource,
    filterSalesperson,
    setFilterSalesperson,
    sortBy,
    setSortBy,
    openLeadDrawer,
    triggerCall,
    triggerWhatsApp,
    bulkDeleteLeads
  } = useLMS();

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const leads = getFilteredLeads();
  const isSalesperson = currentUser?.role === 'salesperson';

  // Multi-select helpers
  const isAllSelected = leads.length > 0 && selectedLeadIds.length === leads.length;
  const isSomeSelected = selectedLeadIds.length > 0 && selectedLeadIds.length < leads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedLeadIds([]);
  };

  const handleConfirmDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    setIsDeleting(true);
    try {
      await bulkDeleteLeads(selectedLeadIds);
      setSelectedLeadIds([]);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting leads:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const statuses: (LeadStatus | 'ALL')[] = [
    'ALL',
    'New Lead',
    'Interested',
    'Not Picked',
    'Visit Done',
    'Not Interested',
    'Junk'
  ];

  return (
    <div className="space-y-3 relative pb-16">
      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {statuses.map((st) => {
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {st === 'ALL' ? 'All Leads' : st}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Select All Helper */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Properties</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterSalesperson}
              onChange={(e) => setFilterSalesperson(e.target.value)}
              disabled={isSalesperson}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-60"
            >
              <option value="ALL">{isSalesperson ? 'My Leads' : 'All Salespersons'}</option>
              {users.filter(u => u.role === 'salesperson').map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="followup">Sort: Follow-up</option>
              <option value="lastContacted">Sort: Last Contact</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {leads.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Select All ({leads.length})</span>
                  </>
                )}
              </button>
            )}

            <div className="text-xs font-medium text-slate-400">
              Showing <strong className="text-slate-700">{leads.length}</strong> leads
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Cards list for phones (< 768px) */}
      <div className="md:hidden space-y-2.5">
        {leads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600 mb-1">No leads match your criteria</p>
            <p className="text-xs text-slate-400">Try clearing your filters or searching another keyword.</p>
          </div>
        ) : (
          leads.map((lead) => {
            const isSelected = selectedLeadIds.includes(lead.id);
            const project = projects.find((p) => p.id === lead.projectId);
            const assignee = users.find((u) => u.id === lead.assignedTo);
            const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG['New Lead'];
            const followupCat = getFollowupCategory(lead.nextFollowup);

            return (
              <div
                key={lead.id}
                className={`bg-white border rounded-xl p-3.5 shadow-xs space-y-3 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20'
                    : followupCat === 'overdue'
                    ? 'border-l-4 border-l-rose-500 border-slate-200'
                    : followupCat === 'today'
                    ? 'border-l-4 border-l-amber-500 border-slate-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: Checkbox, Name, ID, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {/* Mobile Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectLead(lead.id);
                      }}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 bg-slate-50 hover:border-slate-400'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold font-mono text-blue-600">{lead.id}</span>
                        <button
                          onClick={() => openLeadDrawer(lead.id)}
                          className="font-bold text-slate-900 text-sm text-left hover:text-blue-600 cursor-pointer"
                        >
                          {lead.name}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">📱 {lead.mobile}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusConf.badgeClass}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {lead.status}
                  </span>
                </div>

                {/* Middle Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Property & Source</span>
                    <span className="font-semibold text-slate-800">{project?.name || 'Property'}</span>
                    <span className="text-slate-400 block text-[10px]">({lead.source})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Agent</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <img src={assignee?.avatar} alt={assignee?.name} className="w-4 h-4 rounded-full object-cover" />
                      <span className="font-medium text-slate-700 truncate">{assignee?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>

                {/* Follow-up Note if any */}
                {lead.nextFollowup && (
                  <div className="text-[11px] flex items-center justify-between">
                    <span className="text-slate-400">Next Follow-up:</span>
                    {followupCat === 'overdue' ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        ⚠️ Overdue: {formatDateTime(lead.nextFollowup)}
                      </span>
                    ) : followupCat === 'today' ? (
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ⏰ Today: {new Date(lead.nextFollowup).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-600">
                        📅 {formatDateTime(lead.nextFollowup)}
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom 1-Tap Mobile Actions */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => triggerCall(lead.id)}
                    className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => triggerWhatsApp(lead.id)}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg shadow-xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => openLeadDrawer(lead.id)}
                    className="flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Data Table (Hidden on Mobile) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                {/* Master Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="inline-flex items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer"
                    title={isAllSelected ? 'Deselect All' : 'Select All'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Lead Name & Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Property & Source</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Next Follow-up</th>
                <th className="py-3 px-4">Last Contacted</th>
                <th className="py-3 px-4 text-right">1-Tap Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600 mb-1">No leads match your criteria</p>
                    <p className="text-xs text-slate-400">Try clearing your filters or searching another keyword.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const project = projects.find((p) => p.id === lead.projectId);
                  const assignee = users.find((u) => u.id === lead.assignedTo);
                  const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG['New Lead'];
                  const followupCat = getFollowupCategory(lead.nextFollowup);

                  return (
                    <tr
                      key={lead.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-2 border-l-blue-600'
                          : followupCat === 'overdue'
                          ? 'bg-rose-50/20 hover:bg-rose-50/40'
                          : followupCat === 'today'
                          ? 'bg-amber-50/20 hover:bg-amber-50/40'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectLead(lead.id);
                          }}
                          className="inline-flex items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold font-mono text-blue-600">{lead.id}</span>
                          <button
                            onClick={() => openLeadDrawer(lead.id)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors cursor-pointer"
                          >
                            {lead.name}
                          </button>
                          <span className="text-[11px] text-slate-400 mt-0.5">📱 {lead.mobile}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {lead.status}
                        </span>
                      </td>

                      {/* Property & Source */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800">{project?.name || 'Unknown'}</span>
                          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium w-max">
                            {lead.source}
                          </span>
                        </div>
                      </td>

                      {/* Assigned */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={assignee?.avatar}
                            alt={assignee?.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-medium text-slate-700">{assignee?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Next Followup */}
                      <td className="py-3 px-4">
                        {lead.nextFollowup ? (
                          <div className="flex items-center gap-1.5">
                            {followupCat === 'overdue' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue: {formatDateTime(lead.nextFollowup)}
                              </span>
                            ) : followupCat === 'today' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                                <Clock className="w-3 h-3" />
                                Today, {new Date(lead.nextFollowup).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-medium">
                                📅 {formatDateTime(lead.nextFollowup)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not scheduled</span>
                        )}
                      </td>

                      {/* Last Contacted */}
                      <td className="py-3 px-4 text-slate-500">
                        {formatDateTime(lead.lastContacted)}
                      </td>

                      {/* 1-Tap Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => triggerCall(lead.id)}
                            title="1-Tap Native Phone Call"
                            className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => triggerWhatsApp(lead.id)}
                            title="1-Tap WhatsApp Chat"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WA</span>
                          </button>
                          <button
                            onClick={() => openLeadDrawer(lead.id)}
                            title="View History & Details"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING BULK ACTIONS DOCK (Mobile & Desktop) */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg md:max-w-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-800 shadow-2xl rounded-2xl p-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
            {/* Left Count info */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 shadow-xs">
                {selectedLeadIds.length}
              </span>
              <div className="hidden sm:block min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {selectedLeadIds.length === 1 ? '1 lead selected' : `${selectedLeadIds.length} leads selected`}
                </p>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Clear selection
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Reassign</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Cancel selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK REASSIGN MODAL */}
      <BulkReassignDialog
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        selectedLeadIds={selectedLeadIds}
        onSuccess={() => {
          setSelectedLeadIds([]);
        }}
      />

      {/* BULK DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-center text-base">
              Move {selectedLeadIds.length} Leads to Trash?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              These leads will be moved to the Recycle Bin. You or an admin can restore them anytime from the Trash tab.
            </p>

            <div className="flex items-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isDeleting ? 'Moving...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
