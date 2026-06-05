// DocuMind AI — Settings Service (Mock)

import type { Settings, ApiKey } from '@/types';
import { mockApiKeys } from '@/lib/mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const settingsService = {
  async getSettings(): Promise<Settings> {
    await delay(300);
    return {
      id: 'set_001', userId: 'usr_001', theme: 'light', language: 'en',
      emailNotifications: true, pushNotifications: true, twoFactorEnabled: true,
      defaultModel: 'gpt-4o', autoSave: true,
    };
  },

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    await delay(500);
    return { id: 'set_001', userId: 'usr_001', theme: 'light', language: 'en', emailNotifications: true, pushNotifications: true, twoFactorEnabled: true, defaultModel: 'gpt-4o', autoSave: true, ...data };
  },

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
