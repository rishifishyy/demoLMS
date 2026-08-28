'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  Building,
  CheckSquare,
  Square,
  MinusSquare,
  X
} from 'lucide-react';

export function RecycleBin() {
  const {
    leads,
    projects,
    users,
    currentUser,
    restoreLead,
    bulkRestoreLeads,
    permanentDeleteLead,
    bulkPermanentDeleteLeads,
    emptyRecycleBin
  } = useLMS();

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSalesperson = currentUser?.role === 'salesperson';
  const isAdmin = currentUser?.role === 'admin';

  const trashedLeads = leads.filter((l) => {
    if (!l.isArchived && !l.deletedAt) return false;
    if (isSalesperson && l.assignedTo !== currentUser?.id) return false;
    return true;
  });

  const isAllSelected = trashedLeads.length > 0 && selectedLeadIds.length === trashedLeads.length;
  const isSomeSelected = selectedLeadIds.length > 0 && selectedLeadIds.length < trashedLeads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(trashedLeads.map((l) => l.id));
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

  const handleBulkRestore = async () => {
    if (selectedLeadIds.length === 0) return;
    setIsRestoring(true);
    try {
      await bulkRestoreLeads(selectedLeadIds);
      setSelectedLeadIds([]);
    } catch (err) {
      console.error('Error restoring leads:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedLeadIds.length} selected leads? This CANNOT be undone.`)) return;
    setIsDeleting(true);
    try {
      await bulkPermanentDeleteLeads(selectedLeadIds);
      setSelectedLeadIds([]);
    } catch (err) {
      console.error('Error permanently deleting leads:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDaysRemaining = (deletedAt?: string | null) => {
    if (!deletedAt) return 15;
    const deletedTime = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysPassed = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24));
    const remaining = 15 - daysPassed;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <div className="space-y-4 relative pb-16">
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

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {trashedLeads.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Deselect All</span>
                </>
              ) : isSomeSelected ? (
                <>
                  <MinusSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Select All ({trashedLeads.length})</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Select All ({trashedLeads.length})</span>
                </>
              )}
            </button>
          )}

          {trashedLeads.length > 0 && isAdmin && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to permanently delete ALL leads in the Recycle Bin? This action cannot be undone.')) {
                  emptyRecycleBin();
                }
              }}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Bin ({trashedLeads.length})</span>
            </button>
          )}
        </div>
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
            const isSelected = selectedLeadIds.includes(lead.id);
            const project = projects.find((p) => p.id === lead.projectId);
            const assignee = users.find((u) => u.id === lead.assignedTo);
            const daysRemaining = getDaysRemaining(lead.deletedAt);

            return (
              <div
                key={lead.id}
                className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelectLead(lead.id)}
                    className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <div className="w-3.5 h-3.5" />
                    )}
                  </button>

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
                      <span>Restore</span>
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

      {/* FLOATING BULK DOCK IN RECYCLE BIN */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg md:max-w-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-800 shadow-2xl rounded-2xl p-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
            {/* Left Count */}
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
                onClick={handleBulkRestore}
                disabled={isRestoring}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isRestoring ? 'Restoring...' : 'Restore Selected'}</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleBulkPermanentDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Forever'}</span>
                </button>
              )}

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
    </div>
  );
}
