'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { Search, Plus, Building2, LogOut, Users } from 'lucide-react';
import { TeamDialog } from '@/components/team/team-dialog';

export function Header() {
  const { searchQuery, setSearchQuery, openNewLeadModal, currentUser, logout } = useLMS();
  const [isTeamOpen, setIsTeamOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Mobile Title / Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, phone numbers, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Real Authenticated User Badge */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800">{currentUser.name}</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                {currentUser.role === 'admin' ? 'Admin' : 'Agent'}
              </span>
            </div>
          )}

          {/* Team & WhatsApp Numbers Settings */}
          <button
            onClick={() => setIsTeamOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Team & WhatsApp</span>
          </button>

          {/* New Lead Button */}
          <button
            onClick={openNewLeadModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>

          {/* Header Logout Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            title="Sign Out"
            className="p-2 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Team Dialog */}
      <TeamDialog isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} />
    </>
  );
}
