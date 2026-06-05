'use client';

import { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import Footer from '@/components/layout/Footer';

export default function AdminPage() {
  const { analytics, revenueData, systemHealth, userActivity, isLoading, initAnalytics } = useAnalyticsStore();

  useEffect(() => {
    initAnalytics();
  }, [initAnalytics]);

  if (isLoading || !analytics) {
    return (
      <div className="flex-1 flex items-center justify-center py-xxl">
        <div className="flex items-center gap-sm text-on-surface-variant">
          <svg className="animate-spin h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  const healthColors: Record<string, string> = {
    healthy: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-error',
    info: 'bg-secondary',
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex-1 p-lg md:p-xl space-y-xl max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div>
            <h1 className="text-headline-lg text-primary mb-xs" style={{ fontFamily: 'Inter', fontWeight: 700 }}>Analytics & Admin</h1>
            <p className="text-body-md text-on-surface-variant">Platform analytics and user management.</p>
          </div>
          <div className="flex gap-sm">
            <button className="bg-surface-container border border-outline-variant/30 px-md py-sm rounded-xl text-body-sm font-medium flex items-center gap-sm hover:bg-surface-dim transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>Export
            </button>
            <button className="primary-gradient text-on-primary px-md py-sm rounded-xl text-body-sm font-semibold flex items-center gap-sm hover:shadow-lg transition-all">
              <span className="material-symbols-outlined text-[18px]">person_add</span>Invite User
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { label: 'Total Users', value: analytics.totalUsers.toLocaleString(), icon: 'group', change: `+${analytics.userChange}%` },
            { label: 'Active Users', value: analytics.activeUsers.toLocaleString(), icon: 'person', change: '+8.3%' },
            { label: 'Total Queries', value: `${(analytics.totalQueries / 1000).toFixed(0)}K`, icon: 'chat', change: '+15.7%' },
            { label: 'Storage Used', value: `${analytics.storageUsedGB} GB`, icon: 'cloud', change: `${((analytics.storageUsedGB / analytics.storageLimitGB) * 100).toFixed(0)}%` },
          ].map((card) => (
            <div key={card.label} className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-md">
                <span className="material-symbols-outlined text-on-surface-variant">{card.icon}</span>
                <span className="text-label-md font-semibold text-secondary bg-secondary/10 px-sm py-0.5 rounded-full">{card.change}</span>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-xs">{card.label}</p>
              <p className="text-headline-md text-primary font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Revenue Trend */}
          <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
            <h2 className="text-headline-sm text-primary font-semibold mb-xl">Revenue Trend</h2>
            <div className="flex items-end justify-between gap-sm h-[220px]">
              {revenueData.map((d, i) => {
                const maxRev = Math.max(...revenueData.map((r) => r.revenue));
                const pct = (d.revenue / maxRev) * 100;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-xs">
                    <div className="w-full flex justify-center">
                      <div
                        className={`w-[70%] rounded-t-md transition-all duration-500 ${i === revenueData.length - 1 ? 'bg-secondary' : 'bg-surface-dim'}`}
                        style={{ height: `${pct * 2}px` }}
                      ></div>
                    </div>
                    <span className="text-label-md text-on-surface-variant">{d.month.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
            <h2 className="text-headline-sm text-primary font-semibold mb-xl">System Status</h2>
            <div className="space-y-lg">
              {systemHealth.map((log) => (
                <div key={log.id} className="flex items-start gap-md">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${healthColors[log.status]}`}></div>
                  <div className="flex-1">
                    <p className={`text-body-sm font-semibold ${log.status === 'error' ? 'text-error' : 'text-primary'}`}>{log.title}</p>
                    <p className="text-label-md text-on-surface-variant">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-xl pt-lg border-t border-outline-variant/10">
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface-variant">Overall Uptime</span>
                <span className="text-headline-sm text-secondary font-bold">{analytics.systemHealth}%</span>
              </div>
              <div className="w-full bg-surface-dim h-2 rounded-full mt-sm overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: `${analytics.systemHealth}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-xl">
            <h2 className="text-headline-sm text-primary font-semibold">User Management</h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search users..."
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-sm pl-xl pr-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none w-56"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-md text-body-sm text-on-surface-variant font-semibold">User</th>
                  <th className="text-left py-md text-body-sm text-on-surface-variant font-semibold">Role</th>
                  <th className="text-left py-md text-body-sm text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-md text-body-sm text-on-surface-variant font-semibold">Last Activity</th>
                  <th className="text-left py-md text-body-sm text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userActivity.map((ua) => (
                  <tr key={ua.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-lg">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-label-lg font-bold text-primary">{ua.user.firstName[0]}{ua.user.lastName[0]}</div>
                        <div>
                          <p className="text-body-sm text-primary font-semibold">{ua.user.firstName} {ua.user.lastName}</p>
                          <p className="text-label-md text-on-surface-variant">{ua.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-lg">
                      <span className={`px-md py-xs rounded-full text-label-md font-semibold border ${ua.user.role === 'admin' ? 'bg-primary/5 border-primary/20 text-primary' : ua.user.role === 'viewer' ? 'bg-secondary/5 border-secondary/20 text-secondary' : 'bg-surface-dim border-outline-variant/30 text-on-surface-variant'}`}>
                        {ua.user.role.charAt(0).toUpperCase() + ua.user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-lg">
                      <div className="flex items-center gap-xs">
                        <span className={`w-2 h-2 rounded-full ${ua.status === 'active' ? 'bg-green-500' : 'bg-outline'}`}></span>
                        <span className="text-body-sm text-on-surface-variant capitalize">{ua.status}</span>
                      </div>
                    </td>
                    <td className="py-lg text-body-sm text-on-surface-variant">{ua.lastActivity}</td>
                    <td className="py-lg">
                      <button className="text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
