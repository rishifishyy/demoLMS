'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { Search, Plus, Building2, LogOut } from 'lucide-react';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    currentUser,
    logout,
    openNewLeadModal
  } = useLMS();

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Brand Icon & Heading */}
      <div className="flex items-center gap-2">
        <div className="md:hidden w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-bold text-slate-900 leading-tight">HappyLMS</h2>
          <p className="hidden sm:block text-[11px] text-slate-500">Real estate lead pipeline & dialer</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative w-28 sm:w-48 md:w-60">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-7 md:pl-8 pr-3 py-1 md:py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Authenticated User Pill */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
              {currentUser.name}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-100 text-blue-700">
              {currentUser.role === 'admin' ? 'Admin' : 'Agent'}
            </span>
          </div>
        )}

        {/* New Lead Action */}
        <button
          onClick={openNewLeadModal}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 md:py-2 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        {/* Dedicated Visible Log Out Button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              logout();
            }
          }}
          title="Sign Out"
          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-2.5 py-1.5 md:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
}
