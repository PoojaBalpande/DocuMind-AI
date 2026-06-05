'use client';

import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('documind-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documind-theme') as 'light' | 'dark' | null;
      const theme = saved || 'light';
      set({ theme });
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },
}));
