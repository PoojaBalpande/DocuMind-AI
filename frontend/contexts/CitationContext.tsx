'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Citation } from '@/types';

interface CitationContextValue {
  selectedCitation: Citation | null;
  isSidebarOpen: boolean;
  openCitation: (citation: Citation) => void;
  closeCitation: () => void;
}

const CitationContext = createContext<CitationContextValue | null>(null);

export function CitationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openCitation = useCallback((citation: Citation) => {
    // Store the element that triggered the open for focus restoration
    triggerRef.current = document.activeElement as HTMLElement | null;
    setSelectedCitation(citation);
    setIsSidebarOpen(true);
  }, []);

  const closeCitation = useCallback(() => {
    setIsSidebarOpen(false);
    // Restore focus to the element that opened the sidebar
    setTimeout(() => {
      triggerRef.current?.focus();
      triggerRef.current = null;
    }, 300); // match transition duration
  }, []);

  return (
    <CitationContext.Provider value={{ selectedCitation, isSidebarOpen, openCitation, closeCitation }}>
      {children}
    </CitationContext.Provider>
  );
}

export function useCitation(): CitationContextValue {
  const context = useContext(CitationContext);
  if (!context) {
    throw new Error('useCitation must be used within a CitationProvider');
  }
  return context;
}
