'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { Users, PhoneCall, CheckCircle2, Clock, Zap, Target, TrendingUp, Award } from 'lucide-react';

export function MetricGrid() {
  const { getMetrics, currentUser, leads } = useLMS();
  const metrics = getMetrics();
  const isSalesperson = currentUser?.role === 'salesperson';

  // Calculate personal metrics for this logged-in agent
  const myLeads = leads.filter(l => !l.isArchived && l.assignedTo === currentUser?.id);
  const myVisits = myLeads.filter(l => l.status === 'Visit Done').length;
  const myInterested = myLeads.filter(l => l.status === 'Interested').length;
  let myCallsCount = 0;
  myLeads.forEach(l => {
    myCallsCount += l.timeline.filter(a => a.type === 'Call').length;
  });

  const myConversionRate = myLeads.length > 0 ? Math.round(((myVisits + myInterested) / myLeads.length) * 100) : 0;
  const dailyCallsGoal = 15;
  const callsProgress = Math.min(100, Math.round((myCallsCount / dailyCallsGoal) * 100));

  const cards = [
    {
      title: isSalesperson ? 'My Total Leads' : 'Total Leads',
      value: metrics.total,
      icon: Users,
      trend: isSalesperson ? 'Leads in your list' : 'All properties combined',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Calls Due Today',
      value: metrics.todayFollowups,
      icon: Zap,
      trend: metrics.todayFollowups > 0 ? 'Need to call today' : 'All done for today',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Missed Follow-ups',
      value: metrics.overdueFollowups,
      icon: Clock,
      trend: metrics.overdueFollowups > 0 ? 'Pending / Late calls' : '0 pending calls',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100'
    },
    {
      title: isSalesperson ? 'Interested / Visits' : 'Hot & Site Visits',
      value: (metrics.interested + metrics.visitDone),
      icon: CheckCircle2,
      trend: isSalesperson ? `${myVisits} site visits completed` : 'Interested buyers',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white rounded-2xl p-3.5 sm:p-4 border ${card.borderColor} shadow-xs flex flex-col justify-between transition-all hover:shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-tight">{card.title}</span>
                <div className={`w-8 h-8 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{card.value}</div>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">{card.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SPECIAL GRAPHIC PERFORMANCE DASHBOARD FOR TEAM AGENTS */}
      {isSalesperson && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-4 sm:p-5 text-white shadow-lg space-y-4 border border-slate-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-base">Your Personal Performance Dashboard</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Live Score
                  </span>
                </div>
                <p className="text-xs text-slate-300">Track your daily outreach targets, conversion rate & closed visits</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                Conversion Rate: <strong className="text-white text-sm">{myConversionRate}%</strong>
              </span>
            </div>
          </div>

          {/* Graphic Target Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Daily Calls Outreach Progress */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                  Calls Outreach
                </span>
                <span className="font-bold text-white">{myCallsCount} / {dailyCallsGoal}</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${callsProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">{callsProgress}% of daily dial target</span>
            </div>

            {/* Site Visits Completed */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  Site Visits Done
                </span>
                <span className="font-bold text-purple-300 text-sm">{myVisits} visits</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: myLeads.length > 0 ? `${Math.round((myVisits / myLeads.length) * 100)}%` : '0%' }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Inspected on-site with clients</span>
            </div>

            {/* High Intent Deals */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Interested Leads
                </span>
                <span className="font-bold text-emerald-300 text-sm">{myInterested} buyers</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: myLeads.length > 0 ? `${Math.round((myInterested / myLeads.length) * 100)}%` : '0%' }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Active discussions & quotes sent</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
