'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { Download, TrendingUp, Users, Target } from 'lucide-react';

export function SalesReports() {
  const { leads, users, exportCSV } = useLMS();

  const activeLeads = leads.filter((l) => !l.isArchived);
  const total = activeLeads.length;

  const newCount = activeLeads.filter((l) => l.status === 'New Lead').length;
  const interestedCount = activeLeads.filter((l) => l.status === 'Interested').length;
  const visitCount = activeLeads.filter((l) => l.status === 'Visit Done').length;
  const junkCount = activeLeads.filter((l) => l.status === 'Junk').length;

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  activeLeads.forEach((l) => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  // Salesperson stats
  const salesStats = users
    .filter((u) => u.role === 'salesperson')
    .map((sp) => {
      const assigned = activeLeads.filter((l) => l.assignedTo === sp.id);
      const visits = assigned.filter((l) => l.status === 'Visit Done').length;
      const interested = assigned.filter((l) => l.status === 'Interested').length;
      const rate = assigned.length > 0 ? Math.round(((visits + interested) / assigned.length) * 100) : 0;
      let callsLogged = 0;
      assigned.forEach((l) => {
        callsLogged += l.timeline.filter((a) => a.type === 'Call' && a.userId === sp.id).length;
      });

      return {
        user: sp,
        assignedCount: assigned.length,
        callsLogged,
        visits,
        interested,
        conversionRate: rate
      };
    });

  const funnelSteps = [
    { label: 'Inquiries Captured', count: total, color: 'bg-blue-600' },
    { label: 'Engaged / Contacted', count: total - newCount - junkCount, color: 'bg-cyan-600' },
    { label: 'Qualified Interested', count: interestedCount + visitCount, color: 'bg-emerald-600' },
    { label: 'Site Visits Done', count: visitCount, color: 'bg-purple-600' }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Export Button */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base mb-0.5">Sales Conversion & Team Reports</h3>
          <p className="text-xs text-slate-500">Pipeline conversion health, lead channels & salesperson rankings</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Leads to CSV</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pipeline Funnel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">Lead Conversion Funnel</h4>
          </div>
          <div className="space-y-3 pt-1">
            {funnelSteps.map((step) => {
              const pct = total > 0 ? Math.round((step.count / total) * 100) : 0;
              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{step.label}</span>
                    <span>
                      {step.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${step.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source Channels */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-900 text-sm">Leads by Acquisition Channel</h4>
          </div>
          <div className="space-y-3 pt-1">
            {Object.entries(sourceMap).map(([src, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={src} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{src}</span>
                    <span>
                      {count} leads ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Salesperson Performance Leaderboard */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <h4 className="font-bold text-slate-900 text-sm">Sales Team Performance Leaderboard</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Salesperson</th>
                <th className="py-3 px-4">Assigned Leads</th>
                <th className="py-3 px-4">Calls Logged</th>
                <th className="py-3 px-4">Site Visits</th>
                <th className="py-3 px-4">Interested Deals</th>
                <th className="py-3 px-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesStats.map((stat) => (
                <tr key={stat.user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img src={stat.user.avatar} alt={stat.user.name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{stat.user.name}</p>
                        <span className="text-[10px] text-slate-400">{stat.user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{stat.assignedCount}</td>
                  <td className="py-3 px-4 text-slate-600">{stat.callsLogged}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                      {stat.visits} visits
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {stat.interested} deals
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{stat.conversionRate}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stat.conversionRate}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
