// DocuMind AI — Auth Service (Mock)
// Prepared for future FastAPI migration

import type { User } from '@/types';
import { mockUser } from '@/lib/mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    await delay(1200);
    // Future: POST ${API_BASE}/auth/login
    return { user: { ...mockUser, email }, token: 'mock_jwt_token_' + Date.now() };
  },

  async signup(data: { firstName: string; lastName: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    await delay(1500);
    // Future: POST ${API_BASE}/auth/signup
    const user: User = { ...mockUser, ...data, id: 'usr_' + Date.now(), role: 'user', subscriptionTier: 'starter' };
    return { user, token: 'mock_jwt_token_' + Date.now() };
  },

  async logout(): Promise<void> {
    await delay(300);
    // Future: POST ${API_BASE}/auth/logout
  },

  async getSession(): Promise<User | null> {
    await delay(200);
    // Future: GET ${API_BASE}/auth/session
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documind-session');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  },

  // Placeholder for future use
  _apiBase: API_BASE,
};
