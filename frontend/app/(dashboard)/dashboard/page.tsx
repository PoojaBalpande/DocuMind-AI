'use client';

import { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import Footer from '@/components/layout/Footer';

export default function DashboardPage() {
  const { workspaceOverview, analyticsInsights, revenueData, systemHealth, userActivity, isLoading, initAnalytics } = useAnalyticsStore();

  useEffect(() => {
    initAnalytics();
  }, [initAnalytics]);

  if (isLoading || !workspaceOverview || !analyticsInsights) {
    return (
      <div className="flex-1 flex items-center justify-center py-xxl">
        <div className="flex items-center gap-sm text-on-surface-variant">
          <svg className="animate-spin h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: 'description', label: 'Total Documents', value: workspaceOverview.total_documents.toLocaleString(), change: 'Live', color: 'text-secondary' },
    { icon: 'forum', label: 'Total Chats', value: workspaceOverview.total_chats.toLocaleString(), change: 'Live', color: 'text-secondary' },
    { icon: 'chat_bubble', label: 'Total Messages', value: workspaceOverview.total_messages.toLocaleString(), change: 'Live', color: 'text-secondary' },
    { icon: 'storage', label: 'Storage Used', value: `${workspaceOverview.storage_used_mb.toFixed(1)} MB / 1 TB used`, change: 'Live', color: 'text-secondary' },
  ];

  const healthColors: Record<string, string> = {
    healthy: 'border-l-secondary text-secondary',
    warning: 'border-l-amber-500 text-amber-600',
    error: 'border-l-error text-error',
    info: 'border-l-outline-variant text-on-surface-variant',
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex-1 p-lg md:p-xl space-y-xl max-w-[1400px]">
        {/* Header */}
        <div>
          <h1 className="text-headline-lg text-primary mb-xs" style={{ fontFamily: 'Inter', fontWeight: 700 }}>System Dashboard</h1>
          <p className="text-body-md text-on-surface-variant">Precision monitoring for Cold Winter environments.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {statCards.map((card) => (
            <div key={card.label} className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-md">
                <span className="material-symbols-outlined text-on-surface-variant">{card.icon}</span>
                <span className={`text-label-md font-semibold px-sm py-0.5 rounded-full ${card.badgeColor || 'bg-secondary/10 text-secondary'}`}>
                  {card.change}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-xs">{card.label}</p>
              <p className="text-headline-md text-primary font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Usage Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Column 1: Recent Activity */}
          <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 flex flex-col h-[400px]">
            <h2 className="text-headline-sm text-primary font-semibold mb-lg flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-secondary">history</span> Recent Activity
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-md">
              {analyticsInsights.recent_activity.slice(0, 10).map((activity, idx) => {
                const icon = activity.type === 'document_upload' ? '📄' : activity.type === 'chat_created' ? '💬' : '❓';
                return (
                  <div key={idx} className="flex gap-sm items-start hover:bg-surface-container-low/30 p-xs rounded-lg transition-colors">
                    <span className="text-[18px] mt-[2px]">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-primary font-medium truncate">{activity.description}</p>
                      <p className="text-[10px] text-on-surface-variant opacity-70">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {analyticsInsights.recent_activity.length === 0 && (
                <p className="text-body-sm text-on-surface-variant opacity-70 italic text-center py-xl">No recent activity.</p>
              )}
            </div>
          </div>

          {/* Column 2: Trends */}
          <div className="space-y-lg flex flex-col h-[400px] justify-between">
            {/* Upload Trends */}
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 flex-1 flex flex-col justify-center">
              <h2 className="text-headline-sm text-primary font-semibold mb-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px] text-secondary">trending_up</span> Upload Trends
              </h2>
              <div className="grid grid-cols-3 gap-sm">
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold mb-xs">TODAY</p>
                  <p className="text-headline-md text-primary font-bold">{analyticsInsights.upload_trends.today}</p>
                </div>
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold mb-xs">THIS WEEK</p>
                  <p className="text-headline-md text-primary font-bold">{analyticsInsights.upload_trends.week}</p>
                </div>
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold mb-xs">THIS MONTH</p>
                  <p className="text-headline-md text-primary font-bold">{analyticsInsights.upload_trends.month}</p>
                </div>
              </div>
            </div>
            {/* Chat Trends */}
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 flex-1 flex flex-col justify-center">
              <h2 className="text-headline-sm text-primary font-semibold mb-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[20px] text-secondary">forum</span> Chat Trends
              </h2>
              <div className="grid grid-cols-3 gap-sm">
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold mb-xs">TODAY</p>
                  <p className="text-headline-md text-primary font-bold">{analyticsInsights.chat_trends.today}</p>
                </div>
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold mb-xs">THIS WEEK</p>
                  <p className="text-headline-md text-primary font-bold">{analyticsInsights.chat_trends.week}</p>
                </div>
                <div className="bg-surface-container-low p-md rounded-xl text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold mb-xs">THIS MONTH</p>
                  <p className="text-headline-md text-primary font-bold">{analyticsInsights.chat_trends.month}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Top Active Chats */}
          <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 flex flex-col h-[400px]">
            <h2 className="text-headline-sm text-primary font-semibold mb-lg flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px] text-secondary">leaderboard</span> Most Active Chats
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-md">
              {analyticsInsights.top_chats.map((chat) => (
                <div key={chat.session_id} className="flex justify-between items-center p-sm bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <div className="flex-1 min-w-0 pr-sm">
                    <p className="text-body-sm text-primary font-semibold truncate">{chat.title}</p>
                  </div>
                  <span className="text-label-md bg-secondary/15 text-secondary px-sm py-xxs rounded-full font-bold shrink-0">
                    {chat.message_count} messages
                  </span>
                </div>
              ))}
              {analyticsInsights.top_chats.length === 0 && (
                <p className="text-body-sm text-on-surface-variant opacity-70 italic text-center py-xl">No active chats.</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Chart + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Revenue Metrics */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
            <div className="flex items-center justify-between mb-xl">
              <h2 className="text-headline-sm text-primary font-semibold">Revenue Metrics</h2>
              <div className="flex gap-xs">
                <button className="bg-primary-container text-on-primary px-md py-xs rounded-lg text-label-lg font-semibold">Month</button>
                <button className="text-on-surface-variant px-md py-xs rounded-lg text-label-lg hover:bg-surface-variant/30 transition-colors">Year</button>
              </div>
            </div>
            {/* Chart */}
            <div className="flex items-end justify-between gap-sm h-[280px] px-sm">
              {revenueData.map((d, i) => {
                const maxRevenue = Math.max(...revenueData.map((r) => r.revenue));
                const heightPercent = (d.revenue / maxRevenue) * 100;
                const isLast = i === revenueData.length - 1;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-sm">
                    {isLast && (
                      <div className="bg-primary-container text-on-primary text-label-md font-bold px-sm py-0.5 rounded-md">
                        ${Math.round(d.revenue / 1000)}k
                      </div>
                    )}
                    <div className="w-full flex justify-center">
                      <div
                        className={`w-[60%] rounded-t-lg transition-all duration-500 ${isLast ? 'bg-primary-container' : 'bg-surface-dim'}`}
                        style={{ height: `${Math.max(heightPercent * 2.4, 20)}px` }}
                      ></div>
                    </div>
                    <span className="text-label-md text-on-surface-variant">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health Logs */}
          <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
            <h2 className="text-headline-sm text-primary font-semibold mb-xl">System Health Logs</h2>
            <div className="space-y-lg">
              {systemHealth.map((log) => (
                <div key={log.id} className={`border-l-4 pl-md ${healthColors[log.status] || ''}`}>
                  <p className="text-body-sm font-semibold text-primary">{log.title}</p>
                  <p className="text-label-md text-on-surface-variant">{log.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent User Activity */}
        <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-xl">
            <h2 className="text-headline-sm text-primary font-semibold">Recent User Activity</h2>
            <div className="flex gap-sm items-center">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search members..."
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-sm pl-xl pr-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all w-56"
                />
              </div>
              <button className="flex items-center gap-xs bg-surface-container-low px-md py-sm rounded-lg text-body-sm text-on-surface-variant border border-outline-variant/20 hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-md text-body-sm text-on-surface-variant font-semibold">Name</th>
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
                        <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-label-lg font-bold text-primary">
                          {ua.user.firstName[0]}{ua.user.lastName[0]}
                        </div>
                        <div>
                          <p className="text-body-sm text-primary font-semibold">{ua.user.firstName} {ua.user.lastName}</p>
                          <p className="text-label-md text-on-surface-variant">{ua.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-lg">
                      <span className={`px-md py-xs rounded-full text-label-md font-semibold border ${
                        ua.user.role === 'admin' ? 'bg-primary/5 border-primary/20 text-primary' :
                        ua.user.role === 'viewer' ? 'bg-secondary/5 border-secondary/20 text-secondary' :
                        'bg-surface-dim border-outline-variant/30 text-on-surface-variant'
                      }`}>
                        {ua.user.role.charAt(0).toUpperCase() + ua.user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-lg">
                      <div className="flex items-center gap-xs">
                        <span className={`w-2 h-2 rounded-full ${ua.status === 'active' ? 'bg-green-500' : ua.status === 'away' ? 'bg-amber-500' : 'bg-outline'}`}></span>
                        <span className="text-body-sm text-on-surface-variant capitalize">{ua.status === 'active' ? 'Active' : ua.status === 'away' ? 'Away' : 'Offline'}</span>
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

          <div className="flex justify-between items-center mt-lg pt-md border-t border-outline-variant/10">
            <p className="text-body-sm text-on-surface-variant">Showing {userActivity.length} of 150 users</p>
            <div className="flex gap-xs">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-dim transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
