'use client';

import React, { useState } from 'react';
import { useLMS } from '@/lib/store';
import { 
  Download, 
  Users, 
  Target, 
  Award,
  Filter,
  BarChart2,
  PieChart,
  Lock
} from 'lucide-react';

export function SalesReports() {
  const { leads, users, exportCSV, currentUser } = useLMS();
  const isAdmin = currentUser?.role === 'admin';
  const isSalesperson = currentUser?.role === 'salesperson';

  // If salesperson, FORCED to only their own ID. Admin can choose ALL or any agent.
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    isAdmin ? 'ALL' : (currentUser?.id || 'SELF')
  );

  const activeLeads = leads.filter((l) => !l.isArchived);

  // Strict role filter: Salespersons CANNOT see other people's leads under any condition
  const effectiveAgentId = isAdmin ? selectedAgentId : (currentUser?.id || '');

  const filteredLeads = effectiveAgentId === 'ALL' 
    ? activeLeads 
    : activeLeads.filter(l => l.assignedTo === effectiveAgentId);

  const total = filteredLeads.length;
  const newCount = filteredLeads.filter((l) => l.status === 'New Lead').length;
  const interestedCount = filteredLeads.filter((l) => l.status === 'Interested').length;
  const visitCount = filteredLeads.filter((l) => l.status === 'Visit Done').length;
  const notPickedCount = filteredLeads.filter((l) => l.status === 'Not Picked').length;
  const junkCount = filteredLeads.filter((l) => l.status === 'Junk').length;

  const contactedCount = total - newCount - junkCount;
  const qualifiedCount = interestedCount + visitCount;

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  filteredLeads.forEach((l) => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  const sourceColors: Record<string, string> = {
    'WHATSAPP': '#22c55e',
    'INSTAGRAM': '#ec4899',
    'REFERRAL': '#f59e0b',
    'CALL INQUIRY': '#3b82f6',
    'OTHER': '#64748b'
  };

  // Funnel Stage Data
  const funnelStages = [
    {
      stage: '1. Total Inquiries Received',
      count: total,
      pct: 100,
      gradient: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      desc: isSalesperson ? 'Leads assigned to you' : 'Total leads received'
    },
    {
      stage: '2. Spoke With Customer',
      count: contactedCount > 0 ? contactedCount : 0,
      pct: total > 0 ? Math.round((contactedCount / total) * 100) : 0,
      gradient: 'from-cyan-500 to-blue-600',
      bgLight: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      desc: 'Spoke on Call or WhatsApp'
    },
    {
      stage: '3. Interested / Hot Buyers',
      count: qualifiedCount,
      pct: total > 0 ? Math.round((qualifiedCount / total) * 100) : 0,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      desc: 'Interested buyers & price sent'
    },
    {
      stage: '4. Site Visits Done',
      count: visitCount,
      pct: total > 0 ? Math.round((visitCount / total) * 100) : 0,
      gradient: 'from-purple-600 to-pink-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      desc: 'Completed property site visits'
    }
  ];

  // Salespersons list (For Admin only)
  const salesTeam = users.filter(u => u.role === 'salesperson' || u.role === 'admin');

  // Spotlight user: either chosen agent or current salesperson
  const spotlightUser = isAdmin 
    ? (selectedAgentId !== 'ALL' ? users.find(u => u.id === selectedAgentId) : null)
    : currentUser;

  const totalCalls = filteredLeads.reduce((acc, l) => {
    return acc + l.timeline.filter(a => a.type === 'Call').length;
  }, 0);

  const conversionRate = total > 0 ? Math.round((qualifiedCount / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {isAdmin ? 'Sales Performance & Lead Progress' : 'My Performance & Leads Progress'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'Overall company leads, where they came from & team performance'
              : 'Real-time tracking of your assigned leads, calls and site visits'
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Agent Filter Selector: ADMIN ONLY! */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="ALL">🏢 Entire Company (All Team)</option>
                {salesTeam.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    👤 {sp.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Salesperson: Static indicator (Locked to Self) */
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 text-blue-800 text-xs font-bold shadow-xs">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>👤 {currentUser?.name} (Personal View)</span>
            </div>
          )}

          {/* Export CSV: ADMIN ONLY! */}
          {isAdmin && (
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Spotlight Card: Shown for Agent ALWAYS, or for Admin when an agent is selected */}
      {spotlightUser && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={spotlightUser.avatar}
                alt={spotlightUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black tracking-tight">
                    {isSalesperson ? `${spotlightUser.name} (Your Performance)` : spotlightUser.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase">
                    {spotlightUser.role}
                  </span>
                </div>
                <p className="text-xs text-blue-100">{spotlightUser.email} &bull; Active</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20">
              <Award className="w-5 h-5 text-amber-300" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-blue-200 block font-bold">Conversion Rate</span>
                <span className="text-base font-black text-white">{conversionRate}%</span>
              </div>
            </div>
          </div>

          {/* Key KPI Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-medium text-blue-200 block">Assigned Leads</span>
              <span className="text-xl font-bold">{total}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-medium text-blue-200 block">Calls Logged</span>
              <span className="text-xl font-bold">{totalCalls}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-medium text-blue-200 block">Site Visits Done</span>
              <span className="text-xl font-bold text-amber-300">{visitCount}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] font-medium text-blue-200 block">Qualified Interested</span>
              <span className="text-xl font-bold text-emerald-300">{interestedCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Graphical Funnel & Channel Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* GRAPHICAL LEAD CONVERSION FUNNEL (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">
                {isSalesperson ? 'My Lead Conversion Funnel' : 'Visual Lead Conversion Funnel'}
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {total} Total Leads
            </span>
          </div>

          {/* Visual Funnel Blocks */}
          <div className="space-y-3 pt-2">
            {funnelStages.map((stg, idx) => (
              <div key={stg.stage} className="relative group">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                      #{idx + 1}
                    </span>
                    {stg.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-extrabold">{stg.count} leads</span>
                    <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + stg.bgLight + ' ' + stg.textColor + ' border ' + stg.borderColor}>
                      {stg.pct}%
                    </span>
                  </div>
                </div>

                <div className="h-9 bg-slate-100 rounded-xl overflow-hidden p-1 flex items-center relative shadow-inner">
                  <div
                    className={'h-full bg-gradient-to-r ' + stg.gradient + ' rounded-lg transition-all duration-700 flex items-center justify-between px-3 text-white font-bold text-xs shadow-sm'}
                    style={{ width: total > 0 ? Math.max(10, stg.pct) + '%' : '0%' }}
                  >
                    <span className="truncate text-[11px]">{stg.desc}</span>
                    {stg.pct > 0 && <span className="text-[10px] font-black">{stg.pct}%</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Funnel Stage Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">New Leads</span>
              <span className="text-sm font-black text-blue-600">{newCount}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Not Picked</span>
              <span className="text-sm font-black text-amber-600">{notPickedCount}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Interested Buyers</span>
              <span className="text-sm font-black text-emerald-600">{interestedCount}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Site Visits Done</span>
              <span className="text-sm font-black text-purple-600">{visitCount}</span>
            </div>
          </div>
        </div>

        {/* GRAPHICAL ACQUISITION CHANNELS (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Where Leads Came From (Source)</h4>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{Object.keys(sourceMap).length} Sources</span>
            </div>

            {/* Visual Colored Channel Progress Bars */}
            <div className="space-y-3 pt-1">
              {Object.keys(sourceMap).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  {isSalesperson ? 'No leads assigned to you yet.' : 'No lead sources recorded yet.'}
                </div>
              ) : (
                Object.entries(sourceMap).map(([src, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const color = sourceColors[src] || '#3b82f6';
                  return (
                    <div key={src} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          {src}
                        </span>
                        <span className="text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: pct + '%', backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
            <span className="text-sm">💡</span>
            <p>
              {isSalesperson 
                ? 'Keep your success high by completing site visits for interested buyers!'
                : 'Track which sources bring the most site visits to focus your advertising.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* SALES TEAM LEADERBOARD: VISIBLE TO ADMIN ONLY! */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Team Performance & Deals Summary (Admin View)
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{salesTeam.length} Team Members</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Team Member</th>
                  <th className="py-3.5 px-4">Assigned Leads</th>
                  <th className="py-3.5 px-4">Calls Done</th>
                  <th className="py-3.5 px-4">Site Visits</th>
                  <th className="py-3.5 px-4">Interested Deals</th>
                  <th className="py-3.5 px-4">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesTeam.map((sp) => {
                  const assigned = activeLeads.filter(l => l.assignedTo === sp.id);
                  const visits = assigned.filter(l => l.status === 'Visit Done').length;
                  const interested = assigned.filter(l => l.status === 'Interested').length;
                  const rate = assigned.length > 0 ? Math.round(((visits + interested) / assigned.length) * 100) : 0;
                  let callsLogged = 0;
                  assigned.forEach(l => {
                    callsLogged += l.timeline.filter(a => a.type === 'Call').length;
                  });

                  const isTopPerformer = rate >= 30 && assigned.length > 0;

                  return (
                    <tr 
                      key={sp.id} 
                      onClick={() => setSelectedAgentId(sp.id)}
                      className={'hover:bg-blue-50/40 transition-colors cursor-pointer ' + (selectedAgentId === sp.id ? 'bg-blue-50/70 font-semibold' : '')}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={sp.avatar} 
                            alt={sp.name} 
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-xs" 
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{sp.name}</p>
                              {isTopPerformer && (
                                <span className="text-amber-500 text-xs" title="Top Performer">⭐</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{sp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{assigned.length} leads</td>
                      <td className="py-3.5 px-4 text-slate-600">{callsLogged} calls</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                          {visits} visits
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {interested} deals
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">{rate}%</span>
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                              style={{ width: rate + '%' }} 
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
