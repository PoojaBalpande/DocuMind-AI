// DocuMind AI — Chat Service (Mock)

import type { ChatSession, Message } from '@/types';
import { mockChatSessions, mockMessages, mockAIResponses } from '@/lib/mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const chatService = {
  async getSessions(): Promise<ChatSession[]> {
    await delay(400);
    return mockChatSessions;
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    await delay(300);
    return mockMessages[sessionId] || [];
  },

  async sendMessage(sessionId: string, content: string): Promise<Message> {
    await delay(1500 + Math.random() * 1000);
    const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
    return {
      id: 'msg_' + Date.now(), sessionId, role: 'assistant', content: response,
      citations: [{ id: 'cit_' + Date.now(), messageId: 'msg_' + Date.now(), documentTitle: 'Q3_Report.pdf', pageNumber: Math.floor(Math.random() * 40) + 1, relevanceScore: 0.92, fileType: 'pdf' }],
      createdAt: new Date().toISOString(),
    };
  },

  async regenerateResponse(sessionId: string): Promise<Message> {
    await delay(1500);
    const response = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
    return { id: 'msg_' + Date.now(), sessionId, role: 'assistant', content: response, createdAt: new Date().toISOString() };
  },
};
