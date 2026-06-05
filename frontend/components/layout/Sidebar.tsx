'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Knowledge Base', icon: 'folder_shared', href: '/documents' },
  { label: 'Chat AI', icon: 'forum', href: '/chat' },
  { label: 'Analytics', icon: 'query_stats', href: '/admin' },
  { label: 'Members', icon: 'group', href: '/admin' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] z-40 bg-surface-container-low/90 backdrop-blur-2xl border-r border-outline-variant/10 shadow-xl flex flex-col py-lg px-md gap-sm transition-all duration-300">
      {/* Logo */}
      <div className="flex items-center gap-md px-sm mb-xl">
        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary-container">blur_on</span>
        </div>
        <div>
          <h1 className="text-headline-sm font-bold text-primary" style={{ fontFamily: 'Inter' }}>DocuMind AI</h1>
          <p className="text-body-sm text-on-surface-variant opacity-70">Enterprise Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-xs">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 active:translate-x-1 ${
                isActive
                  ? 'bg-secondary/10 text-secondary border-l-4 border-secondary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col gap-xs pt-lg border-t border-outline-variant/10">
        {/* New Document Button */}
        <Link
          href="/documents"
          className="flex items-center justify-center gap-sm px-md py-sm bg-primary-container text-on-primary rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Document
        </Link>

        <Link href="/settings" className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant/30 transition-all">
          <span className="material-symbols-outlined">help</span>
          <span className="text-body-md">Help Center</span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-md px-md py-md mt-sm bg-surface-container rounded-xl">
          {user?.avatarUrl ? (
            <img alt="User" className="w-10 h-10 rounded-full border border-outline-variant object-cover" src={user.avatarUrl} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-label-lg font-bold text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-label-lg text-on-surface truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-body-sm text-on-surface-variant truncate">{user?.role === 'admin' ? 'Admin Access' : 'Member'}</p>
          </div>
          <button onClick={logout} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors">
            logout
          </button>
        </div>
      </div>
    </aside>
  );
}
