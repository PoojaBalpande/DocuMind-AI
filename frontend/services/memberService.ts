import { authService } from './authService';
import type { Member, CreateMemberRequest } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export const memberService = {
  async getMembers(): Promise<Member[]> {
    const res = await fetch(`${API_BASE}/api/members`, {
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch workspace members');
    }
    return res.json();
  },

  async inviteMember(data: CreateMemberRequest): Promise<Member> {
    const res = await fetch(`${API_BASE}/api/members`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to invite member' }));
      throw new Error(err.detail || 'Failed to invite member');
    }
    return res.json();
  },

  async updateRole(memberId: string, role: 'owner' | 'admin' | 'member' | 'viewer'): Promise<Member> {
    const res = await fetch(`${API_BASE}/api/members/${memberId}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update member role' }));
      throw new Error(err.detail || 'Failed to update member role');
    }
    return res.json();
  },

  async removeMember(memberId: string): Promise<Member> {
    const res = await fetch(`${API_BASE}/api/members/${memberId}`, {
      method: 'DELETE',
      headers: authHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to remove member' }));
      throw new Error(err.detail || 'Failed to remove member');
    }
    return res.json();
  },
};
