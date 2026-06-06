// DocuMind AI — Auth Service (Real API)
// Connects to FastAPI backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('documind-token');
  }
  return null;
}

function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('documind-token', token);
  }
}

function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('documind-token');
  }
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<ApiUser> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    setToken(data.access_token);
    return data;
  },

  async getMe(): Promise<ApiUser> {
    const token = getToken();
    if (!token) throw new Error('No token');
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      removeToken();
      throw new Error('Session expired');
    }
    return res.json();
  },

  async logout(): Promise<void> {
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    removeToken();
  },

  getToken,
  setToken,
  removeToken,
};
