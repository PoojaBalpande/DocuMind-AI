'use client';

import { create } from 'zustand';
import type { ChatSession, Message, Citation } from '@/types';
import { chatService, type ApiChatSession, type ApiCitation } from '@/services/chatService';
import { authService } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: Message[];
  isGenerating: boolean;
  abortController: AbortController | null;
  setActiveSession: (id: string) => void;
  createNewChat: (title?: string) => string;
  sendMessage: (content: string) => void;
  stopGeneration: () => void;
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
  abortController: null,

  setActiveSession: async (id) => {
    set({ activeSessionId: id, messages: [] });
    try {
      const history = await chatService.getMessages(id);
      set({ messages: history });
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
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

  sendMessage: async (content) => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;

    // Create and store AbortController
    const abortController = new AbortController();
    set({ abortController });

    const userMsg: Message = {
      id: 'msg_user_' + Date.now(),
      sessionId: activeSessionId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const aiMsgId = 'msg_ai_' + Date.now();
    const tempAiMsg: Message = {
      id: aiMsgId,
      sessionId: activeSessionId,
      role: 'assistant',
      content: '',
      citations: [],
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg, tempAiMsg],
      isGenerating: true,
    }));

    try {
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ session_id: activeSessionId, message: content }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No body stream reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';
      let citations: Citation[] = [];
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'citations') {
                citations = parsed.citations.map((cit: ApiCitation, idx: number) => ({
                  id: `cit_${aiMsgId}_${idx}`,
                  messageId: aiMsgId,
                  documentId: cit.document_id,
                  documentTitle: cit.document,
                  pageNumber: cit.page ?? undefined,
                  excerpt: cit.snippet,
                }));
              } else if (parsed.type === 'token') {
                accumulatedContent += parsed.token;
                chunkCount++;
                console.log(`[FRONTEND STREAM] Received chunk #${chunkCount}: "${parsed.token}"`);
                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === aiMsgId ? { ...m, content: accumulatedContent, citations } : m
                  ),
                }));
              }
            } catch (err) {
              console.error('Error parsing stream chunk:', err, trimmed);
            }
          }
        }
      }

      set({ isGenerating: false, abortController: null });
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, messageCount: s.messageCount + 2, lastMessageAt: new Date().toISOString(), title: s.messageCount === 0 ? content.slice(0, 40) + '...' : s.title }
            : s
        ),
      }));
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Failed to send message:', err);
        const errorMsgText = 'Error: I couldn\'t retrieve an answer from the documents.';
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === aiMsgId ? { ...m, content: errorMsgText } : m
          ),
        }));
      }
      set({ isGenerating: false, abortController: null });
    }
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isGenerating: false, abortController: null });
    }
  },

  regenerateLastResponse: async () => {
    const { messages, activeSessionId } = get();
    if (!activeSessionId) return;
    const lastAiIdx = messages.map((m) => m.role).lastIndexOf('assistant');
    if (lastAiIdx === -1) return;

    const updated = messages.slice(0, lastAiIdx);
    const lastUserMsg = updated.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) return;

    set({ messages: updated, isGenerating: true });

    try {
      const result = await chatService.sendMessage(activeSessionId, lastUserMsg.content);
      const aiMsg: Message = {
        id: 'msg_ai_' + Date.now(),
        sessionId: activeSessionId,
        role: 'assistant',
        content: result.answer,
        citations: result.sources.map((src, idx) => ({
          id: `cit_${Date.now()}_${idx}`,
          messageId: 'msg_ai_' + Date.now(),
          documentTitle: src.document,
          pageNumber: src.page || undefined,
        })),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ messages: [...state.messages, aiMsg], isGenerating: false }));
    } catch (err) {
      console.error('Failed to regenerate response:', err);
      set({ isGenerating: false });
    }
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
        const firstSessionId = sessions[0].id;
        set({ activeSessionId: firstSessionId, messages: [] });
        try {
          const history = await chatService.getMessages(firstSessionId);
          set({ messages: history });
        } catch (err) {
          console.error('Failed to load initial session messages:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      set({ sessions: [] });
    }
  },
}));
