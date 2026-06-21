'use client';

import { useEffect, useState } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useMemberStore } from '@/stores/memberStore';
import Footer from '@/components/layout/Footer';

export default function AdminPage() {
  const {
    workspaceOverview,
    analyticsInsights,
    revenueData,
    systemHealth,
    userActivity,
    isLoading: isAnalyticsLoading,
    initAnalytics,
  } = useAnalyticsStore();

  const {
    members,
    isLoading: isMemberLoading,
    fetchMembers,
    inviteMember,
    updateRole,
    removeMember,
  } = useMemberStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('viewer');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initAnalytics();
    fetchMembers();
  }, [initAnalytics, fetchMembers]);

  if (isAnalyticsLoading || isMemberLoading || !workspaceOverview || !analyticsInsights) {
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
            <button
              onClick={() => setIsInviteOpen(true)}
              className="primary-gradient text-on-primary px-md py-sm rounded-xl text-body-sm font-semibold flex items-center gap-sm hover:shadow-lg transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>Invite User
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { label: 'Total Documents', value: workspaceOverview.total_documents.toLocaleString(), icon: 'description', change: 'Live' },
            { label: 'Total Chats', value: workspaceOverview.total_chats.toLocaleString(), icon: 'forum', change: 'Live' },
            { label: 'Total Messages', value: workspaceOverview.total_messages.toLocaleString(), icon: 'chat_bubble', change: 'Live' },
            { label: 'Storage Used', value: `${workspaceOverview.storage_used_mb.toFixed(1)} MB`, icon: 'storage', change: 'Live' },
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
          <div className="flex flex-col gap-lg">
            {/* Upload Trends */}
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 flex flex-col justify-center">
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
            <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 flex flex-col justify-center">
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
                <span className="text-headline-sm text-secondary font-bold">98%</span>
              </div>
              <div className="w-full bg-surface-dim h-2 rounded-full mt-sm overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '98%' }}></div>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                {members
                  .filter(m => 
                    m.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.member_email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((member) => {
                    const initials = member.member_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <tr key={member.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-lg">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-label-lg font-bold text-primary">{initials}</div>
                            <div>
                              <p className="text-body-sm text-primary font-semibold">{member.member_name}</p>
                              <p className="text-label-md text-on-surface-variant">{member.member_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-lg">
                          <select
                            value={member.role}
                            disabled={member.role === 'owner'}
                            onChange={async (e) => {
                              const selectedRole = e.target.value as any;
                              const success = await updateRole(member.id, selectedRole);
                              if (!success) {
                                alert(useMemberStore.getState().error || 'Failed to update member role');
                              }
                            }}
                            className="bg-white border border-outline-variant/30 rounded-lg px-md py-xs text-body-xs font-semibold focus:outline-none cursor-pointer disabled:bg-surface-dim disabled:cursor-not-allowed"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="py-lg">
                          <div className="flex items-center gap-xs">
                            <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : member.status === 'pending' ? 'bg-amber-500' : 'bg-outline'}`}></span>
                            <span className="text-body-sm text-on-surface-variant capitalize">{member.status}</span>
                          </div>
                        </td>
                        <td className="py-lg text-body-sm text-on-surface-variant">{new Date(member.created_at).toLocaleDateString()}</td>
                        <td className="py-lg">
                          <button
                            disabled={member.role === 'owner'}
                            onClick={() => setMemberToRemove(member.id)}
                            className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-40 disabled:hover:text-on-surface-variant cursor-pointer disabled:cursor-not-allowed flex items-center justify-center p-xs hover:bg-error/10 rounded-lg"
                            title="Remove Member"
                          >
                            <span className="material-symbols-outlined text-[20px]">person_remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-md backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsInviteOpen(false)}></div>
          <div className="relative z-10 bg-white rounded-3xl p-6 w-[500px] max-w-[calc(100vw-32px)] shadow-xl animate-fade-in">
            <h2 className="text-headline-sm text-primary font-bold mb-md">Invite Team Member</h2>
            <div className="space-y-md mb-lg">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs font-semibold">Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-sm px-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs font-semibold">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-sm px-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs font-semibold">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full bg-white border border-outline-variant/30 rounded-xl py-sm px-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-sm">
              <button
                onClick={() => setIsInviteOpen(false)}
                className="px-lg py-sm rounded-xl text-on-surface-variant hover:bg-surface-variant/30 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!inviteName.trim() || !inviteEmail.trim()) {
                    alert('Please enter Name and Email');
                    return;
                  }
                  const success = await inviteMember({
                    member_name: inviteName.trim(),
                    member_email: inviteEmail.trim(),
                    role: inviteRole,
                  });
                  if (success) {
                    setInviteName('');
                    setInviteEmail('');
                    setInviteRole('viewer');
                    setIsInviteOpen(false);
                  } else {
                    alert(useMemberStore.getState().error || 'Failed to invite member');
                  }
                }}
                className="px-lg py-sm rounded-xl primary-gradient text-on-primary font-semibold hover:shadow-lg transition-all active:scale-95"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-md backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setMemberToRemove(null)}></div>
          <div className="relative z-10 bg-white rounded-3xl p-6 w-[450px] max-w-[calc(100vw-32px)] shadow-xl animate-fade-in">
            <h2 className="text-error text-xl font-bold mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined">delete_forever</span> Remove Team Member?
            </h2>
            <p className="mb-lg text-on-surface-variant">
              Are you sure you want to remove this member from the workspace? This will revoke all access.
            </p>
            <div className="flex justify-end gap-sm">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-lg py-sm rounded-xl text-on-surface-variant hover:bg-surface-variant/30 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const success = await removeMember(memberToRemove);
                  if (success) {
                    setMemberToRemove(null);
                  } else {
                    alert(useMemberStore.getState().error || 'Failed to remove member');
                  }
                }}
                className="px-lg py-sm rounded-xl bg-error text-on-error font-semibold hover:bg-error/90 transition-all active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
