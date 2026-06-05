// DocuMind AI — Document Service (Mock)

import type { Document } from '@/types';
import { mockDocuments } from '@/lib/mockData';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    await delay(500);
    return mockDocuments;
  },

  async getDocument(id: string): Promise<Document | null> {
    await delay(300);
    return mockDocuments.find((d) => d.id === id) || null;
  },

  async uploadDocument(file: File): Promise<Document> {
    await delay(2000);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    return {
      id: 'doc_' + Date.now(), userId: 'usr_001', title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name, fileType: ext as Document['fileType'], fileSizeBytes: file.size,
      status: 'processing', pageCount: 0, chunkCount: 0, tags: [], metadata: {},
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
  },

  async deleteDocument(id: string): Promise<void> {
    await delay(500);
    console.log('Deleted document:', id);
  },

  async searchDocuments(query: string): Promise<Document[]> {
    await delay(400);
    const q = query.toLowerCase();
    return mockDocuments.filter((d) => d.title.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q)));
  },
};
