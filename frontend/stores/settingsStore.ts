'use client';

import { create } from 'zustand';
import type { UserSettings, SettingsUpdateRequest } from '@/types';
import { settingsService } from '@/services/settingsService';

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: SettingsUpdateRequest) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.getSettings();
      set({ settings, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch settings';
      set({ isLoading: false, error: message });
    }
  },

  updateSettings: async (data: SettingsUpdateRequest) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.updateSettings(data);
      set({ settings, isLoading: false });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update settings';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  resetSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.resetSettings();
      set({ settings, isLoading: false });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset settings';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
