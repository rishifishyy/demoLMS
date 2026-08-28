'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { X, UserCheck, Search, Users, Check } from 'lucide-react';

interface BulkReassignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  onSuccess?: () => void;
}

export function BulkReassignDialog({
  isOpen,
  onClose,
  selectedLeadIds,
  onSuccess
}: BulkReassignDialogProps) {
  const { users, leads, bulkReassignLeads, currentUser } = useLMS();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter available team members
  const availableUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleConfirm = async () => {
    if (!selectedUserId || selectedLeadIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await bulkReassignLeads(selectedLeadIds, selectedUserId);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error during bulk reassignment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                Bulk Reassign Leads
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Assign <span className="font-bold text-blue-600">{selectedLeadIds.length} leads</span> to a team member
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search agent */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Team List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[320px]">
          {availableUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs font-semibold">No team members found</p>
            </div>
          ) : (
            availableUsers.map((user) => {
              const isSelected = selectedUserId === user.id;
              const isCurrent = currentUser?.id === user.id;
              const activeCount = leads.filter((l) => l.assignedTo === user.id && !l.isArchived).length;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {user.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                            You
                          </span>
                        )}
                        <span className="text-[10px] capitalize px-1.5 py-0.2 rounded font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {user.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {user.email} • <span className="font-medium text-slate-600">{activeCount} active leads</span>
                      </span>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Notice */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
          <span>💡</span>
          <span>
            {selectedLeadIds.length > 1 
              ? 'A single consolidated notification email will be sent to the selected agent.' 
              : 'The agent will receive an email notification for this lead.'}
          </span>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedUserId || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>Reassigning...</span>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign {selectedLeadIds.length} Leads</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
