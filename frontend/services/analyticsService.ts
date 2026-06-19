import { authService } from './authService';
import type { WorkspaceOverview } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export const analyticsService = {
  async getWorkspaceOverview(): Promise<WorkspaceOverview> {
    const res = await fetch(`${API_BASE}/api/analytics/overview`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch workspace overview');
    }
    return res.json();
  },
};
