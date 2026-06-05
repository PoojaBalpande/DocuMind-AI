'use client';

import { create } from 'zustand';
import type { Analytics, RevenueData, UserActivity, SystemHealthLog } from '@/types';
import { mockAnalytics, mockRevenueData, mockUserActivity, mockSystemHealth } from '@/lib/mockData';

interface AnalyticsState {
  analytics: Analytics | null;
  revenueData: RevenueData[];
  userActivity: UserActivity[];
  systemHealth: SystemHealthLog[];
  isLoading: boolean;
  initAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analytics: null,
  revenueData: [],
  userActivity: [],
  systemHealth: [],
  isLoading: false,

  initAnalytics: () => {
    set({ isLoading: true });
    // Simulate loading
    setTimeout(() => {
      set({
        analytics: mockAnalytics,
        revenueData: mockRevenueData,
        userActivity: mockUserActivity,
        systemHealth: mockSystemHealth,
        isLoading: false,
      });
    }, 500);
  },
}));
