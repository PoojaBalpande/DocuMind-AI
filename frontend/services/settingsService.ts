// DocuMind AI — Settings Service (Real API)
// V9: Connects to FastAPI backend settings endpoints

import type { UserSettings, SettingsUpdateRequest, ApiKey } from '@/types';
import { authService } from '@/services/authService';
import { mockApiKeys } from '@/lib/mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export const settingsService = {
  // ── Real API methods (V9) ───────────────────────────────────────

  async getSettings(): Promise<UserSettings> {
    const res = await fetch(`${API_BASE}/api/settings`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch settings' }));
      throw new Error(err.detail || 'Failed to fetch settings');
    }
    return res.json();
  },

  async updateSettings(data: SettingsUpdateRequest): Promise<UserSettings> {
    const res = await fetch(`${API_BASE}/api/settings`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update settings' }));
      throw new Error(err.detail || 'Failed to update settings');
    }
    return res.json();
  },

  async resetSettings(): Promise<UserSettings> {
    const res = await fetch(`${API_BASE}/api/settings/reset`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to reset settings' }));
      throw new Error(err.detail || 'Failed to reset settings');
    }
    return res.json();
  },

  // ── Mock methods (preserved for other settings tabs) ────────────

  async updatePassword(_current: string, _newPassword: string): Promise<boolean> {
    await delay(800);
    return true;
  },

  async getApiKeys(): Promise<ApiKey[]> {
    await delay(300);
    return mockApiKeys;
  },

  async createApiKey(name: string): Promise<ApiKey> {
    await delay(500);
    return { id: 'key_' + Date.now(), name, keyPreview: 'dm_live_••••••••' + Math.random().toString(36).slice(2, 6), createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
  },

  async deleteApiKey(id: string): Promise<void> {
    await delay(300);
    console.log('Deleted API key:', id);
  },
};

