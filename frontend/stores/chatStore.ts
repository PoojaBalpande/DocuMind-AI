'use client';

import { create } from 'zustand';
import type { ChatSession, Message } from '@/types';
import { chatService, type ApiChatSession } from '@/services/chatService';
import { mockAIResponses } from '@/lib/mockData';

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: Message[];
  isGenerating: boolean;
  setActiveSession: (id: string) => void;
  createNewChat: (title?: string) => string;
  sendMessage: (content: string) => void;
  regenerateLastResponse: () => void;
  deleteSession: (id: string) => void;
  initChat: () => void;
}

/** Map backend ApiChatSession to frontend ChatSession type */
function mapApiSession(api: ApiChatSession): ChatSession {
  return {
    id: api.id,
    userId: api.user_id,
    title: api.title,
    model: 'gpt-4o',
    isPinned: false,
    messageCount: 0,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isGenerating: false,

  setActiveSession: (id) => {
    // Messages are local-only for now (no AI backend yet)
    set({ activeSessionId: id, messages: [] });
  },

  createNewChat: (title) => {
    const tempId = 'chat_' + Date.now();
    const tempSession: ChatSession = {
      id: tempId,
      userId: '',
      title: title || 'New Chat',
      model: 'gpt-4o',
      isPinned: false,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: [tempSession, ...state.sessions],
      activeSessionId: tempId,
      messages: [],
    }));

    // Create session in backend (async, update ID when done)
    chatService.createSession(title || 'New Chat').then((apiSession) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === tempId ? mapApiSession(apiSession) : s
        ),
        activeSessionId: state.activeSessionId === tempId ? apiSession.id : state.activeSessionId,
      }));
    }).catch((err) => {
      console.error('Failed to create chat session:', err);
    });

    return tempId;
  },

  sendMessage: (content) => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sessionId: activeSessionId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ messages: [...state.messages, userMsg], isGenerating: true }));

    // Mock AI response (no OpenAI integration yet)
    setTimeout(() => {
      const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
      const aiMsg: Message = {
        id: 'msg_' + (Date.now() + 1),
        sessionId: activeSessionId,
        role: 'assistant',
        content: response,
        citations: [
          {
            id: 'cit_' + Date.now(),
            messageId: 'msg_' + (Date.now() + 1),
            documentId: 'doc_001',
            documentTitle: 'Q3_Report.pdf',
            pageNumber: Math.floor(Math.random() * 40) + 1,
            relevanceScore: 0.92,
            fileType: 'pdf',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isGenerating: false,
        sessions: state.sessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, messageCount: s.messageCount + 2, lastMessageAt: new Date().toISOString(), title: s.messageCount === 0 ? content.slice(0, 40) + '...' : s.title }
            : s
        ),
      }));
    }, 1500 + Math.random() * 1000);
  },

  regenerateLastResponse: () => {
    const { messages, activeSessionId } = get();
    if (!activeSessionId) return;
    const lastAiIdx = messages.map((m) => m.role).lastIndexOf('assistant');
    if (lastAiIdx === -1) return;

    const updated = messages.slice(0, lastAiIdx);
    set({ messages: updated, isGenerating: true });

    setTimeout(() => {
      const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
      const aiMsg: Message = {
        id: 'msg_' + Date.now(),
        sessionId: activeSessionId,
        role: 'assistant',
        content: response,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ messages: [...state.messages, aiMsg], isGenerating: false }));
    }, 1500);
  },

  deleteSession: (id) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
      messages: state.activeSessionId === id ? [] : state.messages,
    }));
  },

  initChat: async () => {
    try {
      const apiSessions = await chatService.getSessions();
      const sessions = apiSessions.map(mapApiSession);
      set({ sessions });
      if (sessions.length > 0) {
        set({ activeSessionId: sessions[0].id, messages: [] });
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      set({ sessions: [] });
    }
  },
}));
