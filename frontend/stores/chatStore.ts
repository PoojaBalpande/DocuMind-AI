'use client';

import { create } from 'zustand';
import type { ChatSession, Message } from '@/types';
import { mockChatSessions, mockMessages, mockAIResponses } from '@/lib/mockData';

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

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isGenerating: false,

  setActiveSession: (id) => {
    set({ activeSessionId: id, messages: mockMessages[id] || [] });
  },

  createNewChat: (title) => {
    const newId = 'chat_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      userId: 'usr_001',
      title: title || 'New Chat',
      model: 'gpt-4o',
      isPinned: false,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: newId,
      messages: [],
    }));
    return newId;
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

    // Simulate AI response
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

  initChat: () => {
    set({ sessions: mockChatSessions });
    if (mockChatSessions.length > 0) {
      const firstId = mockChatSessions[0].id;
      set({ activeSessionId: firstId, messages: mockMessages[firstId] || [] });
    }
  },
}));
