'use client';

import { useThemeStore } from '@/stores/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 rounded-lg transition-all duration-200"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'light' ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
}
