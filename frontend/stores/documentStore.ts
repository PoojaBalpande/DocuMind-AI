'use client';

import { create } from 'zustand';
import type { Document } from '@/types';
import { mockDocuments } from '@/lib/mockData';

type SortField = 'title' | 'createdAt' | 'fileSizeBytes' | 'status';
type SortOrder = 'asc' | 'desc';

interface DocumentState {
  documents: Document[];
  filteredDocuments: Document[];
  searchQuery: string;
  filterStatus: string;
  sortField: SortField;
  sortOrder: SortOrder;
  isUploading: boolean;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setSorting: (field: SortField, order: SortOrder) => void;
  uploadDocument: (file: { name: string; size: number; type: string }) => Promise<void>;
  deleteDocument: (id: string) => void;
  applyFilters: () => void;
  initDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  filteredDocuments: [],
  searchQuery: '',
  filterStatus: 'all',
  sortField: 'createdAt',
  sortOrder: 'desc',
  isUploading: false,

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  setFilterStatus: (status) => {
    set({ filterStatus: status });
    get().applyFilters();
  },

  setSorting: (field, order) => {
    set({ sortField: field, sortOrder: order });
    get().applyFilters();
  },

  uploadDocument: async (file) => {
    set({ isUploading: true });
    await new Promise((r) => setTimeout(r, 2000));
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const fileType = (['pdf', 'docx', 'txt', 'md'].includes(ext) ? ext : 'pdf') as Document['fileType'];
    const newDoc: Document = {
      id: 'doc_' + Date.now(),
      userId: 'usr_001',
      title: file.name.replace(/\.[^/.]+$/, ''),
      fileName: file.name,
      fileType,
      fileSizeBytes: file.size,
      status: 'processing',
      pageCount: Math.floor(Math.random() * 50) + 5,
      chunkCount: 0,
      tags: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ documents: [newDoc, ...state.documents], isUploading: false }));
    get().applyFilters();
    // Simulate processing completion
    setTimeout(() => {
      set((state) => ({
        documents: state.documents.map((d) => d.id === newDoc.id ? { ...d, status: 'ready' as const, chunkCount: Math.floor(Math.random() * 200) + 20 } : d),
      }));
      get().applyFilters();
    }, 3000);
  },

  deleteDocument: (id) => {
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { documents, searchQuery, filterStatus, sortField, sortOrder } = get();
    let filtered = [...documents];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((d) => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
    set({ filteredDocuments: filtered });
  },

  initDocuments: () => {
    set({ documents: mockDocuments });
    get().applyFilters();
  },
}));
