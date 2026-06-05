'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { mockUser } from '@/lib/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    const user = { ...mockUser, email };
    set({ user, isAuthenticated: true, isLoading: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem('documind-session', JSON.stringify(user));
    }
    return true;
  },

  signup: async (data) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1500));
    const user: User = {
      ...mockUser,
      id: 'usr_' + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
      subscriptionTier: 'starter',
    };
    set({ user, isAuthenticated: true, isLoading: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem('documind-session', JSON.stringify(user));
    }
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('documind-session');
    }
  },

  initAuth: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documind-session');
      if (saved) {
        try {
          const user = JSON.parse(saved) as User;
          set({ user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('documind-session');
        }
      }
    }
  },
}));
