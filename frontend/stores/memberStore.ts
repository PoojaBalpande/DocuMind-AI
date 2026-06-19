import { create } from 'zustand';
import type { Member, CreateMemberRequest } from '@/types';
import { memberService } from '@/services/memberService';

interface MemberState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  inviteMember: (data: CreateMemberRequest) => Promise<boolean>;
  updateRole: (memberId: string, role: 'owner' | 'admin' | 'member' | 'viewer') => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const members = await memberService.getMembers();
      set({ members, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch members';
      set({ isLoading: false, error: message });
    }
  },

  inviteMember: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMember = await memberService.inviteMember(data);
      set((state) => ({
        members: [...state.members, newMember],
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to invite member';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateRole: async (memberId, role) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await memberService.updateRole(memberId, role);
      set((state) => ({
        members: state.members.map((m) => (m.id === memberId ? updated : m)),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  removeMember: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      await memberService.removeMember(memberId);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        isLoading: false,
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove member';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
