'use client';

import { create } from 'zustand';
import type { Document } from '@/types';
import { documentService, type ApiDocument } from '@/services/documentService';

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
  error: string | null;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setSorting: (field: SortField, order: SortOrder) => void;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => void;
  applyFilters: () => void;
  initDocuments: () => void;
}

/** Map backend ApiDocument to frontend Document type */
function mapApiDocument(api: ApiDocument): Document {
  return {
    id: api.id,
    userId: api.user_id,
    title: api.original_filename.replace(/\.[^/.]+$/, ''),
    fileName: api.original_filename,
    fileType: 'pdf',
    fileSizeBytes: api.file_size,
    status: api.status as Document['status'],
    pageCount: undefined,
    chunkCount: 0,
    tags: [],
    metadata: {},
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  filteredDocuments: [],
  searchQuery: '',
  filterStatus: 'all',
  sortField: 'createdAt',
  sortOrder: 'desc',
  isUploading: false,
  error: null,

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

  uploadDocument: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      await documentService.uploadDocument(file);
      await get().initDocuments();
      set({ isUploading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      set({ isUploading: false, error: message });
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
      get().applyFilters();
    } catch (err) {
      console.error('Delete failed:', err);
    }
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

  initDocuments: async () => {
    try {
      const data = await documentService.getDocuments();
      const documents = data.documents.map(mapApiDocument);
      set({ documents });
      get().applyFilters();
    } catch (err) {
      console.error('Failed to load documents:', err);
      set({ documents: [] });
      get().applyFilters();
    }
  },
}));
