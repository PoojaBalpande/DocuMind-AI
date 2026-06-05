'use client';

import ThemeToggle from '@/components/shared/ThemeToggle';
import { mockNotifications } from '@/lib/mockData';
import { useState } from 'react';

export default function TopNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm h-16 flex items-center justify-between px-lg">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search documents, chats..."
          className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-sm pl-xl pr-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-sm">
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-sm text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl p-md z-50">
              <h4 className="text-label-lg text-primary mb-md">Notifications</h4>
              {mockNotifications.map((n) => (
                <div key={n.id} className={`p-sm rounded-lg mb-xs ${n.isRead ? '' : 'bg-secondary/5'}`}>
                  <p className="text-body-sm font-medium">{n.title}</p>
                  <p className="text-label-md text-on-surface-variant">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-xs bg-surface-container-low px-md py-xs rounded-full border border-outline-variant/20">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">System Live</span>
        </div>
      </div>
    </header>
  );
}
