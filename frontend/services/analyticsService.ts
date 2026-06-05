// DocuMind AI — Analytics Service (Mock)

import type { Analytics, RevenueData, UserActivity, SystemHealthLog } from '@/types';
import { mockAnalytics, mockRevenueData, mockUserActivity, mockSystemHealth } from '@/lib/mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const analyticsService = {
  async getDashboardMetrics(): Promise<Analytics> {
    await delay(500);
    return mockAnalytics;
  },

  async getRevenueData(): Promise<RevenueData[]> {
    await delay(400);
    return mockRevenueData;
  },

  async getUserActivity(): Promise<UserActivity[]> {
    await delay(300);
    return mockUserActivity;
  },

  async getSystemHealth(): Promise<SystemHealthLog[]> {
    await delay(300);
    return mockSystemHealth;
  },
};
