import { authService } from './authService';
import type { AnalyticsInsights } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export const analyticsInsightsService = {
  async getInsights(): Promise<AnalyticsInsights> {
    const res = await fetch(`${API_BASE}/api/analytics/insights`, {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch workspace analytics insights');
    }
    return res.json();
  },
};
