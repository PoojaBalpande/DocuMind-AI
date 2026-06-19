'use client';

import { create } from 'zustand';
import type { WorkspaceOverview, RevenueData, UserActivity, SystemHealthLog, AnalyticsInsights } from '@/types';
import { analyticsService } from '@/services/analyticsService';
import { analyticsInsightsService } from '@/services/analyticsInsightsService';
import { mockRevenueData, mockUserActivity, mockSystemHealth } from '@/lib/mockData';

interface AnalyticsState {
  workspaceOverview: WorkspaceOverview | null;
  analyticsInsights: AnalyticsInsights | null;
  revenueData: RevenueData[];
  userActivity: UserActivity[];
  systemHealth: SystemHealthLog[];
  isLoading: boolean;
  error: string | null;
  fetchWorkspaceOverview: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  initAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  workspaceOverview: null,
  analyticsInsights: null,
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

  fetchInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await analyticsInsightsService.getInsights();
      set({ analyticsInsights: data, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspace insights';
      set({ error: message, isLoading: false });
    }
  },

  initAnalytics: async () => {
    // Cache: Only fetch workspaceOverview & insights if not already fetched
    const hasOverview = get().workspaceOverview;
    const hasInsights = get().analyticsInsights;

    if (!hasOverview || !hasInsights) {
      set({ isLoading: true, error: null });
      try {
        const [overview, insights] = await Promise.all([
          hasOverview ? Promise.resolve(hasOverview) : analyticsService.getWorkspaceOverview(),
          hasInsights ? Promise.resolve(hasInsights) : analyticsInsightsService.getInsights(),
        ]);
        set({
          workspaceOverview: overview,
          analyticsInsights: insights,
          revenueData: mockRevenueData,
          userActivity: mockUserActivity,
          systemHealth: mockSystemHealth,
          isLoading: false,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch workspace analytics';
        set({
          error: message,
          revenueData: mockRevenueData,
          userActivity: mockUserActivity,
          systemHealth: mockSystemHealth,
          isLoading: false,
        });
      }
    } else {
      // Ensure mock display layout is populated even when utilizing cached data
      set({
        revenueData: mockRevenueData,
        userActivity: mockUserActivity,
        systemHealth: mockSystemHealth,
      });
    }
  },
}));
