'use client';

import { create } from 'zustand';
import type { ChatSession, Message, Citation } from '@/types';
import { chatService, type ApiChatSession, type ApiCitation } from '@/services/chatService';
import { authService } from '@/services/authService';
import { useSettingsStore } from '@/stores/settingsStore';

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
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  abortController: AbortController | null;
  retrievalScope: 'workspace' | 'current' | 'selected';
  selectedDocumentIds: string[];
  activeDocumentId: string | null;
  setRetrievalScope: (scope: 'workspace' | 'current' | 'selected') => void;
  setSelectedDocuments: (ids: string[]) => void;
  setActiveDocumentId: (id: string | null) => void;
  setActiveSession: (id: string) => Promise<void>;
  createNewChat: (title?: string) => string;
  sendMessage: (content: string) => void;
  stopGeneration: () => void;
  regenerateLastResponse: () => void;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  initChat: () => Promise<void>;
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

/**
 * Map a backend ApiCitation to a frontend Citation.
 * Shared by: sendMessage (stream), regenerateLastResponse, and getMessages (via chatService).
 * Centralizes all V8 metadata mapping (chunkId, documentId, relevanceScore, excerpt).
 */
function mapApiCitationToCitation(
  cit: ApiCitation,
  messageId: string,
  index: number,
): Citation {
  return {
    id: `cit_${messageId}_${index}`,
    messageId,
    chunkId: cit.chunk_id,
    documentId: cit.document_id,
    documentTitle: cit.document,
    pageNumber: cit.page ?? undefined,
    excerpt: cit.snippet,
    relevanceScore: cit.similarity_score,
  };
}

function mapDefaultScope(scope?: string): 'workspace' | 'current' | 'selected' {
  if (scope === 'current_document') return 'current';
  if (scope === 'selected_documents') return 'selected';
  return 'workspace';
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isGenerating: false,
  isLoadingSessions: false,
  isLoadingMessages: false,
  abortController: null,
  retrievalScope: 'workspace',
  selectedDocumentIds: [],
  activeDocumentId: null,

  setRetrievalScope: (scope) => set({ retrievalScope: scope }),
  setSelectedDocuments: (ids) => set({ selectedDocumentIds: ids }),
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),

  setActiveSession: async (id) => {
    const settings = useSettingsStore.getState().settings;
    const initialScope = mapDefaultScope(settings?.default_scope);
    set({
      activeSessionId: id,
      messages: [],
      isLoadingMessages: true,
      retrievalScope: initialScope,
      selectedDocumentIds: [],
      activeDocumentId: null,
    });
    try {
      const history = await chatService.getMessages(id);
      set({ messages: history });
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  createNewChat: (title) => {
    const settings = useSettingsStore.getState().settings;
    const initialScope = mapDefaultScope(settings?.default_scope);
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
      retrievalScope: initialScope,
      selectedDocumentIds: [],
      activeDocumentId: null,
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
      const { retrievalScope, selectedDocumentIds, activeDocumentId } = get();
      let documentIds: string[] | undefined = undefined;
      if (retrievalScope === 'current') {
        documentIds = activeDocumentId ? [activeDocumentId] : [];
      } else if (retrievalScope === 'selected') {
        documentIds = selectedDocumentIds;
      }

      type StreamRequestPayload = {
        session_id: string;
        message: string;
        document_ids?: string[];
      };

      const bodyPayload: StreamRequestPayload = {
        session_id: activeSessionId,
        message: content,
      };

      if (documentIds !== undefined) {
        bodyPayload.document_ids = documentIds;
      }

      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(bodyPayload),
        credentials: 'include',
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
                citations = parsed.citations.map((cit: ApiCitation, idx: number) =>
                  mapApiCitationToCitation(cit, aiMsgId, idx)
                );
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
      const { retrievalScope, selectedDocumentIds, activeDocumentId } = get();
      let documentIds: string[] | undefined = undefined;
      if (retrievalScope === 'current') {
        documentIds = activeDocumentId ? [activeDocumentId] : [];
      } else if (retrievalScope === 'selected') {
        documentIds = selectedDocumentIds;
      }

      const result = await chatService.sendMessage(activeSessionId, lastUserMsg.content, documentIds);
      const aiMessageId = 'msg_ai_' + Date.now();
      const aiMsg: Message = {
        id: aiMessageId,
        sessionId: activeSessionId,
        role: 'assistant',
        content: result.answer,
        citations: result.sources.map((src: ApiCitation, idx: number) =>
          mapApiCitationToCitation(src, aiMessageId, idx)
        ),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ messages: [...state.messages, aiMsg], isGenerating: false }));
    } catch (err) {
      console.error('Failed to regenerate response:', err);
      set({ isGenerating: false });
    }
  },

  deleteSession: async (id) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
      messages: state.activeSessionId === id ? [] : state.messages,
    }));
    try {
      await chatService.deleteSession(id);
    } catch (err) {
      console.error('Failed to delete chat session:', err);
      const { initChat } = get();
      initChat();
    }
  },

  renameSession: async (id, title) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, title } : s
      ),
    }));
    try {
      await chatService.renameSession(id, title);
    } catch (err) {
      console.error('Failed to rename chat session:', err);
      const { initChat } = get();
      initChat();
    }
  },

  initChat: async () => {
    // Load settings if they are not already loaded to get the user's default scope preference
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.settings) {
      await settingsStore.fetchSettings();
    }
    const initialScope = mapDefaultScope(settingsStore.settings?.default_scope);

    set({ isLoadingSessions: true });
    try {
      const apiSessions = await chatService.getSessions();
      const sessions = apiSessions.map(mapApiSession);
      set({ sessions });
      if (sessions.length > 0) {
        const firstSessionId = sessions[0].id;
        set({
          activeSessionId: firstSessionId,
          messages: [],
          isLoadingMessages: true,
          retrievalScope: initialScope,
          selectedDocumentIds: [],
          activeDocumentId: null,
        });
        try {
          const history = await chatService.getMessages(firstSessionId);
          set({ messages: history });
        } catch (err) {
          console.error('Failed to load initial session messages:', err);
        } finally {
          set({ isLoadingMessages: false });
        }
      } else {
        set({
          activeSessionId: null,
          messages: [],
          retrievalScope: initialScope,
          selectedDocumentIds: [],
          activeDocumentId: null,
        });
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      set({ sessions: [] });
    } finally {
      set({ isLoadingSessions: false });
    }
  },
}));
