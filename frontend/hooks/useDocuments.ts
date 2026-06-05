'use client';

import { useEffect } from 'react';
import { useDocumentStore } from '@/stores/documentStore';

export function useDocuments() {
  const store = useDocumentStore();

  useEffect(() => {
    if (store.documents.length === 0) {
      store.initDocuments();
    }
  }, [store]);

  return {
    documents: store.filteredDocuments,
    allDocuments: store.documents,
    searchQuery: store.searchQuery,
    filterStatus: store.filterStatus,
    isUploading: store.isUploading,
    setSearchQuery: store.setSearchQuery,
    setFilterStatus: store.setFilterStatus,
    setSorting: store.setSorting,
    uploadDocument: store.uploadDocument,
    deleteDocument: store.deleteDocument,
  };
}
