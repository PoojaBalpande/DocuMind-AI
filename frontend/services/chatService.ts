// DocuMind AI — Chat Service (Hybrid: Real sessions + Mock AI)
// Sessions backed by PostgreSQL, messages still use mock AI (no OpenAI yet)

import type { Message } from '@/types';
import { mockAIResponses } from '@/lib/mockData';
import { authService } from './authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export interface ApiChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const chatService = {
  async getSessions(): Promise<ApiChatSession[]> {
    const res = await fetch(`${API_BASE}/api/chat/sessions`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch chat sessions');
    }
    return res.json();
  },

  async createSession(title: string = 'New Chat'): Promise<ApiChatSession> {
    const res = await fetch(`${API_BASE}/api/chat/session`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      throw new Error('Failed to create chat session');
    }
    return res.json();
  },

  // ── Mock AI responses (no OpenAI integration yet) ──────────────

  async sendMessage(_sessionId: string, _content: string): Promise<Message> {
    // Simulate AI thinking delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
    return {
      id: 'msg_' + Date.now(),
      sessionId: _sessionId,
      role: 'assistant',
      content: response,
      citations: [
        {
          id: 'cit_' + Date.now(),
          messageId: 'msg_' + Date.now(),
          documentTitle: 'Q3_Report.pdf',
          pageNumber: Math.floor(Math.random() * 40) + 1,
          relevanceScore: 0.92,
          fileType: 'pdf',
        },
      ],
      createdAt: new Date().toISOString(),
    };
  },

  async regenerateResponse(sessionId: string): Promise<Message> {
    await new Promise((r) => setTimeout(r, 1500));
    const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
    return {
      id: 'msg_' + Date.now(),
      sessionId,
      role: 'assistant',
      content: response,
      createdAt: new Date().toISOString(),
    };
  },
};
