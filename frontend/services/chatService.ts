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

export interface ApiCitation {
  document: string;
  document_id: string;
  page: number | null;
  snippet?: string;
}

export interface ApiMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: ApiCitation[] | null;
  created_at: string;
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

  async getMessages(sessionId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch chat history');
    }
    const apiMessages: ApiMessage[] = await res.json();
    return apiMessages.map((msg: ApiMessage) => ({
      id: msg.id,
      sessionId: msg.session_id,
      role: msg.role,
      content: msg.content,
      citations: msg.citations ? msg.citations.map((cit: ApiCitation, idx: number) => ({
        id: `cit_${msg.id}_${idx}`,
        messageId: msg.id,
        documentId: cit.document_id,
        documentTitle: cit.document,
        pageNumber: cit.page ?? undefined,
        excerpt: cit.snippet,
      })) : [],
      createdAt: msg.created_at,
    }));
  },

  async sendMessage(sessionId: string, content: string): Promise<{ answer: string; sources: { document: string; page: number | null }[] }> {
    const res = await fetch(`${API_BASE}/api/chat/ask`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ session_id: sessionId, message: content }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send message' }));
      throw new Error(err.detail || 'Failed to send message');
    }
    return res.json();
  },
};
