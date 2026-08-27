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
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-2">
        {/* Left: User Identity Badge & Search */}
        <div className="flex items-center gap-2 flex-1 max-w-lg min-w-0">
          {/* Active Logged-in User Profile Pill (Visible on Mobile & Desktop) */}
          {currentUser && (
            <button
              type="button"
              onClick={() => setIsTeamOpen(true)}
              title="Tap to view or edit your profile"
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-1 pr-2.5 sm:px-3 sm:py-1.5 transition-all text-left cursor-pointer shrink-0 shadow-2xs"
            >
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover border border-white shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[80px] sm:max-w-[140px]">
                    {currentUser.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isAdmin ? '👑 Admin' : '💼 Agent'}
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Quick Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Team & WhatsApp Numbers Settings */}
          <button
            onClick={() => setIsTeamOpen(true)}
            title="Team & WhatsApp Numbers"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Team</span>
          </button>

          {/* New Lead Button */}
          <button
            onClick={openNewLeadModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Lead</span>
            <span className="sm:hidden">Add</span>
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
          </button>
        </div>
      </header>

      {/* Team Dialog */}
      <TeamDialog isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} />
    </>
  );
}
