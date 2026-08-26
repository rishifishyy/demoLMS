'use client';

import React from 'react';
import { useLMS } from '@/lib/store';
import { Sparkles, Star, PhoneMissed, Building, AlertCircle, Clock, Users } from 'lucide-react';

export function MetricGrid() {
  const { getMetrics, filterStatus, setFilterStatus, filterFollowup, setFilterFollowup } = useLMS();
  const metrics = getMetrics();

  const cards = [
    {
      title: 'Total Leads',
      count: metrics.total,
      sub: 'Active in pipeline',
      icon: Users,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      active: filterStatus === 'ALL' && filterFollowup === 'ALL',
      onClick: () => {
        setFilterStatus('ALL');
        setFilterFollowup('ALL');
      }
    },
    {
      title: 'New Leads',
      count: metrics.new,
      sub: 'Pending first call',
      icon: Sparkles,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      active: filterStatus === 'New Lead',
      onClick: () => {
        setFilterStatus('New Lead');
        setFilterFollowup('ALL');
      }
    },
    {
      title: 'Interested',
      count: metrics.interested,
      sub: 'High intent buyers',
      icon: Star,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      active: filterStatus === 'Interested',
      onClick: () => {
        setFilterStatus('Interested');
        setFilterFollowup('ALL');
      }
    },
    {
      title: 'Not Picked',
      count: metrics.notPicked,
      sub: 'Requires retry',
      icon: PhoneMissed,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      active: filterStatus === 'Not Picked',
      onClick: () => {
        setFilterStatus('Not Picked');
        setFilterFollowup('ALL');
      }
    },
    {
      title: 'Visits Done',
      count: metrics.visitDone,
      sub: 'Completed site tours',
      icon: Building,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      active: filterStatus === 'Visit Done',
      onClick: () => {
        setFilterStatus('Visit Done');
        setFilterFollowup('ALL');
      }
    },
    {
      title: 'Due Today',
      count: metrics.todayFollowups,
      sub: 'Scheduled follow-ups',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      active: filterFollowup === 'TODAY',
      onClick: () => {
        setFilterFollowup('TODAY');
        setFilterStatus('ALL');
      }
    },
    {
      title: 'Overdue Alerts',
      count: metrics.overdueFollowups,
      sub: 'Missed schedule',
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      active: filterFollowup === 'OVERDUE',
      onClick: () => {
        setFilterFollowup('OVERDUE');
        setFilterStatus('ALL');
      }
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.title}
            onClick={c.onClick}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              c.active
                ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
              <div className={`w-6 h-6 rounded-lg ${c.bg} ${c.color} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 leading-none mb-1">{c.count}</div>
            <div className="text-[10px] text-slate-400 truncate">{c.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
