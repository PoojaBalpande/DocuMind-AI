'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initTheme = useThemeStore((s) => s.initTheme);
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initTheme();
    initAuth();
  }, [initTheme, initAuth]);

  return <>{children}</>;
}
