// DocuMind AI — Document Service (Real API)
// Connects to FastAPI backend

import { authService } from './authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export interface ApiDocument {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  async getDocuments(): Promise<{ documents: ApiDocument[]; total: number }> {
    const res = await fetch(`${API_BASE}/api/documents`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch documents');
    }
    return res.json();
  },

  async uploadDocument(file: File): Promise<{ id: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Delete failed' }));
      throw new Error(err.detail || 'Delete failed');
    }
  },
};
