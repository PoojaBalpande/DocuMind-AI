'use client';

import { create } from 'zustand';
import type { WorkspaceOverview, RevenueData, UserActivity, SystemHealthLog } from '@/types';
import { analyticsService } from '@/services/analyticsService';
import { mockRevenueData, mockUserActivity, mockSystemHealth } from '@/lib/mockData';

interface AnalyticsState {
  workspaceOverview: WorkspaceOverview | null;
  revenueData: RevenueData[];
  userActivity: UserActivity[];
  systemHealth: SystemHealthLog[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaceOverview: () => Promise<void>;
  initAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  workspaceOverview: null,
  revenueData: [],
  userActivity: [],
  systemHealth: [],
  isLoading: false,
  error: null,

  fetchWorkspaceOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsService.getWorkspaceOverview();
      set({ workspaceOverview: data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspace overview';
      set({ error: message, isLoading: false });
    }
  },

  initAnalytics: async () => {
    // Cache: Only fetch workspaceOverview if not already fetched
    if (!get().workspaceOverview) {
      set({ isLoading: true, error: null });
      try {
        const data = await analyticsService.getWorkspaceOverview();
        set({
          workspaceOverview: data,
          revenueData: mockRevenueData,
          userActivity: mockUserActivity,
          systemHealth: mockSystemHealth,
          isLoading: false,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch workspace overview';
        set({
          error: message,
          revenueData: mockRevenueData,
          userActivity: mockUserActivity,
          systemHealth: mockSystemHealth,
          isLoading: false,
        });
      }
    } else {
      // Ensure mock display layout is populated even when utilizing cached overview
      set({
        revenueData: mockRevenueData,
        userActivity: mockUserActivity,
        systemHealth: mockSystemHealth,
      });
    }
  },
}));
