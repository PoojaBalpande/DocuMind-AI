'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';

export function useChat() {
  const store = useChatStore();

  useEffect(() => {
    if (store.sessions.length === 0) {
      store.initChat();
    }
  }, [store]);

  return {
    sessions: store.sessions,
    activeSessionId: store.activeSessionId,
    messages: store.messages,
    isGenerating: store.isGenerating,
    setActiveSession: store.setActiveSession,
    createNewChat: store.createNewChat,
    sendMessage: store.sendMessage,
    regenerateLastResponse: store.regenerateLastResponse,
    deleteSession: store.deleteSession,
  };
}
