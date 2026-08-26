'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { LayoutDashboard, Users, Zap, BarChart3, Building2, LogOut, Trash2 } from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, getMetrics, currentUser, logout, leads } = useLMS();
  const metrics = getMetrics();

  const isSalesperson = currentUser?.role === 'salesperson';
  const trashCount = leads.filter(l => {
    if (!l.isArchived && !l.deletedAt) return false;
    if (isSalesperson && l.assignedTo !== currentUser?.id) return false;
    return true;
  }).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    {
      id: 'queue',
      label: 'Urgent Queue',
      icon: Zap,
      badgeToday: metrics.todayFollowups,
      badgeOverdue: metrics.overdueFollowups
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    {
      id: 'trash',
      label: 'Recycle Bin',
      icon: Trash2,
      badgeTrash: trashCount
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen fixed left-0 top-0 z-40">
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">HappyLMS</h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Real Estate CRM</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badgeOverdue ? (
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700">
                    {item.badgeOverdue}
                  </span>
                ) : null}
                {item.badgeToday && !item.badgeOverdue ? (
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">
                    {item.badgeToday}
                  </span>
                ) : null}
                {item.badgeTrash && item.badgeTrash > 0 ? (
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-600">
                    {item.badgeTrash}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2 py-1">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-white shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-blue-100 text-blue-700">
                  {currentUser.role === 'admin' ? 'Admin' : 'Agent'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around py-1.5 px-1 shadow-lg backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all relative cursor-pointer ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.badgeOverdue ? (
                  <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] flex items-center justify-center font-black">
                    {item.badgeOverdue}
                  </span>
                ) : null}
                {item.badgeTrash && item.badgeTrash > 0 ? (
                  <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-slate-500 text-white rounded-full text-[8px] flex items-center justify-center font-black">
                    {item.badgeTrash}
                  </span>
                ) : null}
              </div>
              <span className="mt-0.5 text-[9px] truncate max-w-[50px]">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              logout();
            }
          }}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span className="mt-0.5 text-[9px]">Log Out</span>
        </button>
      </div>
    </>
  );
}
