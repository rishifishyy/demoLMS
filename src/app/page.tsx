'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLMS } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MetricGrid } from '@/components/dashboard/metric-grid';
import { LeadTable } from '@/components/leads/lead-table';
import { LeadDrawer } from '@/components/leads/lead-drawer';
import { QuickLogDialog } from '@/components/leads/quick-log-dialog';
import { NewLeadDialog } from '@/components/leads/new-lead-dialog';
import { UrgentQueue } from '@/components/queue/urgent-queue';
import { SalesReports } from '@/components/reports/sales-reports';
import { RecycleBin } from '@/components/trash/recycle-bin';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, authLoading, activeTab, setActiveTab, getMetrics } = useLMS();

  // Strict Authentication Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Verifying secure credentials...</p>
      </div>
    );
  }

  const metrics = getMetrics();
  const urgentCount = metrics.todayFollowups + metrics.overdueFollowups;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 w-full md:ml-64 flex flex-col min-h-screen pb-20 md:pb-6">
        {/* Top Header */}
        <Header />

        {/* Page Body */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-5">
          {activeTab === 'dashboard' && (
            <>
              {/* Urgent Follow-up Alert Banner */}
              {urgentCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 leading-tight">
                        {urgentCount} Follow-ups Require Action ({metrics.overdueFollowups} Overdue, {metrics.todayFollowups} Due Today)
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-rose-700">
                        Reach out to pending buyers to advance deals.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="self-end sm:self-auto inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                  >
                    <span>Dialer Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* KPI Metric Cards */}
              <MetricGrid />

              {/* Lead Table / Mobile Cards View */}
              <LeadTable />
            </>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">All Registered Leads</h3>
                <p className="text-xs text-slate-500">
                  Search, filter, and manage customer inquiries across all properties.
                </p>
              </div>
              <LeadTable />
            </div>
          )}

          {activeTab === 'queue' && <UrgentQueue />}

          {activeTab === 'reports' && <SalesReports />}

          {activeTab === 'trash' && <RecycleBin />}
        </main>
      </div>

      {/* Slide-over Drawers & Modals */}
      <LeadDrawer />
      <QuickLogDialog />
      <NewLeadDialog />
    </div>
  );
}
