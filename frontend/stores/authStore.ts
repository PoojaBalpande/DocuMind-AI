'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { authService, type ApiUser } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  initAuth: () => void;
  clearError: () => void;
}

/** Map backend ApiUser to frontend User type */
function mapApiUser(api: ApiUser): User {
  // Split name into firstName/lastName for the UI
  const parts = api.name.split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  return {
    id: api.id,
    email: api.email,
    firstName,
    lastName,
    role: api.is_admin ? 'admin' : 'user',
    isActive: api.is_active,
    isVerified: true,
    twoFactorEnabled: false,
    subscriptionTier: 'precision',
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login(email, password);
      const apiUser = await authService.getMe();
      const user = mapApiUser(apiUser);
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const name = `${data.firstName} ${data.lastName}`.trim();
      await authService.register({ name, email: data.email, password: data.password });
      // Auto-login after registration
      await authService.login(data.email, data.password);
      const apiUser = await authService.getMe();
      const user = mapApiUser(apiUser);
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  initAuth: () => {
    set({ isLoading: true });
    authService
      .getMe()
      .then((apiUser) => {
        const user = mapApiUser(apiUser);
        set({ user, isAuthenticated: true, isInitialized: true, isLoading: false });
      })
      .catch(() => {
        set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
      });
  },

  clearError: () => set({ error: null }),
}));
